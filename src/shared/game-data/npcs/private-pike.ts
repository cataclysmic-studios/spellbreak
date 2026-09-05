import { Images } from "shared/ui/utility/images";
import { ZoneID } from "shared/structs/zone";
import { type NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";

export = {
  id: NpcID.PrivatePike,
  name: "Private Pike",
  title: "Pegasus Lane Guard",
  portrait: Images.Portrait_PrivatePike,
  zone: ZoneID.TownSquare,
  spawnCFrame: new CFrame(28.5, 3, 30, 0, 0, 1, 0, 1, 0, -1, 0, 0)
} satisfies NpcDescriptor;