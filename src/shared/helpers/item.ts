import { Singleton } from "shared/dependencies";
import type { CharacterItem } from "shared/data-models/character-item";
import type { Housing } from "shared/data-models/items/housing";
import type { DeckData, DeckLinkedData } from "shared/data-models/items/deck";
import { GearCategory, type Gear } from "shared/data-models/items/gear";
import type { ItemReference } from "shared/data-models/item-reference";
import Log from "shared/logger";

const itemsFolder = <Folder>script.Parent?.Parent?.WaitForChild("default-structs").WaitForChild("items");
const itemModules = itemsFolder.GetDescendants().filter((i): i is ModuleScript => i.IsA("ModuleScript"));
const ALL_ITEMS = itemModules.map(module => (<{ default: CharacterItem }>require(module)).default);

@Singleton()
export default class ItemHelper {
  public getFromReference<T extends CharacterItem, U = unknown>({ reference, linkedData }: ItemReference<U>): Maybe<T> {
    const [category, name] = reference.split(".");
    const item = ALL_ITEMS.find((item): item is T => {
      let categoryMatches = false;
      switch (category) {
        case "Gear": {
          categoryMatches = this.isGear(item);
          break;
        }
        case "Housing": {
          categoryMatches = this.isHousing(item);
          break;
        }
      }

      return categoryMatches && item.name === name;
    });

    if (item !== undefined && linkedData !== undefined) {
      if (this.isDeck(item)) {
        const data = <DeckLinkedData>linkedData;
        item.spells = data.spells;
        item.sideboardSpells = data.sideboardSpells;
      }
    }
    return item;
  }

  public mustGetFromReference<T extends CharacterItem, U = unknown>(reference: ItemReference<U>): T {
    const item = this.getFromReference<T, U>(reference);
    if (item === undefined)
      throw new Log.Exception("FailedToGetItemFromReference", `Failed to get character item from reference "${reference}"`);

    return item;
  }

  public createReference<T>(item: CharacterItem): ItemReference<T> {
    let itemData = undefined;
    let category = "";
    if (this.isGear(item)) {
      category = "Gear";
      if (item.category === GearCategory.Deck) {
        itemData = {
          spells: (<DeckData>item).spells,
          sideboardSpells: (<DeckData>item).sideboardSpells
        };
      }
    } else if (this.isHousing(item))
      category = "Housing";
    // else if (this.isJewel(item))
    // category = "Jewel";

    return {
      reference: `${category}.${item.name}`,
      linkedData: <T>itemData
    };
  }

  public isDeck(object: object): object is DeckData {
    return this.isGear(object) && object.category === GearCategory.Deck;
  }

  public isHousing(object: object): object is Housing {
    return this.isItem(object)
      && !this.isGear(object)
      && "category" in object;
  }

  public isGear(object: object): object is Gear {
    return this.isItem(object)
      && "category" in object
      && "sockets" in object;
  }

  public isItem(object: object): object is CharacterItem {
    return "name" in object
      && "noAuction" in object
      && "noTrade" in object
      && "pvpOnly" in object
      && "noPvp" in object;
  }
}