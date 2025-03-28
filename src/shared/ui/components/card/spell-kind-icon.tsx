import Vide, { type Derivable, read } from "@rbxts/vide";

import { spellKindImages } from "shared/constants";
import type { SpellKind } from "shared/structs/spell";
import { anchorPoints, positions } from "shared/ui/utility/positioning";

interface SpellKindIconProps {
  readonly kind: Derivable<SpellKind>;
  readonly size: Derivable<UDim>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly layoutOrder?: Derivable<number>;
}

export function SpellKindIcon({ kind, size, anchorPoint, position, layoutOrder }: SpellKindIconProps): Vide.Node {
  return (
    <imagelabel Name="SpellKind"
      BackgroundTransparency={1}
      Image={() => spellKindImages[read(kind)]}
      AnchorPoint={() => read(anchorPoint) ?? anchorPoints.center}
      Position={() => read(position) ?? positions.center}
      Size={() => new UDim2(read(size).Scale, read(size).Offset, read(size).Scale, read(size).Offset)}
      LayoutOrder={layoutOrder}
    >
      <uiaspectratioconstraint />
    </imagelabel>
  )
}