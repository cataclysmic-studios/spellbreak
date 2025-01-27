import { MessageEmitter } from "shared/structs/messages/emitter";
import { MessageKind } from "shared/structs/messages/kind";

MessageEmitter.initialize();
MessageEmitter.emitServer(MessageKind.TEST, { foo: "bar", x: 123 });