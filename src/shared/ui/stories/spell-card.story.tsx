import Vide, { source } from "@rbxts/vide";

import { CardButton } from "../components/card-button";
import { hoarcekat } from "../utility/hoarcekat";
import { type SpellCard, SpellCardKind } from "shared/structs/spell-card";
import "../dev";

import { Container } from "../utility/components/container";
import { getSpellFromReference } from "shared/utility/spell";
import { SpellReference } from "shared/structs/data/reference/spell";

const card: SpellCard = {
  kind: SpellCardKind.Normal,
  spell: getSpellFromReference(SpellReference.Myth_Mythblade)
};

export = hoarcekat(() => (
  <Container size={UDim2.fromScale(0.4, 0.4)}>
    <CardButton
      hand={() => [card]}
      spellCard={card}
      layoutOrder={0}
      hasCardSelected={source(false)}
    />
  </Container>
));