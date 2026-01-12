import Vide, { Derivable, read, source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { palette } from "../palette";
import { anchorPoints, positions } from "../utility/positioning";
import { Images } from "../utility/images";

import { Container } from "../utility/components/container";
import { GoldStroke } from "./gold-stroke";
import { WizText } from "./wiz-text";

interface WizButtonProps {
  readonly text: Derivable<string>;
  readonly size: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly textSize?: Derivable<number>;
  readonly active?: Derivable<boolean>;
  readonly activated?: () => void;
}

export function WizButton({ text, size, anchorPoint, position, textSize, active, activated }: WizButtonProps): Vide.Node {
  const hovered = source(false);
  const px = usePx();

  const verticalTextPadding = new UDim(0, px(8));
  const isActive = () => read(active) ?? true;
  const transparencyIncrement = () => isActive() ? 0 : 0.5;

  return (
    <imagebutton Name={() => read(text) + "Button"}
      Image={Images.Vignette}
      AnchorPoint={() => read(anchorPoint) ?? anchorPoints.center}
      Position={() => read(position) ?? positions.center}
      BackgroundColor3={() => hovered() ? palette.wizRed : palette.wizDeepRed}
      BackgroundTransparency={transparencyIncrement}
      ImageTransparency={() => 0.3 + transparencyIncrement()}
      Size={size}
      AutoButtonColor={false}

      MouseLeave={() => hovered(false)}
      MouseEnter={() => {
        if (!isActive()) return;
        hovered(true);
      }}
      Activated={() => {
        if (!isActive()) return;
        activated?.();
      }}
    >
      <GoldStroke thickness={px(2)} transparency={transparencyIncrement} />
      <Container size={UDim2.fromScale(1, 1).sub(UDim2.fromOffset(px.even(5.5), px.even(5.5)))}>
        <GoldStroke thickness={px(1)} transparency={transparencyIncrement} />
      </Container>
      <WizText text={text}
        size={UDim2.fromScale(1, 1)}
        transparency={transparencyIncrement}
        textSize={() => read(textSize) ?? px(24)}
        textColor={() => hovered() ? palette.white : palette.yellow}
      >
        <uipadding
          PaddingTop={verticalTextPadding}
          PaddingBottom={verticalTextPadding}
        />
      </WizText>
    </imagebutton>
  );
}