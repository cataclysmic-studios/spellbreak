import Vide from "@rbxts/vide";

import { anchorPoints, positions } from "../../utility/positioning";
import { hoarcekat } from "../../utility/hoarcekat";
import "../../dev";

import { Container } from "../../utility/components/container";
import { AlertMode, QuestAlert } from "shared/ui/components/quest-alert";

export = hoarcekat(() =>
  <Container
    anchorPoint={anchorPoints.center}
    position={positions.center}
    size={UDim2.fromScale(0.4, 0.4)}
  >
    <QuestAlert mode={AlertMode.PickUp} />
  </Container>
);