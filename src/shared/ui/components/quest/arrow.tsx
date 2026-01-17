import Vide, { cleanup, source, type Source } from "@rbxts/vide";

import { usePx } from "../../hooks/use-px";
import { anchorPoints, positions } from "../../utility/positioning";;
import { assets, XZ } from "shared/constants";
import type { QuestInfo } from "shared/structs/quests";
import { getGoalTargetPosition, getQuestByID } from "shared/utility/quests";
import { useEventListener } from "@rbxts/pretty-vide-utils";
import { Players, RunService, Workspace as World } from "@rbxts/services";
import { WizText } from "../wiz-text";
import { palette } from "shared/ui/palette";

const { fromOffset } = UDim2;
const { lookAlong, lookAt, Angles: angles } = CFrame;
const { rad, clamp, floor } = math;

interface QuestArrowProps {
  readonly info: Source<Maybe<QuestInfo>>;
  readonly visible?: Source<boolean>;
}

const CAMERA_OFFSET = new Vector3(0, 7, 8);
const FINAL_ROTATION = angles(rad(90), 0, 0);
const FADE_DISTANCE = 6;
const STUDS_TO_METERS = 25 / 7;

export function QuestArrow({ info, visible }: QuestArrowProps): Vide.Node {
  const px = usePx();
  const hovered = source(false);
  const transparency = source(0);
  const distanceInMeters = source(0);
  const size = px(150);

  const arrow = assets.questArrow.Clone();
  const updateArrow = (direction: Vector3, dt: number) => {
    const finalCFrame = lookAlong(Vector3.zero, direction, Vector3.yAxis).mul(FINAL_ROTATION);
    const alpha = clamp(10 * dt, 0, 1);
    arrow.CFrame = arrow.CFrame.Lerp(finalCFrame, alpha);
  };
  const updateTransparencyAndText = (distance: number) => {
    distanceInMeters(distance / STUDS_TO_METERS);
    if (hovered()) return;
    if (distance <= FADE_DISTANCE)
      transparency(clamp(1 - distance / FADE_DISTANCE, 0, 1));
    else if (transparency() !== 0)
      transparency(0);
  };

  const camera = World.CurrentCamera!;
  useEventListener(RunService.Heartbeat, dt => {
    const questInfo = info();
    if (questInfo === undefined) return;

    const root = Players.LocalPlayer.Character!.PrimaryPart;
    if (root === undefined) return;

    const quest = getQuestByID(questInfo.questID);
    const goal = quest.goals[questInfo.goalIndex];
    const goalPosition = getGoalTargetPosition(goal);
    const rootPosition = root.Position;
    const difference = rootPosition.sub(goalPosition).mul(XZ);
    const distance = difference.Magnitude;
    updateTransparencyAndText(distance);

    if (distance < 0.05) return;
    const direction = difference.Unit;
    const localDirection = camera.CFrame.VectorToObjectSpace(direction).mul(XZ).Unit;
    updateArrow(localDirection.Unit, dt);
  });
  updateArrow(Vector3.zAxis, 1);
  cleanup(arrow);

  const viewportCamera = new Instance("Camera");
  viewportCamera.CFrame = lookAt(CAMERA_OFFSET, Vector3.zero);
  cleanup(viewportCamera);

  return (
    <viewportframe Name="QuestArrow"
      AnchorPoint={anchorPoints.bottomCenter}
      Position={positions.bottomCenter.sub(fromOffset(0, px(60)))}
      Size={fromOffset(size, size)}
      BackgroundTransparency={1}
      ImageTransparency={transparency}
      Visible={visible}
      CurrentCamera={viewportCamera}

      MouseEnter={() => {
        hovered(true);
        transparency(0.3);
      }}
      MouseLeave={() => {
        hovered(false);
        transparency(0);
      }}
    >
      <uiaspectratioconstraint />
      <WizText name="DistanceText"
        anchorPoint={anchorPoints.center}
        position={positions.center}
        font={Enum.Font.Cartoon}
        textSize={px(20)}
        textColor={palette.black}
        text={() => tostring(floor(distanceInMeters()))}
      />
      {viewportCamera}
      {arrow}
    </viewportframe>
  );
}