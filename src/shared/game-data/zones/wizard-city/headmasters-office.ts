import { World, ZoneID, type ZoneDescriptor } from "shared/structs/zone";

export = {
  id: ZoneID.HeadmastersOffice,
  name: "Headmaster's Office",
  world: World.WizardCity,
  parent: ZoneID.TownSquare,
  exits: new Map()
} satisfies ZoneDescriptor;
