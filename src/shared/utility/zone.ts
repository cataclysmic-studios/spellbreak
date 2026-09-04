import { CollectionService, Workspace as World } from "@rbxts/services";
import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";

import { loadDescriptors } from "./data-registry";
import { World as WorldEnum, WorldNames, ZoneID, type ZoneDescriptor } from "shared/structs/zone";

const zonesFolder = getInstanceAtPath("src/shared/game-data/zones") as Folder;
const allZones = loadDescriptors<ZoneID, ZoneDescriptor>(zonesFolder, "zone");

const TUNNEL_TAG = "ZoneTunnel";
const zoneModels = new Map<ZoneID, ZoneModel>();

export function getZoneByID(id: ZoneID): ZoneDescriptor {
  assert(allZones.has(id), "zone with ID " + id + " not found");
  return allZones.get(id)!;
}

/** Non-throwing counterpart to {@link getZoneIDByName}, for callers that need to handle an unrecognized name gracefully (e.g. console command input). */
export function findZoneIDByName(name: string): ZoneID | undefined {
  return ZoneID[name as keyof typeof ZoneID];
}

/** Looks up a `ZoneID` by its enum member name (e.g. Studio attribute values, which store "PegasusLane" rather than its numeric value). */
export function getZoneIDByName(name: string): ZoneID {
  const id = findZoneIDByName(name);
  assert(id !== undefined, "zone with name " + name + " not found");
  return id;
}

/** Walks up an instance's ancestors to find the zone it's physically parented under - Workspace zone folders are named after their `ZoneID` enum member. */
export function getZoneOfInstance(instance: Instance): ZoneID {
  let current = instance.Parent;
  while (current !== undefined) {
    const id = findZoneIDByName(current.Name);
    if (id !== undefined) return id;
    current = current.Parent;
  }

  throw `${instance.GetFullName()} is not parented under a zone folder`;
}

export function getWorldName(world: WorldEnum): string {
  return WorldNames[world];
}

/** Finds the `ZoneModel` a zone is physically built under in `Workspace.Zones` - scans once, lazily, and caches the result. */
export function getZoneModel(zoneID: ZoneID): ZoneModel {
  if (zoneModels.size() === 0) {
    const zonesRoot = World.WaitForChild("Zones");
    for (const worldFolder of zonesRoot.GetChildren())
      for (const candidate of worldFolder.GetChildren()) {
        const id = findZoneIDByName(candidate.Name);
        if (id !== undefined) zoneModels.set(id, candidate as ZoneModel);
      }
  }

  const model = zoneModels.get(zoneID);
  assert(model !== undefined, `no Workspace model found for zone ${zoneID}`);
  return model;
}

/** The `CFrame` a player should land at when teleported directly into a zone (as opposed to arriving through a `ZoneTunnel`). */
export function getZoneSpawn(zoneID: ZoneID): CFrame {
  return getZoneModel(zoneID).Spawn.CFrame;
}

/** Finds the entrance (collider) of whichever `ZoneTunnel` leading to `zoneID` is closest to `fromPosition`. */
export function getNearestTunnelPosition(zoneID: ZoneID, fromPosition: Vector3): Maybe<Vector3> {
  let nearest: Maybe<BasePart>;
  let nearestDistance = math.huge;

  for (const instance of CollectionService.GetTagged(TUNNEL_TAG)) {
    const model = instance as TunnelModel;
    const zoneName = model.GetAttribute<string>("ZoneID");
    if (zoneName === undefined || getZoneIDByName(zoneName) !== zoneID) continue;

    const distance = model.collider.Position.sub(fromPosition).Magnitude;
    if (distance >= nearestDistance) continue;

    nearest = model.collider;
    nearestDistance = distance;
  }

  return nearest?.Position;
}
