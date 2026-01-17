import Vide, { type PropsWithChildren, type Derivable, type Source, read } from "@rbxts/vide";

import { Images } from "../utility/images";
import { anchorPoints, positions } from "../utility/positioning";
import { palette } from "../palette";
import { WizText } from "./wiz-text";

interface PromptPanelProps {
  readonly name?: Derivable<string>;
  readonly anchorPoint: Derivable<Vector2>;
  readonly position: Derivable<UDim2>;
  readonly size: Derivable<UDim2>;
  readonly title: Source<string>;
  readonly portrait: Source<string>;
  readonly visible: Source<boolean>;
}

export function PromptPanel({ name, anchorPoint, position, size, title, portrait, visible, children }: PropsWithChildren<PromptPanelProps>): Vide.Node {
  return (
    <imagelabel Name={() => read(name) ?? "PromptPanel"}
      AnchorPoint={anchorPoint}
      Position={position}
      BackgroundTransparency={1}
      Size={size}
      Image={Images.Background_Dialog}
      Visible={visible}
    >
      <uiaspectratioconstraint AspectRatio={4} />
      <imagelabel Name="Portrait"
        AnchorPoint={anchorPoints.leftCenter}
        Position={positions.leftCenter}
        BackgroundTransparency={1}
        Size={UDim2.fromScale(0.95, 0.95)}
        Image={portrait}
        ZIndex={2}
      >
        <uiaspectratioconstraint />
      </imagelabel>
      <WizText name="Title"
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter.add(UDim2.fromScale(0, 0.06))}
        size={UDim2.fromScale(0.55, 0.15)}
        alignX={Enum.TextXAlignment.Left}
        textScaled={true}
        textColor={palette.black}
        text={title}
      />
      {children}
    </imagelabel>
  );
}