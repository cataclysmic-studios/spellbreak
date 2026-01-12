import Vide from "@rbxts/vide";

import { palette } from "shared/ui/palette";
import { anchorPoints, positions } from "shared/ui/utility/positioning";

export function BackpackPage(): Vide.Node {
  return <frame
    AnchorPoint={anchorPoints.center}
    Position={positions.center}
    BackgroundColor3={palette.black}
    BackgroundTransparency={0.6}
    Size={UDim2.fromScale(0.9, 0.9)}
  />
}