import Vide, { For, source } from "@rbxts/vide";
import { RunService, TextService } from "@rbxts/services";

import { palette } from "shared/ui/palette";
import { anchorPoints, positions } from "shared/ui/utility/positioning";
import { CardDescriptionImageKind, type CardDescriptionPart } from "shared/structs/spell";

import { WizText } from "../wiz-text";
import { SpellKindIcon } from "./spell-kind-icon";
import { SchoolIcon } from "../school-icon";
import { Container } from "shared/ui/utility/components/container";

interface CardDescriptionProps {
  readonly parts: CardDescriptionPart[];
}

const ICON_SIZE = 0.3;
const FRAME_SIZE = UDim2.fromScale(0.85, ICON_SIZE);

const FRAME_SCALE_VECTOR = new Vector2(FRAME_SIZE.X.Scale, FRAME_SIZE.Y.Scale);
const FRAME_OFFSET_VECTOR = new Vector2(FRAME_SIZE.X.Offset, FRAME_SIZE.Y.Offset);
export function CardDescription({ parts }: CardDescriptionProps): Vide.Node {
  const containerSize = source(Vector2.zero);

  return (
    <Container name="Description"
      anchorPoint={anchorPoints.topCenter}
      position={positions.topCenter.add(UDim2.fromScale(0, 0.6625))}
      size={FRAME_SIZE}
      absoluteSizeChanged={containerSize}
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
          if (!typeIs(part, "string")) {
            return part.kind === CardDescriptionImageKind.School
              ? <SchoolIcon school={part.value} size={new UDim(ICON_SIZE)} layoutOrder={index} />
              : <SpellKindIcon kind={part.value} size={new UDim(ICON_SIZE)} layoutOrder={index} />;
          }

          return (
            <WizText name="DescriptionPart"
              anchorPoint={anchorPoints.center}
              backgroundTransparency={1}
              text={part}
              textColor={palette.black}
              textScaled={true}
              font={Enum.Font.Cartoon}
              alignX={Enum.TextXAlignment.Left}
              alignY={Enum.TextYAlignment.Top}
              size={() => {
                const frameSize = containerSize();
                const targetTextSize = TextService.GetTextSize(
                  part,
                  frameSize.Y * ICON_SIZE, // font size proportional to container height
                  Enum.Font.Cartoon,
                  new Vector2(frameSize.X, frameSize.Y)
                );

                return new UDim2(targetTextSize.X / frameSize.X, 0, ICON_SIZE, 0);
              }}
              layoutOrder={index}
            />
          );
        }}
      </For>
    </Container>
  );
}