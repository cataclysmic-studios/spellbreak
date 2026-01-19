import Vide, { type Source, type Derivable} from "@rbxts/vide";

import { anchorPoints, positions } from "../positioning";
import { palette } from "shared/ui/palette";

interface ContainerProps {
  readonly name?: Derivable<string>;
  readonly color?: Derivable<Color3>;
  readonly size?: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly layoutOrder?: Derivable<number>;
  readonly transparency?: Derivable<number>;
  readonly visible?: Derivable<boolean>;
  readonly clipsDescendants?: Derivable<boolean>;
  readonly zIndex?: Derivable<number>;
  readonly absolutePositionChanged?: Source<Vector2>;
  readonly absoluteSizeChanged?: Source<Vector2>;
  readonly children?: Vide.Node;
}

/**
 * A component that represents an invisible frame.
 * The container can house children components and provides an offset to center the content.
 */
export function Container({
  name = "ContainerFrame",
  color = palette.white,
  size = UDim2.fromScale(1, 1),
  anchorPoint = anchorPoints.center,
  position = positions.center,
  layoutOrder,
  transparency = 1,
  visible, clipsDescendants, zIndex,
  absolutePositionChanged: absolutePosition, absoluteSizeChanged: absoluteSize,
  children
}: ContainerProps): Vide.Node {
  return (
    <frame
      Name={name}
      Position={position}
      AnchorPoint={anchorPoint}
      BackgroundColor3={color}
      BackgroundTransparency={transparency}
      Size={size}
      Visible={visible}
      ClipsDescendants={clipsDescendants}
      LayoutOrder={layoutOrder}
      ZIndex={zIndex}
      AbsolutePositionChanged={absolutePosition}
      AbsoluteSizeChanged={absoluteSize}
    >
      {children}
    </frame>
  );
}