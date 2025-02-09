import { callMethodOnDependency } from "@rbxts/flamework-meta-utils";

import { MessageEmitter } from "shared/structs/message/emitter";
import type { MessageData } from "shared/structs/message/data";
import type { Message } from "shared/structs/message";

/** @metadata reflect identifier flamework:parameters */
export function OnMessage<Kind extends Message>(message: Kind) {
  return (ctor: object, propertyKey: string, descriptor: TypedPropertyDescriptor<(this: unknown, player: Player, data: MessageData[Kind]) => void>) => {
    MessageEmitter.onServerMessage(message, (player, data) => callMethodOnDependency(ctor, descriptor, player, data));
  };
}