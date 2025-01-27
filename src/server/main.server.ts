import { MessageEmitter } from "shared/structs/messages/emitter";
import { MessageKind } from "shared/structs/messages/kind";

MessageEmitter.initialize();
MessageEmitter.onServerMessage(MessageKind.TEST, (player, data) => {
  print(player, "sent", data, "via TEST message");
});