import { Workspace as World } from "@rbxts/services";

import type { Deck } from "shared/data-models/items/deck";
import type { CharacterData } from "shared/data-models/character-data";

import type CharacterHelper from "shared/helpers/character";
import type { BattleCamera } from "client/components/cameras/battle";
import type { BattleController } from "client/controllers/battle";
import type { CameraController } from "client/controllers/camera";
import { CharacterController } from "client/controllers/character";
import Destroyable from "shared/classes/destroyable";

const CAMERA_HEIGHT = 20;
const CAMERA_DISTANCE_FROM_CENTER = 40;
const CAMERA_FOV = 45;

export default class BattleClient extends Destroyable {
  public readonly deck: Maybe<Deck>;

  public constructor(
    private readonly battle: BattleController,
    character: CharacterController,
    camera: CameraController,
    private readonly characterHelper: CharacterHelper,
    public readonly characterData: CharacterData,
    public readonly team: Model[],
    public readonly opponents: Model[],
    circle: ReplicatedFirst["Assets"]["Battle"]["BattleCircle"]
  ) {
    super();
    this.deck = this.characterHelper.getEquippedDeck(characterData);

    camera.get("Battle").setCFrame(camera.getLastCFrame());
    const opposing = opponents.includes(character.mustGet());
    const battleCamera = camera.get<BattleCamera>("Battle");
    const position = circle.Root.Position
      .add(new Vector3(0, CAMERA_HEIGHT, 0))
      .add(circle.Root.CFrame.LookVector.mul(CAMERA_DISTANCE_FROM_CENTER).mul(opposing ? -1 : 1));

    battleCamera.setTarget(CFrame.lookAt(position, circle.Root.Position));
    battleCamera.setTargetFOV(CAMERA_FOV);
    camera.set("Battle");

    this.battle.entered.Fire();
  }

  public conclude(): void {
    this.battle.left.Fire();
  }
}