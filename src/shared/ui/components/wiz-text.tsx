import Vide, { read, type Derivable, type Node } from "@rbxts/vide";

import { anchorPoints, positions } from "../utility/positioning";
import { Palette } from "../palette";

export interface WizTextProps {
  readonly text: Derivable<string>;
  readonly textSize?: Derivable<number>;
  readonly textColor?: Derivable<Color3>;
  readonly textScaled?: Derivable<boolean>;
  readonly transparency?: Derivable<number>;
  readonly backgroundTransparency?: Derivable<number>;
  readonly size?: Derivable<UDim2>;
  readonly position?: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly font?: Derivable<Enum.Font>;
  readonly alignX?: Derivable<Enum.TextXAlignment>;
  readonly alignY?: Derivable<Enum.TextYAlignment>;
  readonly children?: Node;
}

const DEFAULT_FONT = Enum.Font.LuckiestGuy;

export function WizText({ text, textSize, textColor, textScaled, transparency, backgroundTransparency, size, position, anchorPoint, font, alignX, alignY, children }: WizTextProps): Vide.Node {
  const isDefaultFont = () => read(font) === undefined || read(font) === DEFAULT_FONT;
  const getPosition = () => read(position) ?? positions.center;
  return (
    <textlabel
      AnchorPoint={() => read(anchorPoint) ?? anchorPoints.center}
      Position={() => isDefaultFont() ? getPosition().add(UDim2.fromScale(0, 0.08)) : getPosition()}
      Text={() => isDefaultFont() ? read(text).upper() : read(text)}
      TextSize={textSize}
      TextScaled={textScaled}
      TextColor3={() => read(textColor) ?? Palette.yellow}
      TextXAlignment={alignX}
      TextYAlignment={alignY}
      BackgroundTransparency={() => read(backgroundTransparency) ?? 1}
      Size={() => read(size) ?? UDim2.fromScale(1, 1)}
      Font={() => read(font) ?? Enum.Font.LuckiestGuy}
      TextTransparency={transparency}
    >
      {children}
    </textlabel >
  );
}