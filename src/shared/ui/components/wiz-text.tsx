import Vide, { read, type Derivable, type Node } from "@rbxts/vide";

import { anchorPoints, positions } from "../utility/positioning";
import { Palette } from "../palette";

export interface WizTextProps {
  readonly text: Derivable<string>;
  readonly textSize: Derivable<number>;
  readonly textColor?: Derivable<Color3>;
  readonly transparency?: Derivable<number>;
  readonly size?: Derivable<UDim2>;
  readonly position?: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly children?: Node;
}

export function WizText({ text, textSize, textColor, transparency, size, position, anchorPoint, children }: WizTextProps): Vide.Node {
  return (
    <textlabel
      AnchorPoint={anchorPoint ?? anchorPoints.center}
      Position={read(position ?? positions.center).add(UDim2.fromScale(0, 0.08))}
      Text={read(text).upper()}
      BackgroundTransparency={1}
      Size={size ?? UDim2.fromScale(1, 1)}
      Font={Enum.Font.LuckiestGuy}
      TextSize={textSize}
      TextColor3={textColor ?? Palette.yellow}
      TextTransparency={transparency}
    >
      {children}
    </textlabel>
  );
}