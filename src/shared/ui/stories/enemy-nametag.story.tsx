import Vide from "@rbxts/vide";

import { School } from "shared/structs/school";
import { EnemyKind } from "shared/structs/enemy/kind";
import { AnchorPoints, Positions } from "../utility/positioning";
import { hoarcekat } from "../utility/hoarcekat";
import "../dev";

import { Container } from "../utility/components/container";
import { EnemyNametag } from "../components/enemy-nametag";

const containerSize = new Vector2(480, 80);
export = hoarcekat(() =>
  <Container
    anchorPoint={AnchorPoints.center}
    position={Positions.center}
    size={UDim2.fromOffset(containerSize.X, containerSize.Y)}
  >
    <EnemyNametag
      descriptor={{
        name: "Octavius Rex",
        rank: 1,
        kind: EnemyKind.Regular2,
        schools: [School.Fire, School.Death]
      }}
      containerSize={containerSize}
    />
  </Container>
);