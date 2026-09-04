import { MessageEmitter, type MiddlewareContext } from "@rbxts/tether";
import type { Packed, u8 } from "@rbxts/serio";

import { fixNumericKeys } from "./utility/data";
import type { CompleteGoalPacket, DuelChoiceMadePacket, DuelStartPacket, PickUpQuestPacket, TransitionPosePacket } from "./structs/packets";
import type { PlayerDataSchema, Diff } from "./structs/data/serialization";
import Log from "./log";

export const messaging = MessageEmitter.create<MessageData>();
messaging.middleware.onRequestDropped((message, reason) => Log.warn(`Dropped message ${message}: ${reason}`));
messaging.middleware
  .useClientReceive(Message.Data_Updated, (ctx: MiddlewareContext<MessageData[Message.Data_Updated]>) => {
    ctx.data = fixNumericKeys(ctx.data);
  });

export const enum Message {
  // Server -> Client
  Movement_Toggle,
  Camera_SetPose,
  Camera_TransitionPose,
  Data_Updated,
  Hydrate_NPCs,
  Duel_Start,
  Duel_BeginCasting,
  Zone_Transferring,

  // Client -> Server
  Quest_PickUp,
  Quest_CompleteGoal,
  Duel_ChoiceMade,
}

export interface MessageData {
  [Message.Movement_Toggle]: boolean;
  [Message.Camera_SetPose]: u8; // pose kind
  [Message.Camera_TransitionPose]: TransitionPosePacket;
  [Message.Data_Updated]: Packed<Diff<PlayerDataSchema>>;
  [Message.Hydrate_NPCs]: Set<u8>;
  [Message.Duel_Start]: DuelStartPacket;
  [Message.Duel_BeginCasting]: u8; // duel id
  [Message.Zone_Transferring]: u8; // destination zone id
  [Message.Quest_PickUp]: PickUpQuestPacket;
  [Message.Quest_CompleteGoal]: CompleteGoalPacket;
  [Message.Duel_ChoiceMade]: DuelChoiceMadePacket;
}