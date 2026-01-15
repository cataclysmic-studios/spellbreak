import { Controller } from "@flamework/core";
import Signal from "@rbxts/lemon-signal";

import { Message, type MessageData } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { applyPatch } from "shared/utility/data";
import type { PlayerData } from "shared/structs/data";

@Controller({ loadOrder: -1 })
export class ReplicaController {
  public readonly updated = new Signal;
  public data: Readonly<PlayerData> = {} as never;

  /** @hidden */
  @OnClientMessage(Message.Data_Updated)
  public onUpdate(diff: MessageData[Message.Data_Updated]): void {
    this.data = applyPatch(this.data, diff as never);
    print(diff)
    this.updated.Fire();
  }
}