import { getSpellCardFromReferenceData } from "shared/utility/spell";
import type { DeckLinkedData } from "shared/structs/data/items/gear/deck";
import type { SpellCard } from "shared/structs/spell-card";

const random = new Random;
function shuffle<T extends defined>(array: T[]): T[] {
  const shuffled = table.clone(array);
  for (const i of $range(array.size(), 1, -1)) {
    const j = random.NextInteger(0, i);
    shuffled[i], shuffled[j] = shuffled[j], shuffled[i];
  }

  return shuffled;
}

export class DeckDuelState {
  public readonly spells: SpellCard[];
  public readonly sideboardSpells: SpellCard[];

  public constructor({ spellReferences, sideboardSpellReferences }: DeckLinkedData) {
    this.spells = shuffle(spellReferences.map(getSpellCardFromReferenceData));
    this.sideboardSpells = shuffle(sideboardSpellReferences.map(getSpellCardFromReferenceData));
  }

  public draw(amount: number): SpellCard[] {
    if (!this.hasMoreSpells())
      return [];

    const drawnSpells: SpellCard[] = [];
    for (const _ of $range(1, amount)) {
      if (!this.hasMoreSpells()) continue;
      drawnSpells.push(this.spells.pop()!);
    }

    return drawnSpells;
  }

  public drawSideboard(): SpellCard {
    return this.sideboardSpells.pop()!;
  }

  public canDrawSideboard(): boolean {
    return this.sideboardSpells.size() > 0;
  }

  private hasMoreSpells() {
    return this.spells.size() > 0;
  }
}