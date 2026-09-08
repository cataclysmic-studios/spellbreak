import Vide, { type Derivable, read } from "@rbxts/vide";

import { usePx } from "../../hooks/use-px";
import { anchorPoints, positions } from "../../utility/positioning";
import { SpritestripButton } from "../spritestrip-button";

interface BookSideButtonProps {
  readonly icon: Derivable<string>;
  readonly iconSize?: Derivable<number>;
  readonly active?: Derivable<boolean>;
  readonly layoutOrder?: Derivable<number>;
  readonly zIndex?: Derivable<number>;
  readonly activated?: () => void;
}

export function BookSideButton({ icon, iconSize = 32, active = true, layoutOrder, zIndex, activated }: BookSideButtonProps): Vide.Node {
  const px = usePx();

  return (
    <imagelabel Name="BookSideButton"
      AnchorPoint={anchorPoints.leftCenter}
      BackgroundTransparency={1}
      Size={UDim2.fromOffset(px(80), px(50))}
      LayoutOrder={layoutOrder}
      ZIndex={zIndex}
    >
      <SpritestripButton name="Icon"
        anchorPoint={anchorPoints.center}
        position={positions.center}
        transparency={read(active) ? 0 : 0.5}
        scaleType={Enum.ScaleType.Fit}
        spritestripImage={icon}
        tileSize={iconSize}
        pressedOffset={new Vector2(1, 0)}
        size={UDim2.fromScale(0.75, 0.75)}
        active={active}
        activated={activated}
        zIndex={zIndex}
      />
    </imagelabel>
  )
}
