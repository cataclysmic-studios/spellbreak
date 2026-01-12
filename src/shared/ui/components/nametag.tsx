import Vide, { type Derivable, read } from "@rbxts/vide";
import { TextService } from "@rbxts/services";

import { usePx } from "../hooks/use-px";
import { palette } from "../palette";
import { anchorPoints, positions } from "../utility/positioning";
import { Container } from "../utility/components/container";

const luckiestGuy = new Font("rbxasset://fonts/families/LuckiestGuy.json", Enum.FontWeight.Light, Enum.FontStyle.Normal);

interface NametagProps {
  readonly name: Derivable<string>;
  readonly description: Derivable<string>;
  readonly color?: Derivable<Color3>;
  readonly containerSize: Derivable<Vector2>;
  readonly children?: Vide.Node;
}

export function Nametag({ name, description, containerSize, color, children }: NametagProps): Vide.Node {
  const descriptionText = () => read(description).upper();
  const frameSize = UDim2.fromScale(1, 0.45);
  const px = usePx();

  const bottomTextOffsetScale = 0.25;
  return <>
    <textlabel Name="Title"
      AnchorPoint={anchorPoints.topCenter}
      Position={positions.topCenter.add(UDim2.fromScale(0, 0.1))}
      BackgroundTransparency={1}
      FontFace={luckiestGuy}
      Size={UDim2.fromScale(1, 0.55)}
      Text={() => read(name).upper()}
      TextColor3={() => read(color) ?? palette.white}
      TextScaled={true}
    />
    <Container name="Bottom"
      anchorPoint={anchorPoints.bottomCenter}
      position={positions.bottomCenter}
      size={frameSize}
    >
      <uilistlayout
        FillDirection={Enum.FillDirection.Horizontal}
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        Padding={new UDim(0, px(5))}
        SortOrder={Enum.SortOrder.LayoutOrder}
        VerticalAlignment={Enum.VerticalAlignment.Center}
      />
      {children}
      <textlabel Name="Description"
        LayoutOrder={1}
        BackgroundTransparency={1}
        AnchorPoint={anchorPoints.center}
        FontFace={luckiestGuy}
        Text={descriptionText}
        TextColor3={() => read(color) ?? palette.white}
        TextScaled={true}
        Size={() => {
          const descriptionTextSize = read(containerSize)
            .mul(new Vector2(1, frameSize.Y.Scale)).Y;
          const frameAbsoluteSize = read(containerSize)
            .mul(new Vector2(frameSize.X.Scale, frameSize.Y.Scale))
            .add(new Vector2(frameSize.X.Offset, frameSize.Y.Offset));

          const bounds = TextService.GetTextSize(descriptionText(), descriptionTextSize, "LuckiestGuy", frameAbsoluteSize);
          return new UDim2(0, px(bounds.X + 1), 1 + bottomTextOffsetScale, 0);
        }}
      >
        <uipadding PaddingTop={new UDim(bottomTextOffsetScale, 0)} />
      </textlabel>
    </Container>
  </>;
}