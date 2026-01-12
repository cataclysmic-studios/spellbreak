import Vide, { Derivable, read } from "@rbxts/vide";

import { Images } from "../utility/images";
import { WizText } from "./wiz-text";
import { anchorPoints, positions } from "../utility/positioning";
import { usePx } from "../hooks/use-px";
import { palette } from "../palette";

export const enum AlertMode {
  Disabled,
  HandIn,
  InProgress,
  PickUp
}

interface QuestAlertProps {
  readonly mode: Derivable<AlertMode>;
}

export function QuestAlert({ mode }: QuestAlertProps): Vide.Node {
  const px = usePx();

  return (
    <>
      <uiaspectratioconstraint />
      <imagelabel
        BackgroundTransparency={1}
        Image={Images.RedSpiral}
        ImageColor3={new Color3(0.9, 0.9, 0.9)}
        Size={UDim2.fromScale(1, 1)}
        Visible={() => read(mode) !== AlertMode.Disabled}
      >
        <WizText
          anchorPoint={anchorPoints.center}
          position={positions.center}
          size={UDim2.fromScale(1, 1)}
          text={() => read(mode) === AlertMode.PickUp ? "!" : "?"}
          textColor={() => read(mode) === AlertMode.InProgress ? palette.mediumGray : palette.yellow}
          textScaled={true}
        >
          <uistroke Thickness={px(1)} Transparency={0.2} />
        </WizText>
      </imagelabel>
    </>
  );
}