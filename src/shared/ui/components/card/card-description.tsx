import Vide, { For } from "@rbxts/vide";
import { TextService } from "@rbxts/services";

import { palette } from "shared/ui/palette";
import { anchorPoints, positions } from "shared/ui/utility/positioning";
import { cardReferenceWidth, cardReferenceHeight } from "shared/constants";
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

// The card is laid out at a fixed reference resolution (see `cardReferenceWidth`)
// and scaled as a whole via UIScale, so this frame's absolute size is a known
// constant - measuring it once here (instead of reactively off AbsoluteSizeChanged)
// avoids re-running TextService.GetTextSize every time the card's on-screen
// scale changes, which was a source of visible per-frame text jitter.
const FRAME_ABSOLUTE_SIZE = new Vector2(
  cardReferenceWidth * FRAME_SIZE.X.Scale,
  cardReferenceHeight * FRAME_SIZE.Y.Scale
);

export function CardDescription({ parts }: CardDescriptionProps): Vide.Node {
  return (
    <Container name="Description"
      anchorPoint={anchorPoints.topCenter}
      position={positions.topCenter.add(UDim2.fromScale(0, 0.675))}
      size={FRAME_SIZE}
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

          const fontSize = 2 + (FRAME_ABSOLUTE_SIZE.Y * ICON_SIZE);
          const targetTextSize = TextService.GetTextSize(part, fontSize, Enum.Font.Cartoon, FRAME_ABSOLUTE_SIZE);

          return (
            <WizText name="DescriptionPart"
              anchorPoint={anchorPoints.center}
              backgroundTransparency={1}
              text={part}
              textColor={palette.black}
              textSize={fontSize}
              font={Enum.Font.Cartoon}
              alignX={Enum.TextXAlignment.Left}
              alignY={Enum.TextYAlignment.Top}
              size={UDim2.fromScale(targetTextSize.X / FRAME_ABSOLUTE_SIZE.X, ICON_SIZE)}
              layoutOrder={index}
            />
          );
        }}
      </For>
    </Container>
  );
}