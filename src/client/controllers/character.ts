import { Controller } from "@flamework/core";

import { getEquippedGear } from "shared/utility/data";
import { GearCategory } from "shared/structs/data/items/gear";
import type { CharacterData } from "shared/structs/data";
import type { DeckData, DeckLinkedData } from "shared/structs/data/items/gear/deck";

import type { ReplicaController } from "./replica";

@Controller()
export class CharacterController {
  public readonly updated;
  private index = 0;

  public constructor(
    private readonly replica: ReplicaController
  ) {
    this.updated = replica.updated;
  }

  public getData(): CharacterData {
    return this.replica.data.characters[this.index];
  }

  public getDeck(): Maybe<DeckData & DeckLinkedData> {
    return getEquippedGear(GearCategory.Deck, this.getData());
  }
}