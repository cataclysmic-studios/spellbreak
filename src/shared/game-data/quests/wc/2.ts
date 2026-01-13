import { DialogID } from "shared/structs/npc/dialog";
import { QuestGoalAction, QuestID, type QuestDescriptor } from "shared/structs/quests";

export = {
  id: QuestID.WC_2,
  name: "New Savior",
  requiredLevel: 0,
  main: true,
  goals: [
    {
      action: QuestGoalAction.Go,
      target: "Pegasus Lane",
      location: "Pegasus Lane",
      dialog: DialogID.enrollment_day_end,
    }
  ]
} satisfies QuestDescriptor;