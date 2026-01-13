import type { BaseID } from "@rbxts/id";

import type { NpcID } from "./npc/descriptor";
import type { EnemyID } from "./enemy/descriptor";
import type { DialogID } from "./npc/dialog";

export const enum QuestID {
  WC_1,
  WC_2,
}

export const enum QuestGoalAction {
  Talk = "Talk to",
  Go = "Go to",
}

export type QuestGoalTarget = NpcID | EnemyID | string; // TODO: quest collectibles, interactables, locations, etc.

interface BaseQuestGoal {
  readonly action: QuestGoalAction;
  readonly target: QuestGoalTarget;
  readonly location: string;
}

export type TalkQuestGoal = BaseQuestGoal & {
  readonly action: QuestGoalAction.Talk;
  readonly dialog: DialogID;
}

export type QuestGoal = BaseQuestGoal & (
  | TalkQuestGoal
  | {
    readonly action: Exclude<QuestGoalAction, QuestGoalAction.Talk>;
  });

export interface QuestDescriptor extends BaseID<QuestID> {
  readonly name: string;
  readonly requiredLevel: number;
  readonly main: boolean;
  readonly prequests?: QuestID[];
  readonly goals: QuestGoal[];
  readonly dialog: DialogID;
}