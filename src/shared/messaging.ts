import { MessageEmitter } from "@rbxts/tether";
import type { Packed, u8 } from "@rbxts/serio";

import type { Diff, PlayerData } from "./structs/data";
import type { TransitionPosePacket } from "./structs/packets";

export const messaging = MessageEmitter.create<MessageData>();

export const enum Message {
  // Server -> Client
  Movement_Toggle,
  Camera_SetPose,
  Camera_TransitionPose,
  Data_Updated

  // Client -> Server
}

export interface MessageData {
  [Message.Movement_Toggle]: boolean;
  [Message.Camera_SetPose]: u8; // pose kind
  [Message.Camera_TransitionPose]: TransitionPosePacket;
  [Message.Data_Updated]: Packed<Diff<PlayerData>>;
}