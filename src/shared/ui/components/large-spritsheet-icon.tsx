import Vide, { type Derivable, read } from "@rbxts/vide";

import { Images } from "../utility/images";
import { SpritesheetIcon } from "./spritesheet-icon";

interface LargeSpritesheetIconProps {
  readonly name: Derivable<string>;
  readonly offset: Derivable<Vector2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly size?: Derivable<UDim2>;
  readonly layoutOrder?: Derivable<number>;
}

export function LargeSpritesheetIcon({ name, anchorPoint, position, offset, size, layoutOrder }: LargeSpritesheetIconProps): Vide.Node {
  return (
    <SpritesheetIcon name={name}
      anchorPoint={anchorPoint}
      position={position}
      offset={offset}
      size={size ?? UDim2.fromScale(1, 1)}
      iconSize={52}
      spritesheetImage={Images.LargeIconSpritesheet}
      layoutOrder={layoutOrder}
    >
      <uiaspectratioconstraint />
    </SpritesheetIcon>
  );
}