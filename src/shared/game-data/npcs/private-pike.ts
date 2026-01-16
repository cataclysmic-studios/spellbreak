import { Images } from "shared/ui/utility/images";
import { ZoneID } from "shared/structs/zone";
import { QuestID } from "shared/structs/quests";
import { type NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";

export = {
  id: NpcID.PrivatePike,
  name: "Private Pike",
  title: "Pegasus Lane Guard",
  portrait: Images.Portrait_PrivatePike,
  questsGiven: [QuestID.WC_2],
  zone: ZoneID.WC_TownSquare
} satisfies NpcDescriptor;