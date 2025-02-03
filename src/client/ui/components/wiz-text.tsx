import Vide, { read, type Derivable, type Node } from "@rbxts/vide";

import { AnchorPoints, Positions } from "../utility/positioning";
import { Palette } from "../palette";

export interface WizTextProps {
  text: Derivable<string>;
  textSize: Derivable<number>;
  textColor?: Derivable<Color3>;
  transparency?: Derivable<number>;
  size?: Derivable<UDim2>;
  position?: Derivable<UDim2>;
  anchorPoint?: Derivable<Vector2>;
  children?: Node;
}

export function WizText({ text, textSize, textColor, transparency, size, position, anchorPoint, children }: WizTextProps) {
  return (
    <textlabel
      AnchorPoint={anchorPoint ?? AnchorPoints.center}
      Position={read(position ?? Positions.center).add(UDim2.fromScale(0, 0.08))}
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