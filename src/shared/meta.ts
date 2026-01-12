import { callMethodOnDependencies } from "@rbxts/flamework-meta-utils";
import { messaging, type Message, type MessageData } from "./messaging";

export function OnServerMessage<Kind extends Message>(message: Kind) {
  return (ctor: object, _: string, descriptor: TypedPropertyDescriptor<(this: unknown, player: Player, data: MessageData[Kind]) => void>) => {
    messaging.server.on(message, (player, data) => callMethodOnDependencies(ctor, descriptor, player, data));
  };
}

export function OnClientMessage<Kind extends Message>(message: Kind) {
  return (ctor: object, _: string, descriptor: TypedPropertyDescriptor<(this: unknown, data: MessageData[Kind]) => void>) => {
    messaging.client.on(message, data => callMethodOnDependencies(ctor, descriptor, data));
  };
}