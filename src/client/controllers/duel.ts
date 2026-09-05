import { Controller } from "@flamework/core";
import { source } from "@rbxts/vide";

import { Message, type MessageData } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { CameraPoseKind } from "shared/structs/camera";
import { SpellCardKind, type SpellCard } from "shared/structs/spell/card";
import type { ClientDuelInfo, DuelChoiceTarget } from "shared/structs/duel";
import type { SpellReference } from "shared/structs/data/reference/spell";
import { getSpellCardFromReferenceData, getSpellFromReference } from "shared/utility/spell";
import { currentDuel } from "client/state/duel";

import type { CameraController } from "./camera";
import type { UIController } from "./ui";

@Controller()
export class DuelController {
  public constructor(
    private readonly camera: CameraController,
    private readonly ui: UIController
  ) {
    this.camera.transitionCompleted.Connect(kind => {
      if (kind !== CameraPoseKind.DuelPlanning) return;

      const info = currentDuel();
      if (info === undefined) return;

      this.ui.showDuelPlanning(info);
    });
  }

  /** @hidden */
  @OnClientMessage(Message.Duel_Start)
  public onDuelStart(packet: MessageData[Message.Duel_Start]): void {
    const info: ClientDuelInfo = {
      id: packet.id,
      model: packet.model,
      onOpposingTeam: packet.onOpposingTeam,
      firstTurnOnTeam: packet.firstTurnOnTeam,
      state: {
        hand: source<SpellCard[]>(packet.hand.map(getSpellCardFromReferenceData)),
        sideboardCount: source(packet.sideboardCount),
        choosing: source(true),
        selectedCard: source<Maybe<SpellCard>>(undefined),
        chosenSpellReference: source<Maybe<SpellReference>>(undefined),
        chosenTarget: source<Maybe<DuelChoiceTarget>>(undefined),
        pipValue: source(packet.pipValue),
        opponentCount: packet.opponentCount,
        teamCount: packet.teamCount
      }
    };

    currentDuel(info);
    this.ui.beginDuel();
  }

  /** @hidden */
  @OnClientMessage(Message.Duel_BeginCasting)
  public onBeginCasting(id: number): void {
    const info = currentDuel();
    if (info === undefined || info.id !== id) return;

    this.ui.hideDuelPlanning();
  }

  /** The server approved a sideboard draw - adds the treasure card to the hand and syncs the remaining sideboard count. */
  @OnClientMessage(Message.Duel_SideboardDrawn)
  public onSideboardDrawn({ id, spellReference, sideboardRemaining }: MessageData[Message.Duel_SideboardDrawn]): void {
    const info = currentDuel();
    if (info === undefined || info.id !== id) return;

    const treasureCard: SpellCard & { justDrawn: boolean } = {
      kind: SpellCardKind.Treasure,
      spell: getSpellFromReference(spellReference),
      justDrawn: true
    };
    const currentHand = info.state.hand();
    currentHand.unshift(treasureCard);
    info.state.hand(currentHand);
    info.state.sideboardCount(sideboardRemaining);
  }

  /** @hidden */
  @OnClientMessage(Message.Duel_NextRound)
  public onNextRound({ id, pipValue }: MessageData[Message.Duel_NextRound]): void {
    const info = currentDuel();
    if (info === undefined || info.id !== id) return;

    info.state.pipValue(pipValue);
    info.state.choosing(true);
  }

  /** @hidden */
  @OnClientMessage(Message.Duel_Ended)
  public onDuelEnded({ id }: MessageData[Message.Duel_Ended]): void {
    const info = currentDuel();
    if (info === undefined || info.id !== id) return;

    currentDuel(undefined);
    this.ui.endDuel();
  }
}
