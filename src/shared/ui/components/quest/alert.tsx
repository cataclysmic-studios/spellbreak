import Vide, { Source, read, source } from "@rbxts/vide";

import { Images } from "../../utility/images";
import { WizText } from "../wiz-text";
import { anchorPoints, positions } from "../../utility/positioning";
import { usePx } from "../../hooks/use-px";
import { palette } from "../../palette";
import { useEventListener } from "@rbxts/pretty-vide-utils";
import { RunService } from "@rbxts/services";

export const enum AlertMode {
  Disabled,
  HandIn,
  InProgress,
  PickUp
}

interface QuestAlertProps {
  readonly mode: Source<AlertMode>;
}

export function QuestAlert({ mode }: QuestAlertProps): Vide.Node {
  const px = usePx();
  const rotation = source(0);
  const visible = () => mode() !== AlertMode.Disabled;
  useEventListener(RunService.PreRender, dt => rotation(rotation() + dt * 16));

  return (
    <>
      <uiaspectratioconstraint />
      <imagelabel
        BackgroundTransparency={1}
        Image={Images.RedSpiral}
        ImageColor3={new Color3(0.9, 0.9, 0.9)}
        Size={UDim2.fromScale(1, 1)}
        Visible={visible}
        Rotation={rotation}
      />
      <WizText
        anchorPoint={anchorPoints.center}
        position={positions.center.add(UDim2.fromScale(0, 0.08))}
        size={UDim2.fromScale(1, 1)}
        text={() => mode() === AlertMode.PickUp ? "!" : "?"}
        textColor={() => mode() === AlertMode.InProgress ? palette.mediumGray : palette.yellow}
        textScaled={true}
        visible={visible}
      >
        <uistroke Thickness={px(1)} Transparency={0.2} />
      </WizText>
    </>
  );
}