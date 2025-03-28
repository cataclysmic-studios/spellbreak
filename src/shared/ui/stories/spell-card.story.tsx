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
      hand={() => [card]}
      spellCard={card}
      layoutOrder={0}
      deckState={deckState}
      selectedCard={source<Maybe<SpellCard>>()}
      choosing={source(true)}
    />
  </Container>
));