import { Images } from "shared/ui/utility/images";
import { ZoneID } from "shared/structs/zone";
import { type NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";

export = {
  id: NpcID.MiriamAshgrove,
  name: "Miriam Ashgrove",
  title: "Pegasus Lane Resident",
  portrait: Images.Portrait_MiriamAshgrove,
  zone: ZoneID.PegasusLane,
  spawnCFrame: new CFrame(-357.14, 3, 3019.94, 0, 0, -1, 0, 1, 0, 1, 0, 0)
} satisfies NpcDescriptor;
