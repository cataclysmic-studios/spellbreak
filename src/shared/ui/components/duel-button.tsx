import Vide, { Derivable, read, source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { palette } from "../palette";
import { anchorPoints, positions } from "../utility/positioning";
import { Images } from "../utility/images";

import { WizText } from "./wiz-text";

interface WizButton2Props {
  readonly text: Derivable<string>;
  readonly size: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly textSize?: Derivable<number>;
  readonly active?: Derivable<boolean>;
  readonly activated?: () => void;
}

export function DuelButton({ text, size, anchorPoint, position, textSize, active, activated }: WizButton2Props): Vide.Node {
  const hovered = source(false);
  const px = usePx();

  const verticalTextPadding = new UDim(0, px(8));
  const isActive = () => read(active) ?? true;
  const transparencyIncrement = () => isActive() ? 0 : 0.5;

  return (
    <imagebutton Name={() => read(text) + "Button"}
      Image={Images.Button_Orange}
      ImageColor3={() => isActive() ? palette.white : palette.mediumGray}
      AnchorPoint={() => read(anchorPoint) ?? anchorPoints.center}
      Position={() => read(position) ?? positions.center}
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
      <WizText text={text}
        size={UDim2.fromScale(1, 1)}
        transparency={transparencyIncrement}
        textSize={() => read(textSize) ?? px(22)}
        textColor={() => hovered() ? palette.white : isActive() ? palette.yellow : palette.mediumGray}
      >
        <uipadding
          PaddingTop={verticalTextPadding}
          PaddingBottom={verticalTextPadding}
        />
      </WizText>
    </imagebutton>
  );
}