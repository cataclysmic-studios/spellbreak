import type { DataType } from "@rbxts/flamework-binary-serializer";
import { MessageEmitter } from "@rbxts/tether";

export const messageEmitter = MessageEmitter.create<MessageData>();
messageEmitter.initialize();

export const enum Message {
  TOGGLE_MOVEMENT
}

export interface MessageData {
  [Message.TOGGLE_MOVEMENT]: boolean;
}