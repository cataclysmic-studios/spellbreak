import Vide, { type Source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { anchorPoints, positions } from "../utility/positioning";
import { getQuestDescription } from "shared/utility/quests";
import type { QuestID } from "shared/structs/quests";

import { WizText } from "./wiz-text";

const { fromOffset } = UDim2;

export interface QuestInfo {
  readonly questID: QuestID;
  readonly goalIndex: number;
}

interface QuestDescriptionProps {
  readonly info: Source<Maybe<QuestInfo>>;
  readonly visible?: Source<boolean>;
}

export function QuestDescription({ info, visible }: QuestDescriptionProps): Vide.Node {
  const px = usePx();
  const description = () => {
    const currentInfo = info();
    return currentInfo !== undefined
      ? getQuestDescription(currentInfo.questID, currentInfo.goalIndex)
      : "";
  }

  return (
    <WizText
      anchorPoint={anchorPoints.bottomCenter}
      position={positions.bottomCenter.sub(fromOffset(0, px(40)))}
      size={fromOffset(px(384), px(17))}
      dropShadow={px(1)}
      font={Enum.Font.Cartoon}
      textScaled={true}
      text={description}
      visible={visible}
    />
  );
}