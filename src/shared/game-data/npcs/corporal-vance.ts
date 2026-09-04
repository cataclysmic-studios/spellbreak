import { Images } from "shared/ui/utility/images";
import { ZoneID } from "shared/structs/zone";
import { QuestID } from "shared/structs/quests";
import { type NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";

export = {
  id: NpcID.CorporalVance,
  name: "Corporal Vance",
  title: "Lane Patrol",
  portrait: Images.Portrait_CorporalVance,
  questsGiven: [QuestID.WC_3],
  zone: ZoneID.PegasusLane,
  spawnCFrame: new CFrame(-337.14, 3, 3014.94, 0, 0, 1, 0, 1, 0, -1, 0, 0)
} satisfies NpcDescriptor;
