import Vide, { Derivable, read } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { AnchorPoints, Positions } from "../utility/positioning";
import { Images } from "../utility/images";

interface ParchmentBannerProps {
  readonly text: Derivable<string>;
  readonly textSize: Derivable<number>;
  readonly textColor: Derivable<Color3>;
  readonly size: Derivable<UDim2>;
  readonly position?: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly zIndex?: Derivable<number>;
}

export function ParchmentBanner({ text, textSize, textColor, size, position, anchorPoint, zIndex }: ParchmentBannerProps) {
  const px = usePx();

  return (
    <imagelabel
      BackgroundTransparency={1}
      Image={Images.ParchmentBanner}
      AnchorPoint={anchorPoint}
      Position={position}
      Size={size}
      ZIndex={zIndex}
    >
      <textlabel
        AnchorPoint={AnchorPoints.center}
        Position={Positions.center.sub(UDim2.fromScale(0, 0.15))}
        Text={read(text).upper()}
        BackgroundTransparency={1}
        Size={UDim2.fromScale(1, 1)}
        Font={Enum.Font.LuckiestGuy}
        TextSize={textSize}
        TextColor3={textColor}
      >
        <uistroke
          Thickness={px(1.4)}
          Transparency={0.4}
        />
      </textlabel>
    </imagelabel>
  );
}