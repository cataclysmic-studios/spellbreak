import Vide, { type Source, type Derivable, read } from "@rbxts/vide";

import { anchorPoints, positions } from "../positioning";

interface ContainerProps {
  readonly name?: Derivable<string>;
  readonly size?: Derivable<UDim2>;
  readonly position?: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly layoutOrder?: Derivable<number>;
  readonly transparency?: Derivable<number>;
  readonly clipsDescendants?: Derivable<boolean>;
  readonly absolutePositionChanged?: Source<Vector2>;
  readonly absoluteSizeChanged?: Source<Vector2>;
  readonly children?: Vide.Node;
}

/**
 * A component that represents an invisible frame.
 * The container can house children components and provides an offset to center the content.
 */
export function Container({ name, size, position, anchorPoint, layoutOrder, transparency, clipsDescendants, absolutePositionChanged: absolutePosition, absoluteSizeChanged: absoluteSize, children }: ContainerProps): Vide.Node {
  return (
    <frame
      Name={() => read(name) ?? "ContainerFrame"}
      Position={() => read(position) ?? positions.center}
      AnchorPoint={() => read(anchorPoint) ?? anchorPoints.center}
      BackgroundTransparency={() => read(transparency) ?? 1}
      Size={() => read(size) ?? UDim2.fromScale(1, 1)}
      ClipsDescendants={clipsDescendants}
      LayoutOrder={layoutOrder}
      AbsolutePositionChanged={absolutePosition}
      AbsoluteSizeChanged={absoluteSize}
    >
      {children}
    </frame>
  );
}