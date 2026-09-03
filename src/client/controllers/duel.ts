import { Controller } from "@flamework/core";
import { source } from "@rbxts/vide";

import { Message, type MessageData } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { CameraPoseKind } from "shared/structs/camera";
import type { ClientDuelInfo } from "shared/structs/duel";
import type { SpellCard } from "shared/structs/spell/card";
import { getSpellCardFromReferenceData } from "shared/utility/spell";
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
        choosing: source(true),
        selectedCard: source<Maybe<SpellCard>>(undefined),
        opponentCount: packet.opponentCount,
        teamCount: packet.teamCount
      }
    };

    currentDuel(info);
  }

  /** @hidden */
  @OnClientMessage(Message.Duel_BeginCasting)
  public onBeginCasting(id: number): void {
    const info = currentDuel();
    if (info === undefined || info.id !== id) return;

    this.ui.hideDuelPlanning();
  }
}
