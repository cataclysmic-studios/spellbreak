import { World, ZoneID, type ZoneDescriptor } from "shared/structs/zone";

export = {
  id: ZoneID.PegasusLane,
  name: "Pegasus Lane",
  world: World.WizardCity,
  exits: new Map()
} satisfies ZoneDescriptor;
