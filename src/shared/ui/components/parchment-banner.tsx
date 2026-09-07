import Vide, { read, type Derivable } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { positions } from "../utility/positioning";
import { palette } from "../palette";
import { Images } from "../utility/images";

import { WizText } from "./wiz-text";

interface ParchmentBannerProps {
  readonly name?: Derivable<string>;
  readonly text: Derivable<string>;
  readonly textSize: Derivable<number>;
  readonly size: Derivable<UDim2>;
  readonly textColor?: Derivable<Color3>;
  readonly position?: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly zIndex?: Derivable<number>;
  readonly stroke?: Derivable<boolean>;
}

export function ParchmentBanner({ name, text, textSize, textColor = palette.black, size, position, anchorPoint, zIndex, stroke = true }: ParchmentBannerProps): Vide.Node {
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
      <WizText text={text}
        position={positions.center.sub(UDim2.fromScale(0, 0.23))}
        textSize={textSize}
        textColor={textColor}
      >
        {() => read(stroke) ? <uistroke Thickness={px.scale(1.4)} Transparency={0.4} /> : undefined}
      </WizText>
    </imagelabel>
  );
}