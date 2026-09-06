import Vide, { type Derivable, read } from "@rbxts/vide";

import { anchorPoints } from "shared/ui/utility/positioning";

import { WizText } from "../../../wiz-text";

interface SingleStatProps {
  /** Fraction of the page's width/height the stat's icon (baked into the page background) is centered on. */
  readonly x: Derivable<number>;
  readonly y: Derivable<number>;
  readonly value: Derivable<string>;
}

/** Overlays a value onto one of the icon+capsule readouts already baked into a `Background_Character_Right_Stats*` page - the icon itself is part of that background art. */
export function SingleStat({ x, y, value }: SingleStatProps): Vide.Node {
  return (
    <WizText name="SingleStat"
      anchorPoint={anchorPoints.leftCenter}
      position={() => new UDim2(read(x) + 0.045, 0, read(y), 0)}
      size={UDim2.fromOffset(120, 24)}
      textSize={16}
      text={value}
    />
  );
}
