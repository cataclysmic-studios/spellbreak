import Vide from "@rbxts/vide";

import { AnchorPoints, Positions } from "../utility/positioning";
import { hoarcekat } from "../utility/hoarcekat";
import "../dev";

import { Container } from "../utility/components/container";
import { Nametag } from "../components/nametag";
import { nametagColors } from "shared/constants";

export = hoarcekat(() =>
  <Container
    anchorPoint={AnchorPoints.center}
    position={Positions.center}
    size={UDim2.fromOffset(240, 40)}
  >
    <Nametag
      name="Roslyn ShadowWraith"
      description="Savior of the Spiral"
      color={nametagColors.player}
    />
  </Container>
);