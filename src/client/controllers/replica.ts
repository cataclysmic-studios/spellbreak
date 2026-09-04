import { Controller, type OnStart } from "@flamework/core";
import Signal from "@rbxts/lemon-signal";

import { Message, messaging, type MessageData } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { applyPatch } from "shared/utility/data";
import type { PlayerData } from "shared/structs/data";

@Controller({ loadOrder: -1 })
export class ReplicaController implements OnStart {
  public readonly updated = new Signal;
  public data: Readonly<PlayerData> = {} as never;

  public onStart(): void {
    // @OnClientMessage listeners are bound at module-require time, before any
    // controller's onStart runs, so it's safe to signal readiness here without
    // racing the server's initial data send.
    messaging.server.emit(Message.Client_Ready);
  }

  /** @hidden */
  @OnClientMessage(Message.Data_Updated)
  public onUpdate(diff: MessageData[Message.Data_Updated]): void {
    this.data = applyPatch(this.data, diff as never);
    this.updated.Fire();
  }
}