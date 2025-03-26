import Vide, { Derivable, read } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { positions } from "../utility/positioning";
import { Images } from "../utility/images";

import { WizText } from "./wiz-text";
import { Palette } from "../palette";

interface ParchmentBannerProps {
  readonly name?: Derivable<string>;
  readonly text: Derivable<string>;
  readonly textSize: Derivable<number>;
  readonly size: Derivable<UDim2>;
  readonly textColor?: Derivable<Color3>;
  readonly position?: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly zIndex?: Derivable<number>;
}

export function ParchmentBanner({ name, text, textSize, textColor, size, position, anchorPoint, zIndex }: ParchmentBannerProps): Vide.Node {
  const px = usePx();

  return (
    <imagelabel Name={name}
      BackgroundTransparency={1}
      Image={Images.ParchmentBanner}
      AnchorPoint={anchorPoint}
      Position={position}
      Size={size}
      ZIndex={zIndex}
    >
      <WizText
        text={text}
        position={positions.center.sub(UDim2.fromScale(0, 0.23))}
        textSize={textSize}
        textColor={read(textColor) ?? Palette.black}
      >
        <uistroke Thickness={px.scale(1.4)} Transparency={0.4} />
      </WizText>
    </imagelabel>
  );
}