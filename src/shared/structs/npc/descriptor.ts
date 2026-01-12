import type { QuestDescriptor } from "../quests";

export interface NpcDescriptor {
  readonly name: string;
  readonly title?: string;
  readonly questsGiven: QuestDescriptor[];
}