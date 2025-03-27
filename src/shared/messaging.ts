import type { DataType } from "@rbxts/flamework-binary-serializer";
import type { BaseID } from "@rbxts/id";
import { MessageEmitter } from "@rbxts/tether";

export const messaging = MessageEmitter.create<MessageData>();

export const enum Message {
  // Server -> Client
  ToggleMovement,
  SetCameraPose,
  TransitionCameraPose,
  DuelInitializeClient,
  DuelPhaseChanged,

  // Client -> Server
}

export interface MessageData {
  [Message.ToggleMovement]: boolean;
  [Message.SetCameraPose]: DataType.u8;
  [Message.TransitionCameraPose]: {
    readonly poseKind: DataType.u8;
    readonly duration: DataType.f32;
  }

  // dueling
  [Message.DuelInitializeClient]: BaseID<DataType.u8> & {
    readonly onOpposingTeam: boolean;
  };
  [Message.DuelPhaseChanged]: DataType.u8;
}