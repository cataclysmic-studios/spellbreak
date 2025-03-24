import Vide, { read, type Derivable, type Node } from "@rbxts/vide";

import { anchorPoints, positions } from "../positioning";

interface ContainerProps {
  readonly name?: Derivable<string>;
  readonly size?: Derivable<UDim2>;
  readonly position?: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly children?: Node;
}

/**
 * A component that represents an invisible frame.
 * The container can house children components and provides an offset to center the content.
 */
export function Container({ name, size, position, anchorPoint, children }: ContainerProps): Vide.Node {
  return (
    <frame
      Name={read(name) ?? "ContainerFrame"}
      Position={position ?? positions.center}
      AnchorPoint={anchorPoint ?? anchorPoints.center}
      BackgroundTransparency={1}
      Size={size ?? UDim2.fromScale(1, 1)}
    >
      {children}
    </frame>
  );
}