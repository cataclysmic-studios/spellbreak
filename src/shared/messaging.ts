import { MessageEmitter, type MiddlewareContext } from "@rbxts/tether";
import type { Packed, u8 } from "@rbxts/serio";

import { fixNumericKeys } from "./utility/data";
import type {
  CompleteGoalPacket, DuelCastResolvedPacket, DuelChoiceMadePacket, DuelEndedPacket,
  DuelNextRoundPacket, DuelSideboardDrawnPacket, DuelStartPacket, PickUpQuestPacket, TransitionPosePacket
} from "./structs/packets";
import type { PlayerDataSchema, Diff } from "./structs/data/serialization";
import type { QuestID } from "./structs/quests";
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
  Dehydrate_NPCs,
  Duel_Start,
  Duel_BeginCasting,
  Duel_CastResolved,
  Duel_NextRound,
  Duel_Ended,
  Duel_SideboardDrawn,
  Zone_Transferring,
  Zone_Entered,

  // Client -> Server
  Quest_PickUp,
  Quest_CompleteGoal,
  Quest_Select,
  Duel_ChoiceMade,
  Duel_DrawSideboard,
  Client_Ready,
}

export interface MessageData {
  [Message.Movement_Toggle]: boolean;
  [Message.Camera_SetPose]: u8; // pose kind
  [Message.Camera_TransitionPose]: TransitionPosePacket;
  [Message.Data_Updated]: Packed<Diff<PlayerDataSchema>>;
  [Message.Hydrate_NPCs]: Set<u8>;
  [Message.Dehydrate_NPCs]: Set<u8>;
  [Message.Duel_Start]: DuelStartPacket;
  [Message.Duel_BeginCasting]: u8; // duel id
  [Message.Duel_CastResolved]: DuelCastResolvedPacket;
  [Message.Duel_NextRound]: DuelNextRoundPacket;
  [Message.Duel_Ended]: DuelEndedPacket;
  [Message.Duel_SideboardDrawn]: DuelSideboardDrawnPacket;
  [Message.Zone_Transferring]: u8; // destination zone id
  [Message.Zone_Entered]: u8; // the player's new current zone id
  [Message.Quest_PickUp]: PickUpQuestPacket;
  [Message.Quest_CompleteGoal]: CompleteGoalPacket;
  [Message.Quest_Select]: QuestID;
  [Message.Duel_ChoiceMade]: DuelChoiceMadePacket;
  [Message.Duel_DrawSideboard]: u8; // duel id
  [Message.Client_Ready]: undefined;
}