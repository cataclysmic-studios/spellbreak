import Vide, { PropsWithChildren } from "@rbxts/vide";

import { Container } from "shared/ui/utility/components/container";
import { anchorPoints, positions } from "shared/ui/utility/positioning";

export function BookPageContainer({ children }: PropsWithChildren): Vide.Node {
  return (
    <Container
      anchorPoint={anchorPoints.center}
      position={positions.center.sub(UDim2.fromScale(0.0125, 0.003))}
      size={UDim2.fromScale(0.78, 0.885)}
      zIndex={4}
    >
      {children}
    </Container>
  );
}