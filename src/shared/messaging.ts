import type { DataType } from "@rbxts/flamework-binary-serializer";
import { MessageEmitter } from "@rbxts/tether";

export const messaging = MessageEmitter.create<MessageData>();

export const enum Message {
  // Server -> Client
  Movement_Toggle,
  Camera_SetPose,
  Camera_TransitionPose,

  // Client -> Server
}

export interface MessageData {
  [Message.Movement_Toggle]: boolean;
  [Message.Camera_SetPose]: DataType.u8; // pose kind
  [Message.Camera_TransitionPose]: {
    readonly poseKind: DataType.u8;
    readonly duration: DataType.f32;
  }
}