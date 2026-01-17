import Vide, { type Source } from "@rbxts/vide";

import { usePx } from "../../hooks/use-px";
import { anchorPoints, positions } from "../../utility/positioning";
import { getQuestDescription } from "shared/utility/quests";
import type { QuestInfo } from "shared/structs/quests";

import { WizText } from "../wiz-text";

const { fromOffset } = UDim2;

export interface QuestHelperProps {
  readonly info: Source<Maybe<QuestInfo>>;
  readonly offset: Source<UDim2>;
  readonly visible?: Source<boolean>;
}

export function QuestDescription({ info, offset, visible }: QuestHelperProps): Vide.Node {
  const px = usePx();
  const description = () => {
    const currentInfo = info();
    return currentInfo !== undefined
      ? getQuestDescription(currentInfo.questID, currentInfo.goalIndex)
      : "";
  }

  return (
    <WizText name="QuestDescription"
      anchorPoint={anchorPoints.bottomCenter}
      position={() => positions.bottomCenter.sub(fromOffset(0, px(50))).add(offset())}
      size={fromOffset(px(428), px(20))}
      dropShadow={px(1)}
      font={Enum.Font.Cartoon}
      textScaled={true}
      text={description}
      visible={visible}
    />
  );
}