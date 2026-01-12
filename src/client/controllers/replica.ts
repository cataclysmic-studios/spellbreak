import { Controller } from "@flamework/core";
import repr from "@rbxts/repr";

import { Message, type MessageData } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { applyPatch } from "shared/utility/data";
import Log from "shared/log";

@Controller()
export class ReplicaController {
  public data: Readonly<PlayerData> = {} as never;

  @OnClientMessage(Message.Data_Updated)
  public onUpdate(diff: MessageData[Message.Data_Updated]): void {
    this.data = applyPatch(this.data, diff as never);
    Log.info("Diff:\n" + repr(diff));
  }
}