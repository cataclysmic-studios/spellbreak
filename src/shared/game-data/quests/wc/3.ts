import { NpcID } from "shared/structs/npc/descriptor";
import { DialogID } from "shared/structs/npc/dialog";
import { QuestGoalAction, QuestID, QuestRewardKind, type QuestDescriptor } from "shared/structs/quests";

export = {
  id: QuestID.WC_3,
  name: "Watch and Whisper",
  requiredLevel: 0,
  main: true,
  prequests: [QuestID.WC_2],
  dialog: DialogID.Wc3_LaneWatch,
  goals: [
    {
      action: QuestGoalAction.Talk,
      target: NpcID.OldMiriam,
      completionDialog: DialogID.Wc3_MiriamTestimony
    }
  ],
  rewards: [
    {
      kind: QuestRewardKind.Gold,
      amount: 5
    }, {
      kind: QuestRewardKind.XP,
      amount: 20
    }
  ]
} satisfies QuestDescriptor;
