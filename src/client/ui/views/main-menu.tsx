import Vide from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { AnchorPoints, Positions } from "../utility/positioning";
import { PlaceID } from "shared/structs/place-id";

import { OnlyInPlace } from "../components/main-menu-only";
import { WizButton } from "../components/wiz-button";

export function MainMenu() {
  const px = usePx();
  const verticalPadding = new UDim(0, px(15));
  const mainButtonSize = new UDim2(0, px(210), 1, 0);
  const otherButtonSize = new UDim2(0, px(125), 0.75, 0);

  return (
    <OnlyInPlace placeID={PlaceID.MainMenu}>
      {() => <>
        <uipadding
          PaddingTop={verticalPadding}
          PaddingBottom={verticalPadding}
        />
        <frame
          Name="Buttons"
          BackgroundTransparency={1}
          AnchorPoint={AnchorPoints.bottomCenter}
          Position={Positions.bottomCenter}
          Size={UDim2.fromOffset(px(800), px(45))}
        >
          <uilistlayout
            FillDirection={Enum.FillDirection.Horizontal}
            HorizontalAlignment={Enum.HorizontalAlignment.Center}
            VerticalAlignment={Enum.VerticalAlignment.Center}
            Padding={new UDim(0, px(15))}
          />
          <WizButton text="Exit" size={otherButtonSize} />
          <WizButton text="Options" size={otherButtonSize} />
          <WizButton text="Play" size={mainButtonSize} />
          <WizButton text="Delete" size={otherButtonSize} />
          <WizButton text="New" size={otherButtonSize} active={false} />
        </frame>
      </>}
    </OnlyInPlace>
  );
}