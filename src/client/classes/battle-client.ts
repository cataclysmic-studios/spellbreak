import type { Deck } from "shared/data-models/items/deck";

import type { BattleCamera } from "client/components/cameras/battle";
import type { BattleController } from "client/controllers/battle";
import type { CameraController } from "client/controllers/camera";

const CAMERA_HEIGHT = 20;
const CAMERA_DISTANCE_FROM_CENTER = 40;
const CAMERA_FOV = 45;

export default class BattleClient {
  public constructor(
    private readonly battle: BattleController,
    camera: CameraController,
    public readonly deck: Maybe<Deck>,
    circle: ReplicatedFirst["Assets"]["Battle"]["BattleCircle"],
    opponent: boolean
  ) {
    camera.get("Battle").setCFrame(camera.getLastCFrame());
    const battleCamera = camera.get<BattleCamera>("Battle");
    const position = circle.Root.Position
      .add(new Vector3(0, CAMERA_HEIGHT, 0))
      .add(circle.Root.CFrame.LookVector.mul(CAMERA_DISTANCE_FROM_CENTER).mul(opponent ? -1 : 1));

    battleCamera.setTarget(CFrame.lookAt(position, circle.Root.Position));
    battleCamera.setTargetFOV(CAMERA_FOV);
    camera.set("Battle");

    this.battle.entered.Fire();
    task.delay(1, () => battle.turnStarted.Fire());
  }

  public conclude(): void {
    this.battle.left.Fire();
  }
}