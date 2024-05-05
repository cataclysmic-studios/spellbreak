import type { OnStart } from "@flamework/core";
import { Component, Components } from "@flamework/components";
import { Players, Workspace as World, HttpService as HTTP } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";

import { Events } from "server/network";
import { Assets } from "shared/utility/instances";
import { tween } from "shared/utility/ui";
import { MAX_BATTLE_COMBATANTS } from "shared/constants";
import BattleLogic from "server/classes/battle-logic";

import DestroyableComponent from "shared/base-components/destroyable";
import { Enemy } from "./enemy";
import type { BattleTriangle } from "./battle-triangle";
import type { CharacterDataService } from "server/services/character-data";
import Signal from "@rbxts/signal";

export type Combatant = Player | Enemy;

@Component({ tag: "BattleCircle" })
export class BattleCircle extends DestroyableComponent<{}, ReplicatedFirst["Assets"]["Battle"]["BattleCircle"]> implements OnStart {
  public readonly id = HTTP.GenerateGUID();
  public readonly combatantEntered = new Signal<(combatant: Combatant) => void>;
  public readonly battleLogic: BattleLogic;
  public readonly battleTriangle: BattleTriangle;
  public readonly team: Player[] = [];
  public readonly opponents: Combatant[] = [];
  public pvp = false;

  private readonly animations;

  public constructor(
    private readonly components: Components,
    public readonly characterData: CharacterDataService
  ) {
    super();
    this.instance.SetAttribute("ID", this.id);

    const battleTriangleModel = Assets.Battle.BattleTriangle.Clone();
    battleTriangleModel.Parent = this.instance;
    this.battleTriangle = components.addComponent(battleTriangleModel);
    this.battleLogic = new BattleLogic(this);
    battleTriangleModel.Parent = undefined;

    this.fadeIn();
    const firstCombatantPosition = <Vector3>this.instance.GetAttribute("FirstCombatantPosition");
    this.instance.Parent = World.BattleCircles;
    this.instance.Main.CFrame = new CFrame(this.getClosestPosition(firstCombatantPosition));

    this.animations = {
      Idle: this.instance.AnimationController.LoadAnimation(this.instance.Animations.Idle),
      OnAdd: this.instance.AnimationController.LoadAnimation(this.instance.Animations.OnAdd),
      OnRemove: this.instance.AnimationController.LoadAnimation(this.instance.Animations.OnRemove)
    };
  }

  public onStart(): void {
    this.janitor.Add(this.instance);

    const conn = this.animations.OnAdd.KeyframeReached.Connect(kf => {
      if (kf !== "Final") return;
      this.battleBegan();
      conn.Disconnect();
    });
    this.playAnimation("OnAdd");

    this.janitor.Add(this.instance.Main.Touched.Connect(hit => {
      const modelThatTouched = hit.FindFirstAncestorOfClass("Model");
      if (!modelThatTouched?.FindFirstChildOfClass("Humanoid")) return;

      const playerWhoTouched = <Maybe<Player>>Players.FindFirstChild(modelThatTouched?.Name ?? "");
      const enemyWhoTouched = this.components.getComponent<Enemy>(modelThatTouched);
      if (this.pvp) {
        if (playerWhoTouched === undefined) return;
      } else
        if (playerWhoTouched !== undefined)
          this.addTeammate(playerWhoTouched);
        else if (enemyWhoTouched !== undefined)
          this.addOpponent(enemyWhoTouched);
    }));
  }

  public addTeammate(player: Player): void {
    if (this.team.includes(player)) return;
    if (this.team.size() === MAX_BATTLE_COMBATANTS) return;
    this.team.push(player);
    this.pullInCombatant(player);
  }

  public addOpponent(opponent: Combatant): void {
    if (this.opponents.includes(opponent)) return;
    if (this.opponents.size() === MAX_BATTLE_COMBATANTS) return;
    if (this.opponents.size() >= this.team.size() + 1) return;
    this.opponents.push(opponent);
    this.pullInCombatant(opponent);
  }

  public getAllCombatants(): Combatant[] {
    return [...this.team, ...this.opponents];
  }

  public destroy(): void {
    for (const combatant of this.team)
      this.toggleMovement(combatant, true);
    for (const combatant of this.opponents) {
      if (combatant instanceof Enemy) continue;
      this.toggleMovement(combatant, true);
    }

    this.animations.Idle.Stop();
    this.playAnimation("OnRemove");
    this.fadeOut().Completed.Once(() => this.janitor.Destroy());
  }

  private battleBegan(): void {
    this.animations.OnAdd.AdjustSpeed(0);
    this.playAnimation("Idle");
    this.battleTriangle.instance.Parent = this.instance;
    this.battleLogic.updateTriangle(false);
    task.delay(1.5, () => this.battleLogic.startTurn());
  }

  private getClosestPosition(rootPosition: Vector3): Vector3 {
    const locations = World.BattleCircleLocations.GetChildren()
      .filter((i): i is Part => i.IsA("Part"))
      .map(part => part.Position);

    const [closest] = locations
      .sort((a, b) => {
        const distA = rootPosition.sub(a).Magnitude;
        const distB = rootPosition.sub(b).Magnitude;
        return distA < distB;
      });

    return closest.add(new Vector3(0, 0.05, 0));
  }

  private fadeOut(): Tween {
    const fadeInfo = new TweenInfoBuilder()
      .SetTime(1)
      .SetEasingStyle(Enum.EasingStyle.Cubic)
      .SetEasingDirection(Enum.EasingDirection.In);

    tween(this.instance.Main.Decal, fadeInfo, { Transparency: 1 });
    return tween(this.instance.Vortex.Decal, fadeInfo, { Transparency: 1 });
  }

  private fadeIn(): void {
    this.instance.Main.Decal.Transparency = 1;
    this.instance.Vortex.Decal.Transparency = 1;
    this.instance.Glow.Decal.Transparency = 1;

    const fadeInfo = new TweenInfoBuilder().SetTime(0.4);
    const glowInfo = new TweenInfoBuilder().SetTime(0.5).SetReverses(true);
    tween(this.instance.Main.Decal, fadeInfo, { Transparency: 0 });
    tween(this.instance.Vortex.Decal, fadeInfo, { Transparency: 0 });
    tween(this.instance.Glow.Decal, glowInfo, { Transparency: 0.3 });
  }

  private playAnimation(name: keyof typeof this.animations): void {
    this.animations[name].Play(0);
  }

  private toggleMovement(combatant: Player, on: boolean): void {
    if (!on) {
      const combatantIsNPC = combatant instanceof Enemy;
      const character = combatantIsNPC ? combatant.instance : combatant.Character!;
      character.PrimaryPart!.Anchored = true;
      character.PrimaryPart!.AssemblyLinearVelocity = new Vector3;
    }

    Events.character.toggleCustomMovement(combatant, on);
  }

  private async pullInCombatant(combatant: Combatant): Promise<void> {
    return new Promise<void>(resolve => {
      const combatantIsNPC = combatant instanceof Enemy;
      if (!combatantIsNPC)
        this.toggleMovement(combatant, false);

      const character = combatantIsNPC ? combatant.instance : combatant.Character!;
      const humanoid = character.FindFirstChildOfClass("Humanoid")!;
      const runAnim = <Maybe<Animation>>character.FindFirstChild("Animate")?.FindFirstChild("run")?.FindFirstChild("RunAnim");
      let runTrack: Maybe<AnimationTrack>;
      if (runAnim) {
        runTrack = humanoid.LoadAnimation(runAnim)
        runTrack.Play();
      }

      const combatantCollection = this.opponents.includes(combatant) ? this.opponents : this.team;
      const positionParts = this.instance[this.opponents.includes(combatant) ? "OpponentPositions" : "TeamPositions"];
      const positionPart = <BasePart>positionParts.FindFirstChild(combatantCollection.size());
      const playerSigil = Assets.Battle.PlayerBattleSigil.Clone();
      playerSigil.Position = positionPart.Position.sub(new Vector3(0, 0.05, 0));
      playerSigil.Parent = this.instance;

      const tweenInfo = new TweenInfoBuilder()
        .SetEasingStyle(Enum.EasingStyle.Linear);

      const [_, characterSize] = character.GetBoundingBox();
      tween(character.PrimaryPart!, tweenInfo.SetTime(1), { Position: positionPart.Position.add(new Vector3(0, characterSize.Y / 2, 0)) }).Completed.Wait();

      runTrack?.Stop();
      tween(character.PrimaryPart!, tweenInfo.SetTime(0.3), { Orientation: positionPart.Orientation })
        .Completed.Once(() => {
          character.PrimaryPart!.Anchored = true;
          this.combatantEntered.Fire(combatant);
          if (combatantIsNPC) return;

          task.delay(0.5, () => Events.battle.createClient(
            combatant, this.id,
            this.team.map(player => player.Character!),
            this.opponents.map(combatant => combatant instanceof Enemy ? combatant.instance : combatant.Character!),
            this.characterData.getCurrent(combatant),
          ));
        });

      resolve();
    });
  }
}