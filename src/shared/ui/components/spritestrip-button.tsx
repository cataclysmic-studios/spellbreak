import Vide, { PropsWithChildren, read, source, type Derivable } from "@rbxts/vide"

interface SpritestripButtonProps {
  readonly name: Derivable<string>;
  readonly offset?: Derivable<Vector2>;
  readonly hoveredOffset?: Derivable<Vector2>;
  readonly pressedOffset?: Derivable<Vector2>;
  readonly inactiveOffset?: Derivable<Vector2>;
  readonly tileSize: Derivable<number>;
  readonly spritestripImage: Derivable<string>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly size?: Derivable<UDim2>;
  readonly transparency?: Derivable<number>;
  readonly scaleType?: Derivable<Enum.ScaleType>;
  readonly layoutOrder?: Derivable<number>;
  readonly zIndex?: Derivable<number>;
  readonly active?: Derivable<boolean>;
  readonly visible?: Derivable<boolean>;
  readonly hovered?: () => void;
  readonly unhovered?: () => void;
  readonly activated?: () => void;
}

const DEFAULT_HOVER_OFFSET = new Vector2(1, 0);
const DEFAULT_PRESSED_OFFSET = new Vector2(0, 1);
const DEFAULT_INACTIVE_OFFSET = new Vector2(1, 1);
export function SpritestripButton({
  name,
  offset = Vector2.zero, hoveredOffset = DEFAULT_HOVER_OFFSET,
  pressedOffset = DEFAULT_PRESSED_OFFSET, inactiveOffset = DEFAULT_INACTIVE_OFFSET,
  tileSize, spritestripImage: spritesheetImage, anchorPoint, position,
  size = UDim2.fromScale(1, 1), transparency = 0,
  scaleType, layoutOrder, zIndex, active = true, visible,
  hovered, unhovered, activated, children
}: PropsWithChildren<SpritestripButtonProps>): Vide.Node {
  const isHovered = source(false);
  const isPressed = source(false);
  const imageOffset = () => read(!read(active) ? inactiveOffset : isPressed() ? pressedOffset : isHovered() ? hoveredOffset : offset);

  return (
    <imagebutton Name={name}
      BackgroundTransparency={1}
      AnchorPoint={anchorPoint}
      Position={position}
      Size={size}
      Image={spritesheetImage}
      ImageTransparency={transparency}
      ImageRectSize={() => new Vector2(read(tileSize), read(tileSize))}
      ImageRectOffset={() => imageOffset().mul(read(tileSize))}
      ScaleType={scaleType}
      LayoutOrder={layoutOrder}
      ZIndex={zIndex}
      Visible={visible}

      MouseEnter={() => {
        if (!read(active)) return;
        isHovered(true);
        hovered?.();
      }}
      MouseLeave={() => {
        if (isPressed())
          isPressed(false);
        isHovered(false);
        unhovered?.();
      }}
      MouseButton1Down={() => {
        if (!read(active)) return;
        isPressed(true);
      }}
      MouseButton1Up={() => {
        if (!read(active)) return;
        isPressed(false);
        activated?.();
      }}
    >
      {children}
    </imagebutton>
  );
}