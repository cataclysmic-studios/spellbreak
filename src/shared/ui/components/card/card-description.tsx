import Vide, { For, source } from "@rbxts/vide";

import { Palette } from "shared/ui/palette";
import { anchorPoints, positions } from "shared/ui/utility/positioning";
import { CardDescriptionImageKind, type CardDescriptionPart } from "shared/structs/spell";

import { WizText } from "../wiz-text";
import { SpellKindIcon } from "./spell-kind-icon";
import { SchoolIcon } from "../school-icon";
import { Container } from "shared/ui/utility/components/container";

interface CardDescriptionProps {
  readonly parts: CardDescriptionPart[];
}

const iconSize = new UDim(0.3);
export function CardDescription({ parts }: CardDescriptionProps): Vide.Node {
  return (
    <Container
      size={UDim2.fromScale(0.85, 0.3)}
      anchorPoint={anchorPoints.topCenter}
      position={positions.topCenter.add(UDim2.fromScale(0, 0.6625))}
    >
      <uilistlayout
        Padding={new UDim(0.04, 0)}
        FillDirection={Enum.FillDirection.Horizontal}
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        VerticalAlignment={Enum.VerticalAlignment.Top}
        SortOrder={Enum.SortOrder.LayoutOrder}
        Wraps={true}
      />
      <For each={() => parts}>
        {(part, index) => {
          if (typeIs(part, "string")) {
            const textBounds = source(Vector2.zero);
            return (
              <WizText name="DescriptionPart"
                text={part}
                backgroundTransparency={1}
                anchorPoint={anchorPoints.center}
                position={positions.bottomCenter.sub(UDim2.fromScale(0, 0.175))}
                font={Enum.Font.Cartoon}
                textColor={Palette.black}
                textScaled={true}
                alignX={Enum.TextXAlignment.Left}
                alignY={Enum.TextYAlignment.Top}
                size={() => textBounds() !== Vector2.zero ? new UDim2(0, textBounds().X, iconSize.Scale, 0) : UDim2.fromScale(1, iconSize.Scale)}
                layoutOrder={index}
                textBounds={textBounds}
              />
            );
          }

          return part.kind === CardDescriptionImageKind.School
            ? <SchoolIcon school={part.value} size={iconSize} layoutOrder={index} />
            : <SpellKindIcon kind={part.value} size={iconSize} layoutOrder={index} />;
        }}
      </For>
    </Container>
  )
}