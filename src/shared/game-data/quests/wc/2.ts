import { NpcID } from "shared/structs/npc/descriptor";
import { DialogID } from "shared/structs/npc/dialog";
import { QuestID, type QuestDescriptor } from "shared/structs/quests";
import { ZoneID } from "shared/structs/zone";
import { talkGoal, exploreGoal, goldReward, xpReward } from "shared/utility/quest-builders";

export = {
  id: QuestID.WC_2,
  name: "New Savior",
  requiredLevel: 0,
  main: true,
  prequests: [QuestID.WC_1],
  offerDialog: DialogID.Wc2_NewSaviorIntro,
  goals: [
    exploreGoal(ZoneID.PegasusLane),
    talkGoal(NpcID.CorporalVance, DialogID.Wc2_VanceReport)
  ],
  rewards: [
    goldReward(5),
    xpReward(15)
  ]
} satisfies QuestDescriptor;