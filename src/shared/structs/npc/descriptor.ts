import type { BaseID } from "@rbxts/id";

import type { QuestDescriptor } from "../quests";

export const enum NpcID {
  HeadmasterHale,
  PrivatePike
}

export interface NpcDescriptor extends BaseID<NpcID> {
  readonly name: string;
  readonly title?: string;
  readonly portrait: string;
  readonly questsGiven: QuestDescriptor[];
}