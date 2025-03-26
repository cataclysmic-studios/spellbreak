import Vide, { PropsWithChildren, type Derivable } from "@rbxts/vide";

import { anchorPoints } from "../utility/positioning";

interface CardButtonProps {
  readonly name?: Derivable<string>;
  readonly image: Derivable<string>;
  readonly layoutOrder: Derivable<number>;
}

export function CardButton({ name, image, layoutOrder, children }: PropsWithChildren<CardButtonProps>): Vide.Node {
  return (
    <imagelabel Name={name}
      AnchorPoint={anchorPoints.center}
      BackgroundTransparency={0}
      Image={image}
      LayoutOrder={layoutOrder}
      Selectable={true}
      Size={UDim2.fromScale(1, 1)}
    >
      <uiaspectratioconstraint AspectRatio={0.7} />
      {children}
    </imagelabel>
  )
}