import Vide, { type Derivable, read } from "@rbxts/vide";

interface SpritesheetIconProps {
  readonly name: Derivable<string>;
  readonly offset: Derivable<Vector2>;
  readonly iconSize: Derivable<number>;
  readonly spritesheetImage: Derivable<string>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly size?: Derivable<UDim2>;
  readonly layoutOrder?: Derivable<number>;
}

export function SpritesheetIcon({ name, anchorPoint, position, offset, spritesheetImage, iconSize, size, layoutOrder }: SpritesheetIconProps): Vide.Node {
  return (
    <imagelabel Name={name}
      BackgroundTransparency={1}
      AnchorPoint={anchorPoint}
      Position={position}
      Size={size ?? UDim2.fromScale(1, 1)}
      Image={spritesheetImage}
      ImageRectSize={() => new Vector2(read(iconSize), read(iconSize))}
      ImageRectOffset={() => read(offset).mul(read(iconSize))}
      LayoutOrder={layoutOrder}
    >
      <uiaspectratioconstraint />
    </imagelabel>
  );
}