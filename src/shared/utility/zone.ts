import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";

import { loadDescriptors } from "./data-registry";
import { World, WorldNames, ZoneID, type ZoneDescriptor } from "shared/structs/zone";

const zonesFolder = getInstanceAtPath("src/shared/game-data/zones") as Folder;
const allZones = loadDescriptors<ZoneID, ZoneDescriptor>(zonesFolder, "zone");

export function getZoneByID(id: ZoneID): ZoneDescriptor {
  assert(allZones.has(id), "zone with ID " + id + " not found");
  return allZones.get(id)!;
}

/** Looks up a `ZoneID` by its enum member name (e.g. Studio attribute values, which store "PegasusLane" rather than its numeric value). */
export function getZoneIDByName(name: string): ZoneID {
  const id = ZoneID[name as keyof typeof ZoneID];
  assert(id !== undefined, "zone with name " + name + " not found");
  return id;
}

export function getWorldName(world: World): string {
  return WorldNames[world];
}
