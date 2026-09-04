import { World, ZoneID, type ZoneDescriptor } from "shared/structs/zone";

export = {
  id: ZoneID.ShatterbonesTower,
  name: "Shatterbones' Tower",
  world: World.WizardCity,
  parent: ZoneID.PegasusLane
} satisfies ZoneDescriptor;
