import Vide, { Derivable, read, source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { Palette } from "../palette";
import { AnchorPoints, Positions } from "../utility/positioning";
import { Images } from "../utility/images";
import { GoldStroke } from "./gold-stroke";

interface WizButtonProps {
  readonly text: Derivable<string>;
  readonly size: Derivable<UDim2>;
  readonly active?: Derivable<boolean>;
}

export function WizButton({ text, size, active }: WizButtonProps) {
  const defaultBackgroundColor = Palette.darkRed;
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
        backgroundColor(Palette.deepRed);
      }}
      Activated={() => {
        if (!isActive()) return;
        print(read(text) + " button clicked!");
      }}
    >
      <frame
        AnchorPoint={AnchorPoints.center}
        Position={Positions.center}
        BackgroundTransparency={1}
        Size={UDim2.fromScale(1, 1).sub(UDim2.fromOffset(px(6), px(6)))}
      >
        <GoldStroke thickness={px(1)} transparency={transparencyIncrement} />
      </frame>
      <textlabel
        AnchorPoint={AnchorPoints.center}
        Position={Positions.center.add(UDim2.fromScale(0, 0.08))}
        Text={read(text).upper()}
        BackgroundTransparency={1}
        Size={UDim2.fromScale(1, 1)}
        Font={Enum.Font.LuckiestGuy}
        TextSize={px(24)}
        TextColor3={Palette.yellow}
        TextTransparency={transparencyIncrement}
      >
        <uipadding
          PaddingTop={verticalTextPadding}
          PaddingBottom={verticalTextPadding}
        />
      </textlabel>
      <GoldStroke thickness={px(2)} transparency={transparencyIncrement} />
    </imagebutton>
  );
}