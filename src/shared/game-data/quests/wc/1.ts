import { NpcID } from "shared/structs/npc/descriptor";
import { DialogID } from "shared/structs/npc/dialog";
import { QuestID, type QuestDescriptor } from "shared/structs/quests";
import { talkGoal, goldReward, xpReward } from "shared/utility/quest-builders";

export = {
  id: QuestID.WC_1,
  name: "Enrollment Day",
  requiredLevel: 0,
  main: true,
  offerDialog: DialogID.Wc1_EnrollmentIntro,
  goals: [
    talkGoal(NpcID.PrivatePike, DialogID.Wc1_EnrollmentEnd)
  ],
  rewards: [
    goldReward(5),
    xpReward(10)
  ]
} satisfies QuestDescriptor;