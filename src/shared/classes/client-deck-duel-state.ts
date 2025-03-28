import { getSpellCardFromReferenceData, getSpellFromReference } from "shared/utility/spell";
import { SpellCardKind, type SpellCard } from "shared/structs/spell-card";
import type { DeckLinkedData } from "shared/structs/data/items/gear/deck";
import type { ClientDuelInfo, DuelCirclePosition } from "shared/structs/duel";
import { maxCardsInHand } from "shared/constants";
import { Message, messaging } from "shared/messaging";

const random = new Random;
function shuffle<T extends defined>(array: T[]): T[] {
  const shuffled = table.clone(array);
  for (const i of $range(array.size(), 1, -1)) {
    const j = random.NextInteger(0, i);
    shuffled[i], shuffled[j] = shuffled[j], shuffled[i];
  }

  return shuffled;
}

export class ClientDuelDeckState {
  public readonly totalCards;

  private readonly spells: SpellCard[];
  private readonly sideboardSpells: SpellCard[];
  private chosenCard?: SpellCard;

  public constructor(
    private readonly duelID: number,
    { spellReferences, sideboardSpellReferences }: DeckLinkedData
  ) {
    this.spells = shuffle(spellReferences.map(getSpellCardFromReferenceData));
    this.sideboardSpells = shuffle(sideboardSpellReferences.map(reference => ({
      kind: SpellCardKind.Treasure,
      spell: getSpellFromReference(reference)
    })));
    this.totalCards = this.spells.size();
  }

  // i know this doesnt really fit here but this is the best place for it at the moment
  public chooseCard(spellCard: SpellCard): void
  public chooseCard(spellCard: SpellCard, target: DuelCirclePosition, targetIsOpponent: boolean): void
  public chooseCard(spellCard: SpellCard, target?: DuelCirclePosition, targetIsOpponent?: boolean): void {
    this.chosenCard = spellCard;
    messaging.emitServer(Message.DuelSubmitChoice, {
      id: this.duelID,
      choice: {
        spellReference: spellCard.spell.reference,
        target, targetIsOpponent
      }
    });
  }

  public pass(): void {
    messaging.emitServer(Message.DuelSubmitChoice);
  }

  public revokeChoice(): void {
    this.chosenCard = undefined;
    messaging.emitServer(Message.DuelRevokeChoice);
  }

  public getChosenCard(): Maybe<SpellCard> {
    return this.chosenCard;
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

  public canDrawSideboard(hand: SpellCard[]): boolean {
    return hand.size() < maxCardsInHand && this.sideboardSpells.size() > 0;
  }

  private hasMoreSpells() {
    return this.spells.size() > 0;
  }
}