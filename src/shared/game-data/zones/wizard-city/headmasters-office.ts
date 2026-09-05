import { World, ZoneID, type ZoneDescriptor } from "shared/structs/zone";
import { Images } from "shared/ui/utility/images";

export = {
  id: ZoneID.HeadmastersOffice,
  name: "Headmaster's Office",
  world: World.WizardCity,
  portrait: Images.Portrait_HeadmastersOffice,
  parent: ZoneID.TownSquare
} satisfies ZoneDescriptor;
