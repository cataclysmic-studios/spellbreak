import type { Deck } from "shared/data-models/items/deck";
import type { CharacterData } from "shared/data-models/character-data";

import type CharacterHelper from "shared/helpers/character";
import type { BattleCamera } from "client/components/cameras/battle";
import type { BattleController } from "client/controllers/battle";
import type { CameraController } from "client/controllers/camera";

const { clamp, floor } = math;

const CAMERA_HEIGHT = 20;
const CAMERA_DISTANCE_FROM_CENTER = 40;
const CAMERA_FOV = 45;
const MAX_PIPS = 14;

export default class BattleClient {
  public readonly deck: Maybe<Deck>;
  private powerPips = 0;
  private pips = 0;
  private shadowPips = 0;

  public constructor(
    private readonly battle: BattleController,
    camera: CameraController,
    private readonly characterHelper: CharacterHelper,
    public readonly characterData: CharacterData,
    circle: ReplicatedFirst["Assets"]["Battle"]["BattleCircle"],
    opponent: boolean
  ) {
    this.deck = this.characterHelper.getEquippedDeck(characterData);

    camera.get("Battle").setCFrame(camera.getLastCFrame());
    const battleCamera = camera.get<BattleCamera>("Battle");
    const position = circle.Root.Position
      .add(new Vector3(0, CAMERA_HEIGHT, 0))
      .add(circle.Root.CFrame.LookVector.mul(CAMERA_DISTANCE_FROM_CENTER).mul(opponent ? -1 : 1));

    battleCamera.setTarget(CFrame.lookAt(position, circle.Root.Position));
    battleCamera.setTargetFOV(CAMERA_FOV);
    camera.set("Battle");

    this.battle.entered.Fire();
    task.delay(1, () => this.startTurn());
  }

  public conclude(): void {
    this.battle.left.Fire();
  }

  public usePips(amount: number): void {
    this.pips = clamp(this.pips - amount, 0, floor(MAX_PIPS - (this.powerPips * 2)));
  }

  public usePowerPips(amount: number): void {
    this.powerPips = clamp(this.powerPips - amount, 0, floor((MAX_PIPS - this.pips) / 2));
  }

  public useShadowPips(amount: number): void {
    this.shadowPips = clamp(this.shadowPips - amount, 0, this.characterData.stats.maxShadowPips);
  }

  public getTotalPips(): number {
    return this.powerPips * 2 + this.pips;
  }

  public getPowerPips(): number {
    return this.powerPips;
  }

  public getPips(): number {
    return this.pips;
  }

  public getShadowPips(): number {
    return this.shadowPips;
  }

  private startTurn(): void {
    this.battle.turnStarted.Fire();
    this.gainPips();
  }

  private gainPips(): void {
    const { powerPipChance, shadowPipRating } = this.characterData.stats;
    const gainPowerPip = math.random(1, 100) <= powerPipChance;
    this[gainPowerPip ? "powerPips" : "pips"]++;
    // call some event to display pips on battle circle
  }
}