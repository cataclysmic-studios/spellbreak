import { QuestGoalAction, QuestRewardKind, type TalkQuestGoal, type ExploreQuestGoal, type DefeatQuestGoal, type QuestReward } from "shared/structs/quests";
import type { NpcID } from "shared/structs/npc/descriptor";
import type { DialogID } from "shared/structs/npc/dialog";
import type { EnemyID } from "shared/structs/enemy/descriptor";
import type { ZoneID } from "shared/structs/zone";

/**
 * Terse constructors for `QuestDescriptor.goals`/`rewards` entries, so quest
 * data files don't drown in `{ action: ..., target: ... }` boilerplate. Kept
 * in their own file (rather than `shared/utility/quests.ts`) because every
 * quest data file is `require`'d *by* `quests.ts` at load time - importing
 * these from `quests.ts` itself would make that a circular require.
 */
export function talkGoal(target: NpcID, completionDialog: DialogID): TalkQuestGoal {
  return { action: QuestGoalAction.Talk, target, completionDialog };
}

export function exploreGoal(target: ZoneID): ExploreQuestGoal {
  return { action: QuestGoalAction.Explore, target };
}

export function defeatGoal(target: EnemyID): DefeatQuestGoal {
  return { action: QuestGoalAction.Defeat, target };
}

export function goldReward(amount: number): QuestReward {
  return { kind: QuestRewardKind.Gold, amount };
}

export function xpReward(amount: number): QuestReward {
  return { kind: QuestRewardKind.XP, amount };
}
