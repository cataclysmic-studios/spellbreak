import Vide, { type Derivable, type Node } from "@rbxts/vide";

import { AnchorPoints, Positions } from "../positioning";

interface ContainerProps {
  name?: Derivable<string>;
  size?: Derivable<UDim2>;
  position?: Derivable<UDim2>;
  anchorPoint?: Derivable<Vector2>;
  children?: Node;
}

/**
 * A component that represents an invisible frame.
 * The container can house children components and provides an offset to center the content.
 */
export function Container({ name, size, position, anchorPoint, children }: ContainerProps) {
  return (
    <frame
      Name={name}
      Position={position ?? Positions.center}
      AnchorPoint={anchorPoint ?? AnchorPoints.center}
      BackgroundTransparency={1}
      Size={size ?? UDim2.fromScale(1, 1)}
    >
      {children}
    </frame>
  );
}