import Vide from "@rbxts/vide";

import { anchorPoints, positions } from "../utility/positioning";
import { hoarcekat } from "../utility/hoarcekat";
import { QuestID } from "shared/structs/quests";
import "../dev";

import { QuestFrame } from "../components/quest/frame";

export = hoarcekat(() => (
  <QuestFrame
    info={{
      questID: QuestID.WC_1,
      goalIndex: 0
    }}
    anchorPoint={anchorPoints.center}
    position={positions.center}
    size={UDim2.fromScale(0.4, 0.4)}
  />
));