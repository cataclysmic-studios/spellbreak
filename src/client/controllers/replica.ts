import { Controller } from "@flamework/core";
import repr from "@rbxts/repr";

import { Message, type MessageData } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { applyPatch } from "shared/utility/data";
import type { PlayerData } from "shared/structs/data";
import Log from "shared/log";
import Signal from "@rbxts/lemon-signal";

@Controller({ loadOrder: -1 })
export class ReplicaController {
  public readonly updated = new Signal;
  public data: Readonly<PlayerData> = {} as never;
  public loaded = false;

  /** @hidden */
  @OnClientMessage(Message.Data_Updated)
  public onUpdate(diff: MessageData[Message.Data_Updated]): void {
    if (!this.loaded)
      this.loaded = true;

    this.data = applyPatch(this.data, diff as never);
    this.updated.Fire();
    Log.info("Diff:\n" + repr(diff));
  }
}