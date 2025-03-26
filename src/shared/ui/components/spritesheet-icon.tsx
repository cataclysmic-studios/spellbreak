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
  readonly zIndex?: Derivable<number>;
}

export function SpritesheetIcon({ name, anchorPoint, position, offset, spritesheetImage, iconSize, size, layoutOrder, zIndex }: SpritesheetIconProps): Vide.Node {
  return (
    <imagelabel Name={name}
      BackgroundTransparency={1}
      AnchorPoint={anchorPoint}
      Position={position}
      Size={() => read(size) ?? UDim2.fromScale(1, 1)}
      Image={spritesheetImage}
      ImageRectSize={() => new Vector2(read(iconSize), read(iconSize))}
      ImageRectOffset={() => read(offset).mul(read(iconSize))}
      LayoutOrder={layoutOrder}
      ZIndex={zIndex}
    >
      <uiaspectratioconstraint />
    </imagelabel>
  );
}