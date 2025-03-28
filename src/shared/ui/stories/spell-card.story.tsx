import Vide from "@rbxts/vide";

import { hoarcekat } from "../utility/hoarcekat";
import { createMockDuelInfo } from "./common";
import { getSpellFromReference } from "shared/utility/spell";
import { SpellReference } from "shared/structs/data/reference/spell";
import { type SpellCard, SpellCardKind } from "shared/structs/spell-card";
import "../dev";

import { Container } from "../utility/components/container";
import { CardButton } from "../components/card-button";

const card: SpellCard = {
  kind: SpellCardKind.Item,
  spell: getSpellFromReference(SpellReference.Myth_Mythblade)
};

export = hoarcekat(() => (
  <Container size={UDim2.fromScale(0.4, 0.4)}>
    <CardButton
      layoutOrder={0}
      spellCard={card}
      duelInfo={createMockDuelInfo()}
    />
  </Container>
));