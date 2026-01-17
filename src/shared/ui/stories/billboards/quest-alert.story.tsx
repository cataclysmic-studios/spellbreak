import Vide, { source } from "@rbxts/vide";

import { anchorPoints, positions } from "../../utility/positioning";
import { hoarcekat } from "../../utility/hoarcekat";
import "../../dev";

import { Container } from "../../utility/components/container";
import { AlertMode, QuestAlert } from "shared/ui/components/quest/alert";

const mode = source(AlertMode.PickUp);
export = hoarcekat(() =>
  <Container
    anchorPoint={anchorPoints.center}
    position={positions.center}
    size={UDim2.fromScale(0.25, 0.25)}
  >
    <QuestAlert mode={mode} />
  </Container>
);