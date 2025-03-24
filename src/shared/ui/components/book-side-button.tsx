import Vide, { type Derivable, read } from "@rbxts/vide";
import { $nameof } from "rbxts-transform-debug";

import { usePx } from "../hooks/use-px";
import { Images } from "../utility/images";
import { anchorPoints, positions } from "../utility/positioning";
import { SpritestripButton } from "./spritestrip-button";

interface BookSideButtonProps {
  readonly icon: Derivable<string>;
  readonly iconSize?: Derivable<number>;
  readonly active?: Derivable<boolean>;
  readonly layoutOrder?: Derivable<number>;
  readonly activated?: () => void;
}

export function BookSideButton({ icon, iconSize, active, layoutOrder, activated }: BookSideButtonProps): Vide.Node {
  const isActive = () => read(active) ?? true;
  const px = usePx();

  return (
    <imagelabel Name={$nameof(BookSideButton)}
      AnchorPoint={anchorPoints.leftCenter}
      BackgroundTransparency={1}
      Size={UDim2.fromOffset(84, 58)}
      Image={Images.RedRibbon}
      LayoutOrder={layoutOrder}
    >
      <SpritestripButton name="Icon"
        anchorPoint={anchorPoints.center}
        position={positions.center}
        transparency={isActive() ? 0 : 0.5}
        scaleType={Enum.ScaleType.Fit}
        spritestripImage={icon}
        tileSize={() => read(iconSize) ?? 32}
        size={UDim2.fromScale(0.75, 0.75)}
        activated={activated}
      />
    </imagelabel>
  )
}