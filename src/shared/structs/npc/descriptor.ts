import type { BaseID } from "@rbxts/id";

import type { QuestID } from "../quests";
import type { ZoneID } from "../zone";

export const enum NpcID {
  HeadmasterHale,
  PrivatePike
}

export interface NpcDescriptor extends BaseID<NpcID> {
  readonly name: string;
  readonly title?: string;
  readonly portrait: string;
  readonly questsGiven: QuestID[];
  readonly zone: ZoneID;
  /** Where this NPC's model is placed when its zone spawns it in. */
  readonly spawnCFrame: CFrame;
}