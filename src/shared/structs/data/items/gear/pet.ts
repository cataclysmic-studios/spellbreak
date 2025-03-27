import type { GearCategory, GearData } from ".";
import type { ReferenceWithData } from "../../reference";
import type { PetReference } from "../../reference/gear/pet";

export type PetReferenceData = ReferenceWithData<PetLinkedData, PetReference>;

export interface PetLinkedData {
  readonly name: string;
}

export interface PetData extends GearData {
  readonly category: GearCategory.Pet;
  readonly reference: PetReference;
}