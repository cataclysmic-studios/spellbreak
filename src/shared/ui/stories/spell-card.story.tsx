import { RunService } from "@rbxts/services";
import { useEventListener } from "@rbxts/pretty-vide-utils";
import Vide, { source } from "@rbxts/vide";

import { hoarcekat } from "../utility/hoarcekat";
import { createMockDuelInfo } from "./common";
import { getSpellFromReference } from "shared/utility/spell";
import { SpellReference } from "shared/structs/data/reference/spell";
import { type SpellCard, SpellCardKind } from "shared/structs/spell/card";
import "../dev";

import { Container } from "../utility/components/container";
import { DuelCardButton } from "../components/card/duel-card-button";

const card: SpellCard = {
  kind: SpellCardKind.Item,
  spell: getSpellFromReference(SpellReference.Myth_Mythblade)
};

export = hoarcekat(() => {
  const n = source(0);
  useEventListener(RunService.RenderStepped, () => n(math.sin(os.clock()) / 4));

  return (
    <Container size={() => UDim2.fromScale(0.4, 0.4)}>
      <DuelCardButton spellCard={card}
        scale={() => 1 + n()}
        layoutOrder={0}
        duelInfo={createMockDuelInfo()}
        commitChoice={() => { }}
      />
    </Container>
  );
});