import { World, ZoneID, type ZoneDescriptor } from "shared/structs/zone";

export = {
  id: ZoneID.TownSquare,
  name: "Town Square",
  world: World.WizardCity,
  exits: new Map()
} satisfies ZoneDescriptor;
