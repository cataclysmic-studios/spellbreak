import { DialogID } from "shared/structs/npc/dialog";
import { QuestGoalAction, QuestID, type QuestDescriptor } from "shared/structs/quests";
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
  ]
} satisfies QuestDescriptor;