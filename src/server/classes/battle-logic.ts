import Signal from "@rbxts/signal";

import { Events } from "server/network";
import { Assets } from "shared/utility/instances";
import { NEW_CHARACTER } from "shared/default-structs/new-character";
import type { CharacterData } from "shared/data-models/character-data";
import PipState from "./pip-state";
import Destroyable from "shared/classes/destroyable";

import { Enemy } from "server/components/enemy";
import type { BattleTriangle } from "server/components/battle-triangle";
import type { BattleCircle, Combatant } from "server/components/battle-circle";

export default class BattleLogic extends Destroyable {
  public readonly pipState: PipState;
  public readonly turnChanged = new Signal;

  private readonly triangle: BattleTriangle;
  private currentCombatantPositions: Folder;
  private currentCombatants: Combatant[];
  private currentTurnIndex: number;

  public constructor(
    public readonly circle: BattleCircle
  ) {
    super();
    this.triangle = circle.battleTriangle;

    const pipStorage = new Instance("Folder", circle.instance);
    pipStorage.Name = "PipStorage";

    this.pipState = this.janitor.Add(new PipState(this), "destroy");
    this.janitor.Add(circle.combatantEntered.Connect(combatant => this.addPipPositions(combatant)));
    this.janitor.Add(this.pipState.pipsChanged.Connect(() => {
      pipStorage.ClearAllChildren();
      for (const combatant of circle.getAllCombatants())
        task.spawn(() => {
          const combatantModel = this.getCombatantModel(combatant);
          const shadowPipPositions = <PipPositionsModel>combatantModel.WaitForChild("ShadowPipPositions");
          const pipPositions = <PipPositionsModel>combatantModel.WaitForChild("PipPositions");
          let pipPosition = 1;
          let shadowPipPosition = 1;

          const { pips, powerPips, shadowPips } = this.pipState.get(combatantModel);
          const getPipPositionCFrame = (positions: PipPositionsModel) =>
            (<Part>positions.FindFirstChild(positions === shadowPipPositions ? shadowPipPosition : pipPosition)).CFrame;

          for (let i = 0; i < pips; i++) {
            const pip = Assets.Battle.Pip.Clone();
            pip.CFrame = getPipPositionCFrame(pipPositions);
            pip.Parent = pipStorage;
            pipPosition++;
          }
          for (let i = 0; i < powerPips; i++) {
            const pip = Assets.Battle.PowerPip.Clone();
            pip.CFrame = getPipPositionCFrame(pipPositions);
            pip.Parent = pipStorage;
            pipPosition++;
          }
          for (let i = 0; i < shadowPips; i++) {
            const pip = Assets.Battle.ShadowPip.Clone();
            pip.CFrame = getPipPositionCFrame(shadowPipPositions);
            pip.Parent = pipStorage;
            shadowPipPosition++;
          }
        });
    }));

    math.randomseed(os.time());
    const team1First = math.random(1, 2) === 1;
    this.currentCombatantPositions = circle.instance[team1First ? "TeamPositions" : "OpponentPositions"];
    this.currentCombatants = team1First ? circle.team : circle.opponents;
    this.currentTurnIndex = 0;
  }

  public getCombatantData(combatant: Combatant): CharacterData {
    return combatant instanceof Enemy ? <CharacterData>NEW_CHARACTER : this.circle.characterData.getCurrent(combatant);
  }

  public updateTriangle(doTween = true): void {
    this.triangle.pointAt(this.getCurrentCasterPosition(), doTween);
  }

  public startTurn(): void {
    this.turnChanged.Fire();
    Events.battle.turnChanged.fire(this.getPlayerCombatants());
  }

  private addPipPositions(combatant: Combatant): void {
    const combatantModel = this.getCombatantModel(combatant);
    const pipPositions = Assets.Battle.PipPositions.Clone();
    const shadowPipPositions = Assets.Battle.PipPositions.Clone();
    shadowPipPositions.Name = "ShadowPipPositions";

    this.alignPipPositions(combatantModel, pipPositions);
    this.alignPipPositions(combatantModel, shadowPipPositions);
  }

  private alignPipPositions(combatantModel: Model, pipPositions: PipPositionsModel): void {
    const modelSize = combatantModel.GetBoundingBox()[1];
    const combatantCFrame = combatantModel.GetPivot();
    const distanceFromCharacter = 3 + (pipPositions.Name === "ShadowPipPositions" ? 0.75 : 0);
    const pipPositionsCFrame = combatantCFrame
      .sub(new Vector3(0, modelSize.Y / 2, 0))
      .add(combatantCFrame.LookVector.mul(distanceFromCharacter));

    pipPositions.PivotTo(pipPositionsCFrame);
    pipPositions.Parent = combatantModel;
  }

  private getPlayerCombatants(): Player[] {
    return this.circle.getAllCombatants().filter((combatant): combatant is Player => {
      return typeOf(combatant) === "Instance" && (<Instance>combatant).IsA("Player")
    });
  }

  private getCombatantModel(combatant: Combatant): Model {
    return combatant instanceof Enemy ? combatant.instance : combatant.Character!;
  }

  private getCurrentCasterPosition(): Vector3 {
    const currentPosition = <Part>this.currentCombatantPositions.FindFirstChild(this.currentTurnIndex + 1);
    return currentPosition.Position;
  }

  private getCurrentCaster(): Combatant {
    return this.currentCombatants[this.currentTurnIndex];
  }

  private advanceCurrentCaster(): void {
    this.currentTurnIndex += 1;
    this.currentTurnIndex %= this.currentCombatants.size();
    if (this.currentTurnIndex === 0) { // switch teams after going through one team
      this.currentCombatants = this.currentCombatants === this.circle.team ? this.circle.opponents : this.circle.team;
      this.currentCombatantPositions = this.currentCombatantPositions === this.circle.instance.TeamPositions ? this.circle.instance.OpponentPositions : this.circle.instance.TeamPositions;
    }

    this.updateTriangle();
  }
}