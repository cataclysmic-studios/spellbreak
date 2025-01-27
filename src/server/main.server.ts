import { OnMessage } from "./decorators";
import { MessageEmitter } from "shared/structs/messages/emitter";
import { MessageKind } from "shared/structs/messages/kind";
import type { TestMessageData } from "shared/structs/messages/data";

MessageEmitter.initialize();
export class Server {
  @OnMessage(MessageKind.TEST)
  public onTestMessage(player: Player, data: TestMessageData): void {
    print(player, "sent", data, "via TEST message");
  }
}