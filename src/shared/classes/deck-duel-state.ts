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
  public readonly totalCards;

  private readonly spells: SpellCard[];
  private readonly sideboardSpells: SpellCard[];
  private chosenCard?: SpellCard;

  public constructor({ spellReferences, sideboardSpellReferences }: DeckLinkedData) {
    this.spells = shuffle(spellReferences.map(getSpellCardFromReferenceData));
    this.sideboardSpells = shuffle(sideboardSpellReferences.map(getSpellCardFromReferenceData));
    this.totalCards = this.spells.size();
  }

  // i know this doesnt really fit here but this is the best place for it at the moment
  public chooseCard(spellCard: SpellCard): void {
    this.chosenCard = spellCard;
  }

  public removeCardChoice(): void {
    this.chosenCard = undefined;
  }

  public getChosenCard(): Maybe<SpellCard> {
    const chosen = this.chosenCard;
    this.chosenCard = undefined;

    return chosen;
  }

  public getCardsLeft(): number {
    return this.spells.size();
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
    // TODO: remove treasure card from actual deck data
    return this.sideboardSpells.pop()!;
  }

  public canDrawSideboard(): boolean {
    return this.sideboardSpells.size() > 0;
  }

  private hasMoreSpells() {
    return this.spells.size() > 0;
  }
}