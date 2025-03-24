import Vide from "@rbxts/vide";

import { anchorPoints, positions } from "../../utility/positioning";
import { hoarcekat } from "../../utility/hoarcekat";
import "../../dev";

import { Container } from "../../utility/components/container";
import { Nametag } from "../../components/nametag";
import { nametagColors } from "shared/constants";

const containerSize = new Vector2(480, 80);
export = hoarcekat(() =>
  <Container
    anchorPoint={anchorPoints.center}
    position={positions.center}
    size={UDim2.fromOffset(containerSize.X, containerSize.Y)}
  >
    <Nametag
      name="Roslyn ShadowWraith"
      description="Savior of the Spiral"
      color={nametagColors.player}
      containerSize={containerSize}
    />
  </Container>
);