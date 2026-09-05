import { NpcID } from "shared/structs/npc/descriptor";
import { DialogID } from "shared/structs/npc/dialog";
import { QuestID, type QuestDescriptor } from "shared/structs/quests";
import { talkGoal, goldReward, xpReward } from "shared/utility/quest-builders";

export = {
  id: QuestID.WC_3,
  name: "Watch and Whisper",
  requiredLevel: 0,
  main: true,
  prequests: [QuestID.WC_2],
  offerDialog: DialogID.Wc3_LaneWatch,
  goals: [
    talkGoal(NpcID.OldMiriam, DialogID.Wc3_MiriamTestimony)
  ],
  rewards: [
    goldReward(5),
    xpReward(20)
  ]
} satisfies QuestDescriptor;
