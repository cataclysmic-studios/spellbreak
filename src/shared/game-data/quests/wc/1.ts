import { NpcID } from "shared/structs/npc/descriptor";
import { DialogID } from "shared/structs/npc/dialog";
import { QuestGoalAction, QuestID, type QuestDescriptor } from "shared/structs/quests";

export = {
  id: QuestID.WC_1,
  name: "Enrollment Day",
  requiredLevel: 0,
  main: true,
  dialog: DialogID.enrollment_day_intro,
  goals: [
    {
      action: QuestGoalAction.Talk,
      target: NpcID.PrivatePike,
      location: "City Square",
      dialog: DialogID.enrollment_day_end
    }
  ]
} satisfies QuestDescriptor;