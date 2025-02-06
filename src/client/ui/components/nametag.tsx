import Vide, { type Derivable, type Node, read } from "@rbxts/vide";

import { Palette } from "../palette";
import { AnchorPoints, Positions } from "../utility/positioning";

const fondamento = new Font("rbxasset://fonts/families/Fondamento.json", Enum.FontWeight.Heavy, Enum.FontStyle.Normal);

interface NametagProps {
  readonly name: Derivable<string>;
  readonly description: Derivable<string>;
  readonly color?: Derivable<Color3>;
  readonly children?: Node;
}

export function Nametag({ name, description, color, children }: NametagProps) {
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
    >
      <uilistlayout
        FillDirection={Enum.FillDirection.Horizontal}
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        Padding={new UDim(0.05, 0)}
        SortOrder={Enum.SortOrder.LayoutOrder}
        VerticalAlignment={Enum.VerticalAlignment.Center}
      />
      {children}
      <textlabel
        Name="Info"
        BackgroundTransparency={1}
        FontFace={fondamento}
        Size={UDim2.fromScale(1, 1)}
        Text={read(description).upper()}
        TextColor3={color ?? Palette.white}
        TextScaled={true}
        LayoutOrder={1}
      />
    </frame>
  </>
}