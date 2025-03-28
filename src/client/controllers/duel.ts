import { Controller } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { source } from "@rbxts/vide";
import type { BaseID } from "@rbxts/id";

import { OnMessage } from "client/decorators";
import { Message, type MessageData } from "shared/messaging";
import { DeckDuelState } from "shared/classes/deck-duel-state";
import { maxCardsInHand } from "shared/constants";
import { type ClientDuelInfo, DuelPhase } from "shared/structs/duel";
import type { SpellCard } from "shared/structs/spell-card";
import type { DeckLinkedData } from "shared/structs/data/items/gear/deck";
import Log from "shared/log";

import type { UIController } from "./ui";
import type { CharacterController } from "./character";

const EMPTY_DECK_DATA: DeckLinkedData = {
  spellReferences: [],
  sideboardSpellReferences: []
};

@Controller()
export class DuelController {
  private current?: ClientDuelInfo;

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
        deck: new DeckDuelState(deckData ?? EMPTY_DECK_DATA),
        hand: source<SpellCard[]>([]),
        teamCount,
        opponentCount
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
    switch (phase) {
      case DuelPhase.Start: break;
      case DuelPhase.Planning:
        this.ui.enableDuelPlanning(this.current);
        break;
      case DuelPhase.Combat:
        this.ui.disableDuelPlanning();
        const chosenCard = this.current.state.deck.getChosenCard();
        if (chosenCard !== undefined) { // remove card from hand
          const hand = this.current.state.hand();
          hand.remove(hand.indexOf(chosenCard));
          this.current.state.hand(hand);
        }

        // TODO: tell server the chosen card
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
}