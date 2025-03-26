import Vide, { type Derivable, type PropsWithChildren } from "@rbxts/vide";

import { anchorPoints, positions } from "../utility/positioning";
import { cardAspectRatio } from "shared/constants";

interface BaseCardProps {
  readonly name?: Derivable<string>;
  readonly image: Derivable<string>;
  readonly layoutOrder: Derivable<number>;
  readonly zIndex?: Derivable<number>;
  readonly hovered?: () => void;
  readonly unhovered?: () => void;
  readonly activated?: () => void;
}

export function BaseCardButton({ name, image, layoutOrder, zIndex, hovered, unhovered, activated, children }: PropsWithChildren<BaseCardProps>): Vide.Node {
  return (
    <imagebutton Name={name}
      AnchorPoint={anchorPoints.center}
      Position={positions.center}
      AutoButtonColor={false}
      BackgroundTransparency={1}
      Image={image}
      LayoutOrder={layoutOrder}
      Size={UDim2.fromScale(1, 1)}
      ZIndex={zIndex}

      MouseEnter={hovered}
      MouseLeave={unhovered}
      Activated={activated}
    >
      <uiaspectratioconstraint AspectRatio={cardAspectRatio} />
      {children}
    </imagebutton>
  );
}