import type { GearCategory, GearData } from ".";

export interface MountData extends GearData {
  readonly category: GearCategory.Mount;
  readonly speedBoost: number;
}