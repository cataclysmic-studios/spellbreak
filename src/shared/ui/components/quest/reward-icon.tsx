import Vide from "@rbxts/vide";

import { usePx } from "shared/ui/hooks/use-px";

import { TinyParchmentBanner } from "../tiny-parchment-banner";
import { anchorPoints, positions } from "shared/ui/utility/positioning";

interface RewardIconProps {
  readonly icon: string;
  readonly amount?: number;
  readonly layoutOrder: number;
}

export function RewardIcon({ icon, amount, layoutOrder }: RewardIconProps): Vide.Node {
  const px = usePx();
  const size = 0.6;

  return (
    <imagelabel Name="RewardIcon"
      BackgroundTransparency={1}
      Size={UDim2.fromScale(size, size)}
      Image={icon}
      LayoutOrder={layoutOrder}
    >
      <uiaspectratioconstraint />
      {
        amount !== undefined
          ? <TinyParchmentBanner name="AmountBanner"
              anchorPoint={anchorPoints.bottomCenter}
              position={positions.bottomCenter.add(UDim2.fromScale(0, 0.215))}
              textSize={px(16)}
              size={UDim2.fromScale(1.45, 0.6)}
              text={tostring(amount)}
            />
          : undefined
      }
    </imagelabel>
  )
}