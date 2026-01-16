import { source } from "@rbxts/vide";

import { assets } from "shared/constants";
import { getSpellCardFromReferenceData } from "shared/utility/spell";
import { SpellReference } from "shared/structs/data/reference/spell";
import { SpellCardKind, type SpellCard } from "shared/structs/spell/card";

const enum Mock {
  ID = -1
}

export const createMockDuelInfo = () => ({
  id: Mock.ID,
  model: assets.duel.circle,
  onOpposingTeam: false,
  state: {
    // deck: new ClientDuelDeckState(Mock.ID, {
    //   spellReferences: [],
    //   sideboardSpellReferences: [SpellReference.Myth_Mythblade]
    // }),
    choosing: source(true),
    hand: source<SpellCard[]>([
      getSpellCardFromReferenceData({
        reference: SpellReference.Myth_Mythblade,
        data: { spellCardKind: SpellCardKind.Normal }
      }),
      getSpellCardFromReferenceData({
        reference: SpellReference.Myth_Mythblade,
        data: { spellCardKind: SpellCardKind.Normal }
      }),
      getSpellCardFromReferenceData({
        reference: SpellReference.Myth_Troll,
        data: { spellCardKind: SpellCardKind.Normal }
      })
    ]),
    selectedCard: source<Maybe<SpellCard>>(),
    opponentCount: 1,
    teamCount: 1
  }
});