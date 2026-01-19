import Vide, { type Derivable } from "@rbxts/vide";

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
}

export function TinyParchmentBanner({ name, text, textSize, textColor = palette.black, size, position, anchorPoint, zIndex }: ParchmentBannerProps): Vide.Node {
  return (
    <imagelabel Name={name}
      BackgroundTransparency={1}
      Image={Images.TinyParchmentBanner}
      AnchorPoint={anchorPoint}
      Position={position}
      Size={size}
      ZIndex={zIndex}
    >
      <WizText
        position={positions.center.sub(UDim2.fromScale(0, 0.16))}
        font={Enum.Font.Cartoon}
        textSize={textSize}
        textColor={textColor}
        text={text}
      />
    </imagelabel>
  );
}