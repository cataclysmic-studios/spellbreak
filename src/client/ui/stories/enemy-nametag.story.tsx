import Vide from "@rbxts/vide";

import { School } from "shared/structs/school";
import { EnemyKind } from "shared/structs/enemy/kind";
import { AnchorPoints, Positions } from "../utility/positioning";
import { hoarcekat } from "../utility/hoarcekat";
import "../dev";

import { Container } from "../utility/components/container";
import { EnemyNametag } from "../views/enemy-nametag";

export = hoarcekat(() =>
  <Container
    anchorPoint={AnchorPoints.center}
    position={Positions.center}
    size={UDim2.fromOffset(240, 40)}
  >
    <EnemyNametag
      name="Octavius Rex"
      rank={1}
      kind={EnemyKind.Regular2}
      schools={[School.Fire, School.Balance]}
    />
  </Container>
);