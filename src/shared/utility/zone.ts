import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";

import { loadDescriptors } from "./data-registry";
import { World, WorldNames, type ZoneID, type ZoneDescriptor } from "shared/structs/zone";

const zonesFolder = getInstanceAtPath("src/shared/game-data/zones") as Folder;
const allZones = loadDescriptors<ZoneID, ZoneDescriptor>(zonesFolder, "zone");

export function getZoneByID(id: ZoneID): ZoneDescriptor {
  assert(allZones.has(id), "zone with ID " + id + " not found");
  return allZones.get(id)!;
}

export function getWorldName(world: World): string {
  return WorldNames[world];
}
