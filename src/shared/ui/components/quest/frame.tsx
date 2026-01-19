import Vide, { type Derivable } from "@rbxts/vide";

import { usePx } from "shared/ui/hooks/use-px";
import { anchorPoints, positions } from "shared/ui/utility/positioning";
import { palette } from "shared/ui/palette";
import { getGoalTargetName, getGoalTargetPortrait, getGoalTargetZone, getQuestByID } from "shared/utility/quests";
import { getZoneName, getZoneWorldName } from "shared/utility/zone";
import { Images } from "shared/ui/utility/images";
import type { QuestInfo } from "shared/structs/quests";

import { WizText } from "../wiz-text";

interface QuestFrameProps {
  readonly info: QuestInfo;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly size?: Derivable<UDim2>;
  readonly layoutOrder?: Derivable<number>;
}

export function QuestFrame({
  info,
  anchorPoint = anchorPoints.center,
  position = positions.center,
  size = UDim2.fromScale(1, 1),
  layoutOrder
}: QuestFrameProps): Vide.Node {
  const quest = getQuestByID(info.questID);
  const currentGoal = quest.goals[info.goalIndex];
  const art = quest.main ? Images.Background_MainQuestFrame : Images.Background_QuestFrame;
  const px = usePx();
  const locationText = () => {
    const zoneID = getGoalTargetZone(currentGoal);
    const name = getZoneName(zoneID);
    const worldName = getZoneWorldName(zoneID);
    return `${worldName}\n${name}`;
  };

  return (
    <imagelabel Name="QuestFrame"
      AnchorPoint={anchorPoint}
      Position={position}
      BackgroundTransparency={1}
      Image={art}
      Size={size}
      LayoutOrder={layoutOrder}
    >
      <uiaspectratioconstraint />
      <uipadding PaddingTop={new UDim(0, px(2))} />
      <WizText name="Title"
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter}
        size={UDim2.fromScale(1, 0.17)}
        text={quest.name}
      />
      <WizText name="Action"
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter.add(UDim2.fromScale(0, 0.16))}
        size={UDim2.fromScale(1, 0.1)}
        font={Enum.Font.Cartoon}
        textSize={px(15)}
        textColor={palette.black}
        text={currentGoal.action}
      />
      <imagelabel Name="Portrait"
        AnchorPoint={anchorPoints.topCenter}
        Position={positions.topCenter.add(UDim2.fromScale(0, 0.25))}
        BackgroundTransparency={1}
        Image={getGoalTargetPortrait(currentGoal)}
        Size={UDim2.fromScale(0.25, 0.25)}
      >
        <uiaspectratioconstraint />
      </imagelabel>
      <WizText name="Target"
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter.add(UDim2.fromScale(0, 0.5))}
        size={UDim2.fromScale(1, 0.1)}
        font={Enum.Font.Cartoon}
        textSize={px(15)}
        textColor={palette.black}
        text={getGoalTargetName(currentGoal)}
      />
      <WizText name="Location"
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter.add(UDim2.fromScale(0, 0.63))}
        size={UDim2.fromScale(1, 0.1)}
        font={Enum.Font.Cartoon}
        textSize={px(15)}
        textColor={palette.black}
        text={locationText}
      />
    </imagelabel>
  )
}