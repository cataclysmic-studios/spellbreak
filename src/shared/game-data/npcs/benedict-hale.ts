import { Images } from "shared/ui/utility/images";
import { QuestID } from "shared/structs/quests";
import { ZoneID } from "shared/structs/zone";
import { type NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";

export = {
  id: NpcID.HeadmasterHale,
  name: "Benedict Hale",
  title: "Headmaster",
  portrait: Images.Portrait_HeadmasterHale,
  questsGiven: [QuestID.WC_1],
  zone: ZoneID.HeadmastersOffice,
  spawnCFrame: new CFrame(0, 3, -604, 0, 0, 1, 0, 1, 0, -1, 0, 0)
} satisfies NpcDescriptor;