import { NpcID } from "shared/structs/npc/descriptor";
import { DialogID } from "shared/structs/npc/dialog";
import { QuestGoalAction, QuestID, QuestRewardKind, type QuestDescriptor } from "shared/structs/quests";

export = {
  id: QuestID.WC_1,
  name: "Enrollment Day",
  requiredLevel: 0,
  main: true,
  dialog: DialogID.Wc1_EnrollmentIntro,
  goals: [
    {
      action: QuestGoalAction.Talk,
      target: NpcID.PrivatePike,
      completionDialog: DialogID.Wc1_EnrollmentEnd
    }
  ],
  rewards: [
    {
      kind: QuestRewardKind.Gold,
      amount: 5
    }, {
      kind: QuestRewardKind.XP,
      amount: 10
    }
  ]
} satisfies QuestDescriptor;