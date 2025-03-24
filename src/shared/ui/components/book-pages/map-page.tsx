import Vide from "@rbxts/vide";

import { Palette } from "shared/ui/palette";
import { AnchorPoints, Positions } from "shared/ui/utility/positioning";

export function MapPage(): Vide.Node {
  return <frame
    AnchorPoint={AnchorPoints.center}
    Position={Positions.center}
    BackgroundColor3={Palette.black}
    BackgroundTransparency={0.6}
    Size={UDim2.fromScale(0.9, 0.9)}
  />
}