import Vide from "@rbxts/vide";

import { School } from "shared/structs/school";
import { EnemyKind } from "shared/structs/enemy/kind";
import { anchorPoints, positions } from "../../utility/positioning";
import { hoarcekat } from "../../utility/hoarcekat";
import "../../dev";

import { Container } from "../../utility/components/container";
import { EnemyNametag } from "../../components/enemy-nametag";

const containerSize = new Vector2(480, 80);
export = hoarcekat(() =>
  <Container
    anchorPoint={anchorPoints.center}
    position={positions.center}
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