import { Controller } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { source } from "@rbxts/vide";
import type { BaseID } from "@rbxts/id";

import { OnMessage } from "client/decorators";
import { Message, type MessageData } from "shared/messaging";
import { DuelPhase } from "shared/structs/duel";
import { DeckDuelState } from "client/classes/deck-duel-state";
import type { SpellCard } from "shared/structs/spell-card";
import type { DeckLinkedData } from "shared/structs/data/items/gear/deck";
import Log from "shared/log";

import type { UIController } from "./ui";
import type { CharacterController } from "./character";

export interface ClientDuelInfo extends BaseID<number> {
  readonly model: DuelCircleModel;
  readonly onOpposingTeam: boolean;
  readonly deckState: DeckDuelState;
}

const EMPTY_DECK_DATA: DeckLinkedData = {
  spellReferences: [],
  sideboardSpellReferences: []
};

@Controller()
export class DuelController {
  private readonly hand = source<SpellCard[]>([]);
  private current?: ClientDuelInfo;

  public constructor(
    private readonly ui: UIController,
    private readonly character: CharacterController
  ) { }

  /** @hidden */
  @OnMessage(Message.DuelInitializeClient)
  public initializeClient({ id, onOpposingTeam }: MessageData[Message.DuelInitializeClient]): void {
    const model = this.getCircleModelByID(id);
    if (model === undefined)
      return Log.warn(`Failed to initialize duel on client - could not find duel circle model with ID ${id}`, ["duel controller"]);

    const deckData = this.character.getDeck();
    this.current = {
      id, onOpposingTeam, model,
      deckState: new DeckDuelState(deckData ?? EMPTY_DECK_DATA)
    };
  }

  /** @hidden */
  @OnMessage(Message.DuelPhaseChanged)
  public duelPhaseChanged(phase: DuelPhase): void {
    if (this.current === undefined) return;
    Log.info("Duel phase changed: " + DuelPhase[phase]);

    const hand = this.hand();
    for (const drawnCard of this.current.deckState.draw(7 - hand.size()))
      hand.push(drawnCard);

    this.hand(hand);
    switch (phase) {
      case DuelPhase.Start: break;
      case DuelPhase.Planning:
        this.ui.enableBattlePlanning(this.hand);
        break;
      case DuelPhase.Combat:
        this.ui.disableBattlePlanning();
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