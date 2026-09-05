import { World, ZoneID, type ZoneDescriptor } from "shared/structs/zone";
import { Images } from "shared/ui/utility/images";

export = {
  id: ZoneID.PegasusLane,
  name: "Pegasus Lane",
  world: World.WizardCity,
  portrait: Images.Portrait_PegasusLane
} satisfies ZoneDescriptor;
