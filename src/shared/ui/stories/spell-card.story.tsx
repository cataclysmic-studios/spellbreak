import Vide from "@rbxts/vide";

import { hoarcekat } from "../utility/hoarcekat";
import { createMockDuelInfo } from "./common";
import { getSpellFromReference } from "shared/utility/spell";
import { SpellReference } from "shared/structs/data/reference/spell";
import { type SpellCard, SpellCardKind } from "shared/structs/spell-card";
import "../dev";

import { Container } from "../utility/components/container";
import { DuelCardButton } from "../components/duel-card-button";

const card: SpellCard = {
  kind: SpellCardKind.Item,
  spell: getSpellFromReference(SpellReference.Myth_Mythblade)
};

export = hoarcekat(() => (
  <Container size={UDim2.fromScale(0.4, 0.4)}>
    <DuelCardButton spellCard={card}
      layoutOrder={0}
      duelInfo={createMockDuelInfo()}
    />
  </Container>
));