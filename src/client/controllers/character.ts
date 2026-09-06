import { Controller } from "@flamework/core";

import { getEquippedGear } from "shared/utility/data";
import { GearCategory } from "shared/structs/data/items/gear";
import type { CharacterData } from "shared/structs/data";
import type { DeckData, DeckLinkedData } from "shared/structs/data/items/gear/deck";
import Log from "shared/log";

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
    Log.assert(this.isLoaded(), "data accessed before replica load");
    return this.replica.data.characters[this.index];
  }

  public isLoaded(): boolean {
    return this.replica.data.characters !== undefined;
  }

  public getDeck(): Maybe<DeckData & DeckLinkedData> {
    return getEquippedGear(GearCategory.Deck, this.getData());
  }
}