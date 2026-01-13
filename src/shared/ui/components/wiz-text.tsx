import Vide, { type Source, type Derivable, read } from "@rbxts/vide";

import { anchorPoints, positions } from "../utility/positioning";
import { palette } from "../palette";
import { usePx } from "../hooks/use-px";

export interface WizTextProps {
  readonly name?: Derivable<string>;
  readonly text: Derivable<string>;
  readonly textSize?: Derivable<number>;
  readonly textColor?: Derivable<Color3>;
  readonly textScaled?: Derivable<boolean>;
  readonly textWrap?: Derivable<boolean>;
  readonly transparency?: Derivable<number>;
  readonly backgroundTransparency?: Derivable<number>;
  readonly size?: Derivable<UDim2>;
  readonly position?: Derivable<UDim2>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly font?: Derivable<Enum.Font>;
  readonly fontSize?: Derivable<number>;
  readonly alignX?: Derivable<Enum.TextXAlignment>;
  readonly alignY?: Derivable<Enum.TextYAlignment>;
  readonly automaticSize?: Derivable<Enum.AutomaticSize>;
  readonly visible?: Derivable<boolean>;
  readonly layoutOrder?: Derivable<number>;
  readonly zIndex?: Derivable<number>;
  readonly textBoundsChanged?: Source<Vector2>;
  readonly absoluteSizeChanged?: Source<Vector2>;
  readonly absolutePositionChanged?: Source<Vector2>;
  readonly children?: Vide.Node;
}

const DEFAULT_FONT = Enum.Font.LuckiestGuy;
const DEFAULT_TEXT_SIZE = 14;

export function WizText({
  name, text, textSize, textColor, textScaled, textWrap, transparency, backgroundTransparency,
  size, position, anchorPoint, font, alignX, alignY, automaticSize, visible, layoutOrder, zIndex,
  textBoundsChanged, absoluteSizeChanged, absolutePositionChanged,
  children
}: WizTextProps): Vide.Node {
  const isDefaultFont = () => read(font) === undefined || read(font) === DEFAULT_FONT;
  const getPosition = () => read(position) ?? positions.center;
  const getTextSize = () => read(textSize) ?? DEFAULT_TEXT_SIZE;
  const px = usePx();

  return (
    <textlabel Name={name}
      AutomaticSize={automaticSize}
      AnchorPoint={() => read(anchorPoint) ?? anchorPoints.center}
      Position={() => isDefaultFont() ? getPosition().add(UDim2.fromOffset(0, getTextSize() / px(6))) : getPosition()}
      Text={() => isDefaultFont() ? read(text).upper() : read(text)}
      TextSize={getTextSize}
      TextScaled={textScaled}
      TextWrapped={textWrap}
      TextColor3={() => read(textColor) ?? palette.yellow}
      TextXAlignment={alignX}
      TextYAlignment={alignY}
      BackgroundTransparency={() => read(backgroundTransparency) ?? 1}
      Size={() => read(size) ?? UDim2.fromScale(1, 1)}
      Font={() => read(font) ?? Enum.Font.LuckiestGuy}
      TextTransparency={transparency}
      Visible={visible}
      LayoutOrder={layoutOrder}
      ZIndex={zIndex}
      TextBoundsChanged={textBoundsChanged}
      AbsoluteSizeChanged={absoluteSizeChanged}
      AbsolutePositionChanged={absolutePositionChanged}
    >
      {children}
    </textlabel >
  );
}