import { Singleton } from "shared/dependencies";
import { Deck } from "shared/data-models/items/deck";
import type { CharacterData } from "shared/data-models/character-data";
import type { Spell } from "shared/structs/spell";

import type SpellHelper from "./spell";
import { removeDuplicates } from "shared/utility/array";

@Singleton()
export default class CharacterHelper {
  public constructor(
    private readonly spellHelper: SpellHelper
  ) { }

  public trainFirstSpell(character: CharacterData): void {
    const spell = this.spellHelper.getFirstSpell(character.school);
    character.trainedSpells.push(spell);

    const characterDeck = this.getEquippedDeck(character);
    characterDeck?.addSpell(spell);
    character.equippedGear.Deck = characterDeck;
  }

  public getEquippedDeck(character: CharacterData): Maybe<Deck> {
    const data = character.equippedGear.Deck;
    if (data === undefined) return;
    return Deck.from(data);
  }

  public isValidDeck(deck: Deck, trainedSpells: Spell[]): boolean {
    return deck.spells.size() <= deck.maxSpells
      && deck.sideboardSpells.size() <= deck.maxSideboardSpells
      && removeDuplicates(deck.spells).every(spell => trainedSpells.includes(spell));
  }
}