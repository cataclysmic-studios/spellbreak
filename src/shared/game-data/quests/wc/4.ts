import { NpcID } from "shared/structs/npc/descriptor";
import { DialogID } from "shared/structs/npc/dialog";
import { QuestID, type QuestDescriptor } from "shared/structs/quests";
import { EnemyID } from "shared/structs/enemy/descriptor";
import { talkGoal, defeatGoal, goldReward, xpReward } from "shared/utility/quest-builders";

export = {
  id: QuestID.WC_4,
  name: "Silence the Dead",
  requiredLevel: 0,
  main: true,
  prequests: [QuestID.WC_3],
  offerDialog: DialogID.Wc4_MiriamsRequest,
  goals: [
    defeatGoal(EnemyID.DarkWizard),
    talkGoal(NpcID.MiriamAshgrove, DialogID.Wc4_MiriamsPlea)
  ],
  rewards: [
    goldReward(10),
    xpReward(25)
  ]
} satisfies QuestDescriptor;
