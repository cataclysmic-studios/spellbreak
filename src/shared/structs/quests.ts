import type { BaseID } from "@rbxts/id";

export const enum QuestID {
  WC_1
}

export interface QuestDescriptor extends BaseID<QuestID> {
  readonly name: string;
  readonly requiredLevel: number;
  readonly main: boolean;
  readonly prequests: QuestDescriptor[];
}