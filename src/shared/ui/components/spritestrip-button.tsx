import Vide, { read, source, type Derivable } from "@rbxts/vide"

interface SpritestripButtonProps {
  readonly name: Derivable<string>;
  readonly offset?: Derivable<Vector2>;
  readonly hoveredOffset?: Derivable<Vector2>;
  readonly tileSize: Derivable<number>;
  readonly spritestripImage: Derivable<string>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly size?: Derivable<UDim2>;
  readonly transparency?: Derivable<number>;
  readonly scaleType?: Derivable<Enum.ScaleType>;
  readonly layoutOrder?: Derivable<number>;
  readonly hovered?: () => void;
  readonly unhovered?: () => void;
  readonly activated?: () => void;
}

const defaultHoveredOffset = new Vector2(1, 0);
export function SpritestripButton({
  name,
  offset, hoveredOffset, tileSize, spritestripImage: spritesheetImage,
  anchorPoint, position, size, transparency, scaleType, layoutOrder,
  hovered, unhovered, activated
}: SpritestripButtonProps): Vide.Node {
  const isHovered = source(false);
  const imageOffset = () => read(isHovered() ? (hoveredOffset ?? defaultHoveredOffset) : (offset ?? Vector2.zero));

  return (
    <imagebutton Name={name}
      BackgroundTransparency={1}
      AnchorPoint={anchorPoint}
      Position={position}
      Size={size ?? UDim2.fromScale(1, 1)}
      Image={spritesheetImage}
      ImageTransparency={() => read(transparency) ?? 0}
      ImageRectSize={() => new Vector2(read(tileSize), read(tileSize))}
      ImageRectOffset={() => imageOffset().mul(read(tileSize))}
      ScaleType={scaleType}
      LayoutOrder={layoutOrder}

      MouseEnter={() => {
        isHovered(true);
        hovered?.();
      }}
      MouseLeave={() => {
        isHovered(false);
        unhovered?.();
      }}
      Activated={activated}
    />
  );
}