import { Controller } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { effect, source } from "@rbxts/vide";

import { OnMessage } from "client/decorators";
import { Message, type MessageData } from "shared/messaging";
import { ClientDuelDeckState } from "shared/classes/client-deck-duel-state";
import { assets, maxCardsInHand } from "shared/constants";
import { type ClientDuelInfo, DuelCirclePosition, DuelPhase } from "shared/structs/duel";
import type { SpellCard } from "shared/structs/spell-card";
import type { DeckLinkedData } from "shared/structs/data/items/gear/deck";
import Log from "shared/log";

import type { UIController } from "./ui";
import type { CharacterController } from "./character";
import { SpellTargetKind } from "shared/structs/spell";
import { getDescendantsOfType } from "@rbxts/instance-utility";

const EMPTY_DECK_DATA: DeckLinkedData = {
  spellReferences: [],
  sideboardSpellReferences: []
};

const SELECTION_AURA_HEIGHT = 7;
const OPPONENT_SELECTION_COLORS: Color3[] = [
  Color3.fromRGB(247, 64, 204),
  Color3.fromRGB(255, 56, 96),
  Color3.fromRGB(255, 196, 46),
  Color3.fromRGB(251, 255, 44)
];
const TEAM_SELECTION_COLORS: Color3[] = [
  Color3.fromRGB(154, 255, 21),
  Color3.fromRGB(10, 255, 182),
  Color3.fromRGB(82, 186, 255),
  Color3.fromRGB(137, 108, 255)
];

@Controller()
export class DuelController {
  private readonly selectionAuras: Model[] = [];
  private current?: ClientDuelInfo;
  private currentPhase?: DuelPhase;

  public constructor(
    private readonly ui: UIController,
    private readonly character: CharacterController
  ) { }

  /** @hidden */
  @OnMessage(Message.DuelInitializeClient)
  public initializeClient({ id, onOpposingTeam, teamCount, opponentCount }: MessageData[Message.DuelInitializeClient]): void {
    const model = this.getCircleModelByID(id);
    if (model === undefined)
      return Log.warn(`Failed to initialize duel on client - could not find duel circle model with ID ${id}`, ["duel controller"]);

    Log.info("Initialized duel on client");
    const deckData = this.character.getDeck();
    this.current = {
      id, onOpposingTeam, model,
      state: {
        deck: new ClientDuelDeckState(id, deckData ?? EMPTY_DECK_DATA),
        hand: source<SpellCard[]>([]),
        choosing: source(true),
        selectedCard: source<Maybe<SpellCard>>(),
        teamCount, opponentCount
      }
    };
  }

  /** @hidden */
  @OnMessage(Message.DuelCombatantAdded)
  public combatantAdded(isOpponent: boolean): void {
    if (this.current === undefined) return;
    this.current.state[isOpponent ? "opponentCount" : "teamCount"]++;
  }

  /** @hidden */
  @OnMessage(Message.DuelCombatantRemoved)
  public combatantRemoved(isOpponent: boolean): void {
    if (this.current === undefined) return;
    this.current.state[isOpponent ? "opponentCount" : "teamCount"]--;
  }

  /** @hidden */
  @OnMessage(Message.DuelPhaseChanged)
  public phaseChanged(phase: DuelPhase): void {
    if (this.current === undefined) return;
    Log.info("Duel phase changed: " + DuelPhase[phase]);

    const hand = this.current.state.hand();
    for (const drawnCard of this.current.state.deck.draw(maxCardsInHand - hand.size()))
      hand.push(drawnCard);

    this.current.state.hand(hand);
    this.currentPhase = phase;
    switch (phase) {
      case DuelPhase.Start: break;
      case DuelPhase.Planning:
        this.ui.enableDuelPlanning(this.current, [() => this.selectCardSideEffect()]);
        break;
      case DuelPhase.Combat:
        this.ui.disableDuelPlanning();
        const chosenCard = this.current.state.deck.getChosenCard();
        if (chosenCard !== undefined) { // remove card from hand
          const hand = this.current.state.hand();
          hand.remove(hand.indexOf(chosenCard));
          this.current.state.hand(hand);
        }
        break;
      case DuelPhase.End:
        this.current = undefined;
        break;
    }
  }

  public getCircleModelByID(id: number): Maybe<DuelCircleModel> {
    return World.DuelCircles.GetChildren()
      .find((duelCircle): duelCircle is DuelCircleModel => duelCircle.GetAttribute("ID") === id);
  }

  public getCurrentInfo(): Maybe<ClientDuelInfo> {
    return this.current;
  }

  private selectCardSideEffect(): void {
    if (this.current === undefined) return;
    if (this.currentPhase !== DuelPhase.Planning) return;
    const card = this.current.state.selectedCard();
    if (card === undefined || !card.spell.hasTarget)
      return this.cleanupSelectionAuras();

    if (this.selectionAuras.size() > 0)
      this.cleanupSelectionAuras();

    const targetsTeam = card.spell.targetKind === SpellTargetKind.SingleTeam;
    const targetCount = targetsTeam ? this.current.state.teamCount : this.current.state.opponentCount;
    for (const i of $range(1, targetCount))
      this.createSelectionAura(!targetsTeam, i - 1);
  }

  private createSelectionAura(targetsOpponent: boolean, circlePosition: DuelCirclePosition): void {
    if (this.current === undefined) return;
    const selectionColors = targetsOpponent
      ? OPPONENT_SELECTION_COLORS
      : TEAM_SELECTION_COLORS;

    const aura = assets.duel.selectionTarget.Clone();
    const useTeamPositions = this.current.onOpposingTeam === targetsOpponent;
    const positions = useTeamPositions
      ? this.current.model.teamPositions
      : this.current.model.opponentPositions;

    const positionPart = positions[tostring(circlePosition + 1) as never] as Part;
    const pivot = positionPart.GetPivot();
    const newPivot = pivot
      .add(Vector3.yAxis.mul(SELECTION_AURA_HEIGHT / 2))
      .mul(CFrame.Angles(0, 0, math.rad(90)));

    aura.PivotTo(newPivot);
    aura.Parent = World.TargetSelectionStorage;
    aura.SetAttribute("DuelCirclePosition", circlePosition);
    aura.SetAttribute("OpposingTeam", !useTeamPositions);
    this.selectionAuras.push(aura);

    const color = selectionColors[circlePosition];
    for (const decal of getDescendantsOfType(aura, "Decal"))
      decal.Color3 = color;
  }

  private cleanupSelectionAuras(): void {
    this.selectionAuras.forEach(aura => aura.Destroy());
    this.selectionAuras.clear();
  }
}