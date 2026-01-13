import { getQuestByID } from "shared/utility/quests";
import { QuestID } from "shared/structs/quests";
import { type NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";

export = {
  id: NpcID.HeadmasterHale,
  name: "Benedict Hale",
  title: "Headmaster",
  questsGiven: [QuestID.WC_1].map(getQuestByID),
} satisfies NpcDescriptor;