import { World, ZoneID, type ZoneDescriptor } from "shared/structs/zone";
import { Images } from "shared/ui/utility/images";

export = {
  id: ZoneID.ShatterbonesTower,
  name: "Shatterbones' Tower",
  world: World.WizardCity,
  portrait: Images.Portrait_ShatterbonesTower,
  parent: ZoneID.PegasusLane
} satisfies ZoneDescriptor;
