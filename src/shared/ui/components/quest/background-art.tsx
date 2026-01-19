import Vide from "@rbxts/vide";

import { anchorPoints, positions } from "shared/ui/utility/positioning";
import { Images } from "shared/ui/utility/images";

interface QuestBackgroundArtProps {
  readonly slot: 1 | 2 | 3 | 4;
}

export function QuestBackgroundArt({ slot }: QuestBackgroundArtProps): Vide.Node {
  const art = slot === 1
    ? Images.Background_QuestSketch1
    : slot === 2
      ? Images.Background_QuestSketch2
      : slot === 3
        ? Images.Background_QuestSketch3
        : Images.Background_QuestSketch4;

  return (
    <imagelabel Name="QuestBackgroundArt"
      AnchorPoint={anchorPoints.center}
      Position={positions.center}
      Size={UDim2.fromScale(1, 1)}
      BackgroundTransparency={1}
      Image={art}
      LayoutOrder={slot}
    >
      <uiaspectratioconstraint />
    </imagelabel>
  );
}