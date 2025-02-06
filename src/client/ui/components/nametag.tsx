import Vide, { type Derivable, derive, type Node, read, source } from "@rbxts/vide";

import { Palette } from "../palette";
import { AnchorPoints, Positions } from "../utility/positioning";
import { usePx } from "../hooks/use-px";
import { TextService } from "@rbxts/services";

const fondamento = new Font("rbxasset://fonts/families/Fondamento.json", Enum.FontWeight.Heavy, Enum.FontStyle.Normal);

interface NametagProps {
  readonly name: Derivable<string>;
  readonly description: Derivable<string>;
  readonly color?: Derivable<Color3>;
  readonly children?: Node;
}

export function Nametag({ name, description, color, children }: NametagProps) {
  const descriptionAbsoluteSize = source(new Vector2);
  const bottomFrameAbsoluteSize = source(new Vector2);
  const descriptionText = () => read(description).upper();
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
      Size={UDim2.fromScale(1, 0.45)}
      AbsoluteSizeChanged={bottomFrameAbsoluteSize}
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
          const params = new Instance("GetTextBoundsParams");
          params.Font = fondamento;
          params.Size = descriptionAbsoluteSize().Y;
          params.Width = bottomFrameAbsoluteSize().X;
          params.Text = descriptionText();

          const bounds = TextService.GetTextBoundsAsync(params);
          return new UDim2(0, px(bounds.X), 1, 0)
        }}
        AbsoluteSizeChanged={descriptionAbsoluteSize}
      />
    </frame>
  </>
}