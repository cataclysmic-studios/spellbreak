import Vide, { type Source, Show, For, source } from "@rbxts/vide";
import { Players } from "@rbxts/services";

import { usePx } from "../hooks/use-px";
import { Images } from "../utility/images";
import { anchorPoints, positions } from "../utility/positioning";
import type { SpellCard } from "shared/structs/spell-card";

import { Container } from "../utility/components/container";
import { CardButton } from "../components/card-button";
import { BaseCardButton } from "../components/base-card-button";
import { WizText } from "../components/wiz-text";

const MAX_CARDS_IN_HAND = 7;

const mouse = Players.LocalPlayer.GetMouse();

interface BattlePlanningProps {
  readonly hand: Source<SpellCard[]>;
}

/** View for passing, choosing cards, drawing cards, etc. */
export function BattlePlanning({ hand }: BattlePlanningProps): Vide.Node {
  const choiceMade = source(false);
  const px = usePx();

  return <Container name="BattlePlanning" size={UDim2.fromOffset(px(800), px(200))}>
    <Show when={() => !choiceMade()}>
      {() => (
        <Container name="Hand" size={UDim2.fromOffset(px(800), px(100))}>
          <uilistlayout
            Padding={new UDim(0, px(5))}
            FillDirection={Enum.FillDirection.Horizontal}
            HorizontalAlignment={Enum.HorizontalAlignment.Center}
            VerticalAlignment={Enum.VerticalAlignment.Center}
            SortOrder={Enum.SortOrder.LayoutOrder}
          />
          <BaseCardButton image={Images.CardInfoBG} layoutOrder={-1}>
            <WizText
              position={positions.center}
              font={Enum.Font.Cartoon}
              size={UDim2.fromScale(1, 0.5)}
              textSize={px(16)}
              text={"Cards\n64 of 64"}
            />
          </BaseCardButton>
          <For each={hand}>
            {(card, index) => <CardButton spellCard={card} layoutOrder={index} />}
          </For>
        </Container>
      )}
    </Show>
  </Container>;
}