import Vide, { Source } from "@rbxts/vide";
import type { BaseID } from "@rbxts/id";

import { Images } from "../utility/images";
import { anchorPoints, positions } from "../utility/positioning";
import type {  DialogID } from "shared/structs/npc/dialog";

interface DialogProps extends BaseID<Source<Maybe<DialogID>>> { }

export function Dialog({ id }: DialogProps): Vide.Node {
  return (
    <imagelabel Name="DialogContainer"
      AnchorPoint={anchorPoints.bottomCenter}
      Position={positions.bottomCenter}
      BackgroundTransparency={1}
      Size={UDim2.fromScale(0.5, 0.5)}
      Visible={() => id() !== undefined}
      Image={Images.Background_Dialog}
    >
      <uiaspectratioconstraint AspectRatio={4} />
    </imagelabel>
  );
}