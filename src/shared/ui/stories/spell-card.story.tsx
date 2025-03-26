import Vide from "@rbxts/vide";

import { CardButton } from "../components/card-button";
import { hoarcekat } from "../utility/hoarcekat";
import "../dev";

import { CardKind } from "shared/structs/spell-card";
import Troll from "shared/spells/myth/troll";
import { Container } from "../utility/components/container";

export = hoarcekat(() => (
  <Container size={UDim2.fromScale(0.5, 0.5)}>
    <CardButton
      spellCard={{
        cardKind: CardKind.Normal,
        spell: Troll
      }}
      layoutOrder={0}
    />
  </Container>
));