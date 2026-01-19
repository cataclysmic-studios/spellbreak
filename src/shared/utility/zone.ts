import type { Modding } from "@flamework/core";

import type { ZoneID, ZoneNames, ZoneWorlds } from "shared/structs/zone";

type IsUnion<T, U = T> =
  T extends any
  ? ([U] extends [T] ? false : true)
  : never;

/** @metadata macro */
export function getZoneName<ID extends ZoneID>(id: ID, zoneNames?: Modding.Many<IsUnion<ID> extends true ? ZoneNames : ZoneNames[ID]>): ZoneNames[ID] {
  assert(zoneNames !== undefined);
  return typeIs(zoneNames, "string")
    ? zoneNames as never
    : zoneNames[tostring(id) as never];
}

/** @metadata macro */
export function getZoneWorldName<ID extends ZoneID>(id: ID, zoneWorldNames?: Modding.Many<IsUnion<ID> extends true ? ZoneWorlds : ZoneWorlds[ID]>): ZoneWorlds[ID] {
  assert(zoneWorldNames !== undefined);
  return typeIs(zoneWorldNames, "string")
    ? zoneWorldNames as never
    : zoneWorldNames[tostring(id) as never];
}