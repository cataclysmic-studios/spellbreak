import type { DataType } from "@rbxts/flamework-binary-serializer";
import { MessageEmitter } from "@rbxts/tether";

export const messaging = MessageEmitter.create<MessageData>();

export const enum Message {
  ToggleMovement
}

export interface MessageData {
  [Message.ToggleMovement]: boolean;
}