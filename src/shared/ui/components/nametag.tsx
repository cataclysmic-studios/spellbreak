import Vide, { type Derivable, effect, type Node, read, source } from "@rbxts/vide";
import { RunService, TextService } from "@rbxts/services";
import { useEventListener } from "@rbxts/pretty-vide-utils";

import { usePx } from "../hooks/use-px";
import { Palette } from "../palette";
import { AnchorPoints, Positions } from "../utility/positioning";

const fondamento = new Font("rbxasset://fonts/families/Fondamento.json", Enum.FontWeight.Heavy, Enum.FontStyle.Normal);

interface NametagProps {
  readonly name: Derivable<string>;
  readonly description: Derivable<string>;
  readonly color?: Derivable<Color3>;
  readonly containerSize: Derivable<Vector2>;
  readonly children?: Node;
}

export function Nametag({ name, description, containerSize, color, children }: NametagProps) {
  const descriptionText = () => read(description).upper();
  const frameSize = UDim2.fromScale(1, 0.45);
  const px = usePx();

  return <>
    <textlabel
      Name="Title"
      BackgroundTransparency={1}
      FontFace={fondamento}
      Size={UDim2.fromScale(1, 0.55)}
      Text={read(name).upper()}
      TextColor3={color ?? Palette.white}
      TextScaled={true}
    />
    <frame
      Name="Bottom"
      AnchorPoint={AnchorPoints.bottomCenter}
      Position={Positions.bottomCenter}
      BackgroundTransparency={1}
      Size={frameSize}
    >
      <uilistlayout
        FillDirection={Enum.FillDirection.Horizontal}
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        Padding={new UDim(0, px(5))}
        SortOrder={Enum.SortOrder.LayoutOrder}
        VerticalAlignment={Enum.VerticalAlignment.Center}
      />
      {children}
      <textlabel
        Name="Description"
        LayoutOrder={1}
        BackgroundTransparency={1}
        FontFace={fondamento}
        Text={descriptionText}
        TextColor3={color ?? Palette.white}
        TextScaled={true}
        Size={() => {
          const descriptionTextSize = read(containerSize)
            .mul(new Vector2(1, frameSize.Y.Scale)).Y;
          const frameAbsoluteSize = read(containerSize)
            .mul(new Vector2(frameSize.X.Scale, frameSize.Y.Scale))
            .add(new Vector2(frameSize.X.Offset, frameSize.Y.Offset));

          const bounds = TextService.GetTextSize(descriptionText(), descriptionTextSize, "Fondamento", frameAbsoluteSize);
          return new UDim2(0, px(bounds.X + 1), 1, 0);
        }}
      />
    </frame>
  </>;
}