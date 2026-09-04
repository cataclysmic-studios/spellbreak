import type { BaseID } from "@rbxts/id";

export const enum World {
  WizardCity,
}

export const WorldNames: Record<World, string> = {
  [World.WizardCity]: "Wizard City",
};

export enum ZoneID {
  TownSquare,
  HeadmastersOffice,
  PegasusLane,
  ShatterbonesTower,
}

export const ALL_ZONE_IDS: readonly ZoneID[] = [ZoneID.TownSquare, ZoneID.HeadmastersOffice, ZoneID.PegasusLane, ZoneID.ShatterbonesTower];

export interface ZoneDescriptor extends BaseID<ZoneID> {
  readonly name: string;
  readonly world: World;
  /** The zone this one is nested inside of (e.g. a building interior within a town), if any. */
  readonly parent?: ZoneID;
}
