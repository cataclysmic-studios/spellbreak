import Vide, { read, type Derivable, type Node } from "@rbxts/vide";

import { anchorPoints, positions } from "../positioning";

interface ContainerProps {
  readonly name?: Derivable<string>;
  readonly size?: Derivable<UDim2>;
  readonly position?: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly layoutOrder?: Derivable<number>;
  readonly transparency?: Derivable<number>;
  readonly clipsDescendants?: Derivable<boolean>;
  readonly children?: Node;
}

/**
 * A component that represents an invisible frame.
 * The container can house children components and provides an offset to center the content.
 */
export function Container({ name, size, position, anchorPoint, layoutOrder, transparency, clipsDescendants, children }: ContainerProps): Vide.Node {
  return (
    <frame
      Name={read(name) ?? "ContainerFrame"}
      Position={position ?? positions.center}
      AnchorPoint={anchorPoint ?? anchorPoints.center}
      BackgroundTransparency={() => read(transparency) ?? 1}
      Size={() => read(size) ?? UDim2.fromScale(1, 1)}
      ClipsDescendants={clipsDescendants}
      LayoutOrder={layoutOrder}
    >
      {children}
    </frame>
  );
}