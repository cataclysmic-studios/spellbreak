import Vide from "@rbxts/vide";

import { DuelPlanning } from "../views/duel-planning";
import { hoarcekat } from "../utility/hoarcekat";
import "../dev";

import { getSpellFromReference } from "shared/utility/spell";
import { SpellCardKind, SpellCard } from "shared/structs/spell-card";
import { SpellReference } from "shared/structs/data/reference/spell";
import { DeckDuelState } from "shared/classes/deck-duel-state";
import { Timer } from "@rbxts/timer";

const testCards: SpellCard[] = [
  {
    kind: SpellCardKind.Normal,
    spell: getSpellFromReference(SpellReference.Myth_Troll)
  }, {
    kind: SpellCardKind.Normal,
    spell: getSpellFromReference(SpellReference.Myth_Mythblade)
  }, {
    kind: SpellCardKind.Treasure,
    spell: getSpellFromReference(SpellReference.Myth_Mythblade)
  }
];

const deckState = new DeckDuelState({
  spellReferences: testCards.map(card => ({ reference: card.spell.reference, data: { spellCardKind: card.kind } })),
  sideboardSpellReferences: []
});

deckState.draw(3);
const timer = new Timer(30);
export = hoarcekat(() => <DuelPlanning deckState={deckState} timer={timer} hand={() => testCards} />);