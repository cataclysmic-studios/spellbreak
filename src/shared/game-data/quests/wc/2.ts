import { DialogID } from "shared/structs/npc/dialog";
import { QuestGoalAction, QuestID, type QuestDescriptor } from "shared/structs/quests";

export = {
  id: QuestID.WC_2,
  name: "New Savior",
  requiredLevel: 0,
  main: true,
  prequests: [QuestID.WC_1],
  dialog: DialogID.new_savior_intro,
  goals: [
    {
      action: QuestGoalAction.Go,
      target: "Pegasus Lane",
      location: "Pegasus Lane"
    }
  ]
} satisfies QuestDescriptor;