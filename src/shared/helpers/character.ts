import { Singleton } from "shared/dependencies";
import { removeDuplicates } from "shared/utility/array";
import { Deck, type DeckLinkedData, type DeckData } from "shared/data-models/items/deck";
import type { CharacterData } from "shared/data-models/character-data";
import type { Spell } from "shared/structs/spell";
import Log from "shared/logger";

import type SpellHelper from "./spell";
import type ItemHelper from "./item";

@Singleton()
export default class CharacterHelper {
  public constructor(
    private readonly spellHelper: SpellHelper,
    private readonly itemHelper: ItemHelper
  ) { }

  public trainFirstSpell(character: CharacterData): void {
    const spell = this.spellHelper.getFirstSpell(character.school);
    character.trainedSpells.push(this.spellHelper.createReference(spell));

    const characterDeck = this.getEquippedDeck(character);
    if (characterDeck === undefined)
      return Log.warning("Failed to train first spell: Failed to find equipped deck");

    characterDeck.addSpell(spell);
    character.equippedGear.Deck = this.itemHelper.createReference<DeckLinkedData>(characterDeck);
  }

  public getEquippedDeck(character: CharacterData): Maybe<Deck> {
    if (character.equippedGear.Deck === undefined) return;
    const data = this.itemHelper.getFromReference<Deck>(character.equippedGear.Deck);
    if (data === undefined) return;
    return Deck.from(data);
  }

  public isValidDeck(deck: Deck, trainedSpells: Spell[]): boolean {
    return deck.spells.size() <= deck.maxSpells
      && deck.sideboardSpells.size() <= deck.maxSideboardSpells
      && removeDuplicates(deck.spells).every(spell => trainedSpells.map(spell => this.spellHelper.createReference(spell)).includes(spell));
  }
}