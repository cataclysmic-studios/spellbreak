import Vide, { Derivable, Show, Source } from "@rbxts/vide";

import { usePx } from "shared/ui/hooks/use-px";
import { anchorPoints, positions } from "shared/ui/utility/positioning";
import { getQuestByID } from "shared/utility/quests";
import { Images } from "shared/ui/utility/images";
import type { QuestID } from "shared/structs/quests";

import { WizText } from "../wiz-text";

interface QuestFrameProps {
  readonly quest: QuestID;
  readonly layoutOrder?: Derivable<number>;
}

export function QuestFrame({ quest: id, layoutOrder }: QuestFrameProps): Vide.Node {
  const quest = getQuestByID(id);
  const art = quest.main ? Images.Background_MainQuestFrame : Images.Background_QuestFrame;
  const px = usePx();

  return (
    <imagelabel Name="QuestFrame"
      BackgroundTransparency={1}
      Image={art}
      Size={UDim2.fromScale(1, 1)}
      LayoutOrder={layoutOrder}
    >
      <uipadding PaddingTop={new UDim(0, px(2))} />
      <WizText name="Title"
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter}
        text={quest.name}
      />
    </imagelabel>
  )
}