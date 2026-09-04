import { DialogID } from "shared/structs/npc/dialog";
import { QuestGoalAction, QuestID, QuestRewardKind, type QuestDescriptor } from "shared/structs/quests";
import { EnemyID } from "shared/structs/enemy/descriptor";

export = {
  id: QuestID.WC_4,
  name: "Silence the Dead",
  requiredLevel: 0,
  main: true,
  prequests: [QuestID.WC_3],
  dialog: DialogID.Wc4_MiriamsPlea,
  goals: [
    {
      action: QuestGoalAction.Defeat,
      target: EnemyID.DarkWizard
    }
  ],
  rewards: [
    {
      kind: QuestRewardKind.Gold,
      amount: 10
    }, {
      kind: QuestRewardKind.XP,
      amount: 25
    }
  ]
} satisfies QuestDescriptor;
