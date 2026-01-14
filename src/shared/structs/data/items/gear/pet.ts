import type { String, u8 } from "@rbxts/serio";

import type { GearCategory, GearData } from ".";
import type { ReferenceWithData } from "../../reference";
import type { PetReference } from "../../reference/gear/pet";

export type PetReferenceData = ReferenceWithData<PetLinkedData, PetReference>;

export interface PetLinkedData {
  readonly name: String<u8>;
}

export interface PetData extends GearData {
  readonly category: GearCategory.Pet;
  readonly reference: PetReference;
}