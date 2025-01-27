import { callMethodOnDependency } from "@rbxts/flamework-meta-utils";

import { MessageEmitter } from "shared/structs/messages/emitter";
import type { MessageData } from "shared/structs/messages/data";
import type { MessageKind } from "shared/structs/messages/kind";

/** @metadata reflect identifier flamework:parameters */
export function OnMessage<Kind extends MessageKind>(message: Kind) {
  return (ctor: object, propertyKey: string, descriptor: TypedPropertyDescriptor<(this: unknown, player: Player, data: MessageData[Kind]) => void>) => {
    MessageEmitter.onServerMessage(message, (player, data) => callMethodOnDependency(ctor, descriptor, player, data));
  };
}