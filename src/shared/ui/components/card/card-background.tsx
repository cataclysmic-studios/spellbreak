import Vide, { type Derivable, type PropsWithChildren } from "@rbxts/vide";

import { anchorPoints, positions } from "../../utility/positioning";
import { cardAspectRatio } from "shared/constants";

interface BaseCardProps {
  readonly name?: Derivable<string>;
  readonly image: Derivable<string>;
  readonly layoutOrder: Derivable<number>;
  readonly zIndex?: Derivable<number>;
  readonly hovered?: () => void;
  readonly unhovered?: () => void;
  readonly leftClicked?: () => void;
  readonly rightClicked?: () => void;
}

export function CardBackground({ name, image, layoutOrder, zIndex, hovered, unhovered, leftClicked, rightClicked, children }: PropsWithChildren<BaseCardProps>): Vide.Node {
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
      MouseButton1Down={leftClicked}
      MouseButton2Click={rightClicked}
    >
      <uiaspectratioconstraint AspectRatio={cardAspectRatio} />
      {children}
    </imagebutton>
  );
}