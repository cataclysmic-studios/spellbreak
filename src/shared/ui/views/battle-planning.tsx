import Vide, { Show, source } from "@rbxts/vide";
import { Players } from "@rbxts/services";

import { usePx } from "../hooks/use-px";
import { Images } from "../utility/images";

import { Container } from "../utility/components/container";
import { CardButton } from "../components/card-button";
import { anchorPoints, positions } from "../utility/positioning";

const MAX_CARDS_IN_HAND = 7;

const mouse = Players.LocalPlayer.GetMouse();

/** View for choosing cards, passing, drawing cards, etc. */
export function BattlePlanning(): Vide.Node {
  const choiceMade = source(false);
  const px = usePx();

  return <Container name="BattlePlanning" size={UDim2.fromOffset(px(800), px(200))}>
    <Container name="Hand" size={UDim2.fromOffset(px(800), px(100))}>
      <uilistlayout
        Padding={new UDim(0, px(4))}
        FillDirection={Enum.FillDirection.Horizontal}
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        VerticalAlignment={Enum.VerticalAlignment.Center}
        SortOrder={Enum.SortOrder.LayoutOrder}
      />
      <CardButton name="Info" image={Images.CardInfoBG} layoutOrder={-1}>
        <textlabel
          AnchorPoint={anchorPoints.center}
          Position={positions.center}
          BackgroundTransparency={1}
          Font={Enum.Font.Cartoon}
          Size={UDim2.fromScale(1, 0.5)}
          TextColor3={Color3.fromRGB(255, 255, 0)}
          TextSize={px(16)}
          Text={"Cards\n64 of 64"}
        />
      </CardButton>
    </Container>
    <Show when={() => !choiceMade()}>
      {() => { }}
    </Show>
  </Container>;
}