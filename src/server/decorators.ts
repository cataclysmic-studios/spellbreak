import { callMethodOnDependencies } from "@rbxts/flamework-meta-utils";

import { Message, type MessageData, messaging } from "shared/messaging";

/** @metadata reflect identifier */
export function OnMessage<Kind extends Message>(message: Kind) {
  return (ctor: object, propertyKey: string, descriptor: TypedPropertyDescriptor<(this: unknown, player: Player, data: MessageData[Kind]) => void>) => {
    messaging.onServerMessage(message, (player, data) => callMethodOnDependencies(ctor, descriptor, player, data));
  };
}