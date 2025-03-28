import Vide, { source } from "@rbxts/vide";

import { hoarcekat } from "../utility/hoarcekat";
import { getSpellFromReference } from "shared/utility/spell";
import { SpellReference } from "shared/structs/data/reference/spell";
import { ClientDuelDeckState } from "shared/classes/client-deck-duel-state";
import { type SpellCard, SpellCardKind } from "shared/structs/spell-card";
import "../dev";

import { Container } from "../utility/components/container";
import { CardButton } from "../components/card-button";

const card: SpellCard = {
  kind: SpellCardKind.Normal,
  spell: getSpellFromReference(SpellReference.Myth_Mythblade)
};

const deckState = new ClientDuelDeckState(-1, { spellReferences: [], sideboardSpellReferences: [] });

export = hoarcekat(() => (
  <Container size={UDim2.fromScale(0.4, 0.4)}>
    <CardButton
      layoutOrder={0}
      spellCard={card}
      deck={deckState}
      newTreasureCards={new Set}
      hand={() => [card]}
      selectedCard={source<Maybe<SpellCard>>()}
      choosing={source(true)}
    />
  </Container>
));