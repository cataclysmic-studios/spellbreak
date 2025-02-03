import Vide, { Derivable } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { Positions } from "../utility/positioning";
import { Images } from "../utility/images";

import { WizText } from "./wiz-text";

interface ParchmentBannerProps {
  readonly name?: Derivable<string>;
  readonly text: Derivable<string>;
  readonly textSize: Derivable<number>;
  readonly textColor: Derivable<Color3>;
  readonly size: Derivable<UDim2>;
  readonly position?: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly zIndex?: Derivable<number>;
}

export function ParchmentBanner({ name, text, textSize, textColor, size, position, anchorPoint, zIndex }: ParchmentBannerProps) {
  const px = usePx();

  return (
    <imagelabel
      Name={name}
      BackgroundTransparency={1}
      Image={Images.ParchmentBanner}
      AnchorPoint={anchorPoint}
      Position={position}
      Size={size}
      ZIndex={zIndex}
    >
      <WizText
        text={text}
        position={Positions.center.sub(UDim2.fromScale(0, 0.07))}
        textSize={textSize}
        textColor={textColor}
      >
        <uistroke Thickness={px.scale(1.4)} Transparency={0.4} />
      </WizText>
    </imagelabel>
  );
}