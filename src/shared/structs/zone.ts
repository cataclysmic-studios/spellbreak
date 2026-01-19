import type { BaseID } from "@rbxts/id";

export const enum ZoneID {
  WC_TownSquare,
  WC_TownSquare_HeadmastersOffice,
  WC_PegasusLane,
  WC_PegasusLane_ShatterbonesTower,
}

export interface ZoneNames {
  [ZoneID.WC_TownSquare]: "Town Square",
  [ZoneID.WC_TownSquare_HeadmastersOffice]: "Headmaster's Office",
  [ZoneID.WC_PegasusLane]: "Pegasus Lane",
  [ZoneID.WC_PegasusLane_ShatterbonesTower]: "Shatterbones' Tower",
}

export interface ZoneWorlds {
  [ZoneID.WC_TownSquare]: "Wizard City",
  [ZoneID.WC_TownSquare_HeadmastersOffice]: "Wizard City",
  [ZoneID.WC_PegasusLane]: "Wizard City",
  [ZoneID.WC_PegasusLane_ShatterbonesTower]: "Wizard City",
}

export interface Zone extends BaseID<ZoneID> {
  readonly exits: Map<ZoneID, Vector3>;
}