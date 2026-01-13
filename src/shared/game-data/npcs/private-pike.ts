import { getQuestByID } from "shared/utility/quests";
import { QuestID } from "shared/structs/quests";
import { type NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";

export = {
  id: NpcID.PrivatePike,
  name: "Private Pike",
  title: "Pegasus Lane Guard",
  questsGiven: [QuestID.WC_1].map(getQuestByID),
} satisfies NpcDescriptor;