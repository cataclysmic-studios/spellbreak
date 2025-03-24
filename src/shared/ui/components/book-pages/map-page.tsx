import Vide from "@rbxts/vide";

import { Palette } from "shared/ui/palette";
import { anchorPoints, positions } from "shared/ui/utility/positioning";

export function MapPage(): Vide.Node {
  return <frame
    AnchorPoint={anchorPoints.center}
    Position={positions.center}
    BackgroundColor3={Palette.black}
    BackgroundTransparency={0.6}
    Size={UDim2.fromScale(0.9, 0.9)}
  />
}