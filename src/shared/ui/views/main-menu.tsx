import Vide from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { Palette } from "../palette";
import { AnchorPoints, Positions } from "../utility/positioning";

import { Container } from "../utility/components/container";
import { WizButton } from "../components/wiz-button";
import { ParchmentBanner } from "../components/parchment-banner";

export function MainMenu() {
  const px = usePx();
  const mainButtonSize = new UDim2(0, px(210), 1, 0);
  const otherButtonSize = new UDim2(0, px(125), 0.75, 0);

  return <>
    <uiaspectratioconstraint AspectRatio={4 / 3} />
    <uipadding
      PaddingTop={new UDim(0, px(15))}
      PaddingBottom={new UDim(0, px(20))}
    />
    <ParchmentBanner name="NameBanner"
      anchorPoint={AnchorPoints.topCenter}
      position={Positions.topCenter}
      size={UDim2.fromOffset(px(800), px(80))}
      textSize={px(32)}
      textColor={Palette.blue}
      text="Roslyn ShadowWraith"
      zIndex={1}
    />
    <ParchmentBanner name="DescriptionBanner"
      anchorPoint={AnchorPoints.topCenter}
      position={Positions.topCenter.add(UDim2.fromOffset(0, px(48)))}
      size={UDim2.fromOffset(px(700), px(80))}
      textSize={px(21)}
      textColor={Palette.blue}
      text="Level 170 (Supreme Necromancer)\nHope Springs"
      zIndex={0}
    />
    <Container name="Buttons"
      anchorPoint={AnchorPoints.bottomCenter}
      position={Positions.bottomCenter}
      size={UDim2.fromOffset(px(800), px(45))}
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
    </Container>
  </>;
}