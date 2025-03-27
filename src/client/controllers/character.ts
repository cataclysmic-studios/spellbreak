import { Controller } from "@flamework/core";

import { newCharacterData } from "shared/utility/character";
import { getEquippedGear } from "shared/utility/data";
import { School } from "shared/structs/school";
import { GearCategory } from "shared/structs/data/items/gear";
import type { CharacterData } from "shared/structs/data";
import type { DeckData, DeckLinkedData } from "shared/structs/data/items/gear/deck";

@Controller()
export class CharacterController {
  private currentData = newCharacterData("Test Monkey", School.Myth);

  public getData(): CharacterData {
    return this.currentData;
  }

  public getDeck(): Maybe<DeckData & DeckLinkedData> {
    return getEquippedGear(GearCategory.Deck, this.getData());
  }
}