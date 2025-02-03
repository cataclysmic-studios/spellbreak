import Vide from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { AnchorPoints, Positions } from "../utility/positioning";
import { PlaceID } from "shared/structs/place-id";

import { OnlyInPlace } from "../components/main-menu-only";
import { WizButton } from "../components/wiz-button";
import { ParchmentBanner } from "../components/parchment-banner";
import { Palette } from "../palette";

export function MainMenu() {
  const px = usePx();
  const mainButtonSize = new UDim2(0, px(210), 1, 0);
  const otherButtonSize = new UDim2(0, px(125), 0.75, 0);

  return (
    <OnlyInPlace placeID={PlaceID.MainMenu}>
      {() => <>
        <uiaspectratioconstraint AspectRatio={16 / 9} />
        <uipadding PaddingBottom={new UDim(0, px(15))} />
        <ParchmentBanner name="NameBanner"
          anchorPoint={AnchorPoints.topCenter}
          position={Positions.topCenter}
          size={UDim2.fromOffset(px(800), px(80))}
          textSize={px(32)}
          textColor={Palette.blue}
          text="Wolf BearWielder"
          zIndex={1}
        />
        <ParchmentBanner name="DescriptionBanner"
          anchorPoint={AnchorPoints.topCenter}
          position={Positions.topCenter.add(UDim2.fromOffset(0, px(48)))}
          size={UDim2.fromOffset(px(700), px(80))}
          textSize={px(21)}
          textColor={Palette.blue}
          text="Level 125 (Champion Pyromancer)\nWizard City Library"
          zIndex={0}
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