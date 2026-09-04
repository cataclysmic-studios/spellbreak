import Vide, { type Source } from "@rbxts/vide";

import { usePx } from "../../hooks/use-px";
import { Images } from "../../utility/images";
import { anchorPoints, positions } from "../../utility/positioning";

interface XpBarProps {
  readonly progress: Source<number>;
  readonly visible?: Source<boolean>;
}

export function XpBar({ progress, visible }: XpBarProps): Vide.Node {
  const px = usePx();
  const size = px(600);

  return (
    <imagelabel Name="XpBarBackground"
      BackgroundTransparency={1}
      AnchorPoint={anchorPoints.bottomCenter}
      Position={positions.bottomCenter.sub(UDim2.fromOffset(0, px(8)))}
      Size={UDim2.fromOffset(size, size)}
      Image={Images.Background_XP}
      ZIndex={1}
      Visible={visible}
    >
      <uiaspectratioconstraint AspectRatio={25} />
      <uipadding
        PaddingLeft={new UDim(0, px(16))}
        PaddingRight={new UDim(0, px(16))}
        PaddingTop={new UDim(0, px(3))}
        PaddingBottom={new UDim(0, px(3))}
      />
      <imagelabel Name="XpBar"
        BackgroundTransparency={1}
        AnchorPoint={anchorPoints.leftCenter}
        Position={positions.leftCenter}
        Size={() => UDim2.fromScale(math.clamp(progress(), 0, 1), 1)}
        Image={Images.XpBar}
        ZIndex={0}
      />
    </imagelabel>
  );
}