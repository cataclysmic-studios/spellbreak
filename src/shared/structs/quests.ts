import type { BaseID } from "@rbxts/id";

import type { NpcID } from "./npc/descriptor";
import type { EnemyID } from "./enemy/descriptor";
import type { DialogID } from "./npc/dialog";

export const enum QuestID {
  WC_1
}

export const enum QuestGoalAction {
  Talk = "Talk to"
}

export type QuestGoalTarget = NpcID | EnemyID; // TODO: quest collectibles, interactables, etc.

interface QuestGoal {
  readonly action: QuestGoalAction;
  readonly target: QuestGoalTarget;
  readonly location: string;
  readonly dialog: DialogID;
}

export interface QuestDescriptor extends BaseID<QuestID> {
  readonly name: string;
  readonly requiredLevel: number;
  readonly main: boolean;
  readonly prequests?: QuestDescriptor[];
  readonly goals: QuestGoal[];
}