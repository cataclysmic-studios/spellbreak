import { MessageEmitter } from "@rbxts/tether";
import type { Packed, u8 } from "@rbxts/serio";

import type { CompleteGoalPacket, PickUpQuestPacket, TransitionPosePacket } from "./structs/packets";
import type { PlayerDataSchema, Diff } from "./structs/data/serialization";

export const messaging = MessageEmitter.create<MessageData>();

export const enum Message {
  // Server -> Client
  Movement_Toggle,
  Camera_SetPose,
  Camera_TransitionPose,
  Data_Updated,
  Hydrate_NPCs,

  // Client -> Server
  Quest_PickUp,
  Quest_CompleteGoal,
}

export interface MessageData {
  [Message.Movement_Toggle]: boolean;
  [Message.Camera_SetPose]: u8; // pose kind
  [Message.Camera_TransitionPose]: TransitionPosePacket;
  [Message.Data_Updated]: Packed<Diff<PlayerDataSchema>>;
  [Message.Hydrate_NPCs]: Set<u8>;
  [Message.Quest_PickUp]: PickUpQuestPacket;
  [Message.Quest_CompleteGoal]: CompleteGoalPacket;
}