import Vide from "@rbxts/vide";

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

  return <imagelabel Name="QuestBackgroundArt"
    BackgroundTransparency={1}
    Image={art}
    Size={UDim2.fromScale(1, 1)}
    LayoutOrder={slot}
  />;
}