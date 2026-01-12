import Vide, { source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { palette } from "../palette";
import { anchorPoints, positions } from "../utility/positioning";

import { Container } from "../utility/components/container";
import { WizButton } from "../components/wiz-button";
import { ParchmentBanner } from "../components/parchment-banner";
import { Spellbook, } from "../components/spellbook";

export function MainMenu(): Vide.Node {
  const bookIsOpen = source(false);
  const px = usePx();
  const mainButtonSize = new UDim2(0, px(210), 1, 0);
  const otherButtonSize = new UDim2(0, px(125), 0.85, 0);

  return <Container>
    <uiaspectratioconstraint AspectRatio={4 / 3} />
    <uipadding
      PaddingTop={new UDim(0, px(15))}
      PaddingBottom={new UDim(0, px(20))}
    />
    <ParchmentBanner name="NameBanner"
      anchorPoint={anchorPoints.topCenter}
      position={positions.topCenter}
      size={UDim2.fromOffset(px(800), px(80))}
      textSize={px(32)}
      textColor={palette.blue}
      text="Roslyn ShadowWraith"
      zIndex={1}
    />
    <ParchmentBanner name="DescriptionBanner"
      anchorPoint={anchorPoints.topCenter}
      position={positions.topCenter.add(UDim2.fromOffset(0, px(48)))}
      size={UDim2.fromOffset(px(700), px(80))}
      textSize={px(21)}
      textColor={palette.blue}
      text="Level 170 (Supreme Necromancer)\nHope Springs"
      zIndex={0}
    />
    <Spellbook isOpen={bookIsOpen} onlyOptions={true} />
    <Container name="Buttons"
      anchorPoint={anchorPoints.bottomCenter}
      position={positions.bottomCenter}
      size={UDim2.fromOffset(px(800), px(40))}
    >
      <uilistlayout
        FillDirection={Enum.FillDirection.Horizontal}
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        VerticalAlignment={Enum.VerticalAlignment.Center}
        Padding={new UDim(0, px(15))}
      />
      <WizButton text="Exit" size={otherButtonSize} />
      <WizButton text="Options" size={otherButtonSize} activated={() => bookIsOpen(!bookIsOpen())} />
      <WizButton text="Play" size={mainButtonSize} />
      <WizButton text="Delete" size={otherButtonSize} />
      <WizButton text="New" size={otherButtonSize} active={false} />
    </Container>
  </Container>;
}