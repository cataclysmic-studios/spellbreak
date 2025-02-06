import Vide, { Derivable, read, source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { Palette } from "../palette";
import { AnchorPoints, Positions } from "../utility/positioning";
import { Images } from "../utility/images";

import { Container } from "../utility/components/container";
import { GoldStroke } from "./gold-stroke";
import { WizText } from "./wiz-text";

interface WizButtonProps {
  readonly text: Derivable<string>;
  readonly size: Derivable<UDim2>;
  readonly active?: Derivable<boolean>;
}

export function WizButton({ text, size, active }: WizButtonProps) {
  const defaultBackgroundColor = Palette.deepRed;
  const backgroundColor = source(defaultBackgroundColor);
  const px = usePx();

  const verticalTextPadding = new UDim(0, px(8));
  const isActive = () => read(active) ?? true;
  const transparencyIncrement = () => isActive() ? 0 : 0.5;

  return (
    <imagebutton
      Name={read(text) + "Button"}
      Image={Images.Vignette}
      AnchorPoint={AnchorPoints.center}
      Position={Positions.center}
      BackgroundColor3={backgroundColor}
      BackgroundTransparency={transparencyIncrement}
      ImageTransparency={0.3 + transparencyIncrement()}
      Size={size}
      AutoButtonColor={false}

      MouseLeave={() => backgroundColor(defaultBackgroundColor)}
      MouseEnter={() => {
        if (!isActive()) return;
        backgroundColor(Palette.red);
      }}
      Activated={() => {
        if (!isActive()) return;
        print(read(text) + " button clicked!");
      }}
    >
      <GoldStroke thickness={px(2)} transparency={transparencyIncrement} />
      <Container size={UDim2.fromScale(1, 1).sub(UDim2.fromOffset(px.even(5.5), px.even(5.5)))}>
        <GoldStroke thickness={px(1)} transparency={transparencyIncrement} />
      </Container>
      <WizText
        text={text}
        size={UDim2.fromScale(1, 1)}
        transparency={transparencyIncrement}
        textSize={px(24)}
      >
        <uipadding
          PaddingTop={verticalTextPadding}
          PaddingBottom={verticalTextPadding}
        />
      </WizText>
    </imagebutton>
  );
}