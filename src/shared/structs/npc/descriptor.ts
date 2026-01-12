import type { QuestDescriptor } from "../quests";

export const enum NpcID {
  HeadmasterHale
}

export interface NpcDescriptor {
  readonly id: NpcID;
  readonly name: string;
  readonly title?: string;
  readonly questsGiven: QuestDescriptor[];
}