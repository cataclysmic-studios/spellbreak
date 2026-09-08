import { RunService } from "@rbxts/services";
import { useEventListener } from "@rbxts/pretty-vide-utils";
import Vide, { source, For, read, type Derivable } from "@rbxts/vide";

import { usePx } from "shared/ui/hooks/use-px";
import { anchorPoints, positions } from "shared/ui/utility/positioning";
import { palette } from "shared/ui/palette";
import { getGoalTargetName, getGoalTargetPortrait, getGoalTargetZone, getQuestByID } from "shared/utility/quests";
import { getZoneByID, getWorldName } from "shared/utility/zone";
import { Images } from "shared/ui/utility/images";
import { QuestRewardKind, type QuestInfo } from "shared/structs/quests";

import { WizText } from "../wiz-text";
import { Container } from "shared/ui/utility/components/container";
import { RewardIcon } from "./reward-icon";

const REWARD_ICONS: Record<QuestRewardKind, string> = {
  [QuestRewardKind.Gold]: Images.Icon_Gold,
  [QuestRewardKind.XP]: Images.Icon_XP
};

const SELECTED_PULSE_SPEED = 3;

interface QuestFrameProps {
  readonly info: QuestInfo;
  readonly selected?: Derivable<boolean>;
  readonly activated?: () => void;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly size?: Derivable<UDim2>;
  readonly layoutOrder?: Derivable<number>;
}

export function QuestFrame({
  info,
  selected,
  activated,
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
    const zone = getZoneByID(getGoalTargetZone(currentGoal));
    return `${getWorldName(zone.world)}\n${zone.name}`;
  };

  const isSelected = () => read(selected) ?? false;
  const pulseAlpha = source(0);
  useEventListener(RunService.Heartbeat, dt => {
    if (!isSelected()) return;
    pulseAlpha((pulseAlpha() + dt * SELECTED_PULSE_SPEED) % (2 * math.pi));
  });
  const selectedColor = () => {
    const t = (math.sin(pulseAlpha()) + 1) / 2;
    return palette.white.Lerp(palette.lightYellow, t);
  };

  return (
    <imagebutton Name="QuestFrame"
      AnchorPoint={anchorPoint}
      Position={position}
      BackgroundTransparency={1}
      AutoButtonColor={false}
      ImageColor3={() => isSelected() ? selectedColor() : palette.white}
      Image={art}
      Size={size}
      LayoutOrder={layoutOrder}
      MouseButton1Click={activated}
    >
      <uiaspectratioconstraint />
      <uipadding PaddingTop={new UDim(0, px(0.5))} />
      <WizText name="Title"
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter.add(UDim2.fromScale(0, 0.06))}
        size={UDim2.fromScale(0.75, 0.08)}
        textScaled
        text={quest.name}
      />
      <WizText name="Action"
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter.add(UDim2.fromScale(0, 0.15))}
        size={UDim2.fromScale(1, 0.1)}
        font={Enum.Font.Cartoon}
        textSize={px(15)}
        textColor={palette.black}
        text={currentGoal.action}
      />
      <imagelabel Name="Portrait"
        AnchorPoint={anchorPoints.topCenter}
        Position={positions.topCenter.add(UDim2.fromScale(0, 0.24))}
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
      <Container name="RewardsContainer"
        anchorPoint={anchorPoints.bottomCenter}
        position={positions.bottomCenter}
        size={UDim2.fromScale(1, 0.295)}
      >
        <uilistlayout
          VerticalAlignment="Center"
          HorizontalAlignment="Center"
          FillDirection="Horizontal"
          SortOrder="LayoutOrder"
          HorizontalFlex="SpaceEvenly"
        />
        <For each={() => quest.rewards}>
          {reward => {
            const icon = REWARD_ICONS[reward.kind];
            const isNumeric = reward.kind === QuestRewardKind.Gold || reward.kind === QuestRewardKind.XP;
            return <RewardIcon icon={icon} amount={isNumeric ? reward.amount : undefined} layoutOrder={reward.kind} />
          }}
        </For>
      </Container>
    </imagebutton>
  )
}