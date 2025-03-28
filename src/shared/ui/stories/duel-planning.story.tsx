import { Timer } from "@rbxts/timer";
import Vide from "@rbxts/vide";

import { DuelPlanning } from "../views/duel-planning";
import { hoarcekat } from "../utility/hoarcekat";
import "../dev";

import { getSpellFromReference } from "shared/utility/spell";
import { assets, timerLength } from "shared/constants";
import { SpellCardKind, SpellCard } from "shared/structs/spell-card";
import { SpellReference } from "shared/structs/data/reference/spell";
import { ClientDuelDeckState } from "shared/classes/client-deck-duel-state";
import type { ClientDuelInfo } from "shared/structs/duel";

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

const id = -1;
const testDuelInfo: ClientDuelInfo = {
  id,
  model: assets.duel.circle.Clone(),
  onOpposingTeam: false,
  state: {
    deck: new ClientDuelDeckState(id, {
      spellReferences: testCards.map(card => ({ reference: card.spell.reference, data: { spellCardKind: card.kind } })),
      sideboardSpellReferences: []
    }),
    hand: () => testCards,
    opponentCount: 1,
    teamCount: 1
  }
};

testDuelInfo.state.deck.draw(3);
const timer = new Timer(timerLength);
timer.start();
export = hoarcekat(() => <DuelPlanning duelInfo={testDuelInfo} timer={() => timer} />);