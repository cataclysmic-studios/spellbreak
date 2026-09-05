import { source } from "@rbxts/vide";

import { assets } from "shared/constants";
import { getSpellCardFromReferenceData } from "shared/utility/spell";
import { SpellReference } from "shared/structs/data/reference/spell";
import { SpellCardKind, type SpellCard } from "shared/structs/spell/card";
import type { DuelChoiceTarget } from "shared/structs/duel";

const enum Mock {
  ID = -1
}

export const createMockDuelInfo = () => ({
  id: Mock.ID,
  model: assets.duel.circle,
  onOpposingTeam: false,
  firstTurnOnTeam: true,
  state: {
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
    sideboardCount: source(1),
    selectedCard: source<Maybe<SpellCard>>(),
    chosenSpellReference: source<Maybe<SpellReference>>(),
    chosenTarget: source<Maybe<DuelChoiceTarget>>(),
    pipValue: source(7),
    opponentCount: 1,
    teamCount: 1
  }
});