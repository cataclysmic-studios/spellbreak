import type { BaseID } from "@rbxts/id";

import type { NpcID } from "./npc/descriptor";
import type { EnemyID } from "./enemy/descriptor";
import type { DialogID } from "./npc/dialog";
import type { ZoneID } from "./zone";

export const enum QuestID {
  WC_1,
  WC_2,
}

export const enum QuestGoalAction {
  Talk = "Talk to",
  Explore = "Go to",
  Defeat = "Defeat",
}

export type QuestGoalTarget = NpcID | EnemyID | ZoneID; // TODO: quest collectibles, interactables, etc.

interface BaseQuestGoal {
  readonly action: QuestGoalAction;
  readonly target: QuestGoalTarget;
  readonly completionDialog?: DialogID;
}

export interface TalkQuestGoal extends BaseQuestGoal {
  readonly action: QuestGoalAction.Talk;
  readonly target: NpcID;
  readonly completionDialog: NonNullable<BaseQuestGoal["completionDialog"]>;
}

export interface ExploreQuestGoal extends BaseQuestGoal {
  readonly action: QuestGoalAction.Explore;
  readonly target: ZoneID;
}

export interface DefeatQuestGoal extends BaseQuestGoal {
  readonly action: QuestGoalAction.Defeat;
  readonly target: EnemyID;
}

export type QuestGoal = TalkQuestGoal | ExploreQuestGoal | DefeatQuestGoal;

export const enum QuestRewardKind {
  Gold,
  XP
}

interface BaseQuestReward {
  readonly kind: QuestRewardKind;
}

interface NumericQuestReward extends BaseQuestReward {
  readonly kind: QuestRewardKind.Gold | QuestRewardKind.XP;
  readonly amount: number;
}

type QuestReward = NumericQuestReward;

export interface QuestDescriptor extends BaseID<QuestID> {
  readonly name: string;
  readonly requiredLevel: number;
  readonly main: boolean;
  readonly prequests?: QuestID[];
  readonly goals: QuestGoal[];
  readonly dialog: DialogID;
  readonly rewards: QuestReward[];
}

export interface QuestInfo {
  readonly questID: QuestID;
  readonly goalIndex: number;
}