import { World, ZoneID, type ZoneDescriptor } from "shared/structs/zone";
import { Images } from "shared/ui/utility/images";

export = {
  id: ZoneID.TownSquare,
  name: "Town Square",
  world: World.WizardCity,
  portrait: Images.Portrait_TownSquare
} satisfies ZoneDescriptor;
