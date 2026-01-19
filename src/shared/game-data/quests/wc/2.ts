import { DialogID } from "shared/structs/npc/dialog";
import { QuestGoalAction, QuestID, QuestRewardKind, type QuestDescriptor } from "shared/structs/quests";
import { ZoneID } from "shared/structs/zone";

export = {
  id: QuestID.WC_2,
  name: "New Savior",
  requiredLevel: 0,
  main: true,
  prequests: [QuestID.WC_1],
  dialog: DialogID.new_savior_intro,
  goals: [
    {
      action: QuestGoalAction.Explore,
      target: ZoneID.WC_PegasusLane
    }
  ],
  rewards: [
    {
      kind: QuestRewardKind.Gold,
      amount: 5
    }, {
      kind: QuestRewardKind.XP,
      amount: 15
    }
  ]
} satisfies QuestDescriptor;