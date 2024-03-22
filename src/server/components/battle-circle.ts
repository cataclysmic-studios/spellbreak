import type { OnStart } from "@flamework/core";
import { Component, Components } from "@flamework/components";
import { Players, Workspace as World } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "shared/utility/ui";
import DestroyableComponent from "shared/base-components/destroyable-component";

import { Enemy } from "./enemy";

type Combatant = Player | Enemy;

const MAX_COMBATANTS = 4;

// TODO: battle circle animastions
@Component({ tag: "BattleCircle" })
export class BattleCircle extends DestroyableComponent<{}, ReplicatedFirst["Assets"]["BattleCircle"]> implements OnStart {
  public pvp = false;

  private readonly team: Player[] = [];
  private readonly opponents: Combatant[] = [];
  private readonly animations;

  public constructor(
    private readonly components: Components
  ) {
    super();
    this.fadeIn();
    this.instance.Parent = World.BattleCircles;

    this.animations = {
      Idle: this.instance.AnimationController.LoadAnimation(this.instance.Animations.Idle),
      OnAdd: this.instance.AnimationController.LoadAnimation(this.instance.Animations.OnAdd),
      OnRemove: this.instance.AnimationController.LoadAnimation(this.instance.Animations.OnRemove)
    };
  }

  public onStart(): void {
    const conn = this.animations.OnAdd.KeyframeReached.Connect(kf => {
      if (kf !== "Final") return;
      this.animations.OnAdd.AdjustSpeed(0);
      this.playAnimation("Idle");
      conn.Disconnect();
    });
    this.playAnimation("OnAdd");

    this.janitor.Add(this.instance);
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
    this.janitor.Add(() => {
      for (const combatant of this.team)
        this.toggleMovement(combatant, true);
      for (const combatant of this.opponents) {
        if (combatant instanceof Enemy) continue;
        this.toggleMovement(combatant, true);
      }
    });
  }

  public addTeammate(player: Player): void {
    if (this.team.includes(player)) return;
    if (this.team.size() === MAX_COMBATANTS) return;
    this.team.push(player);
    this.pullInCombatant(player);
  }

  public addOpponent(opponent: Combatant): void {
    if (this.opponents.includes(opponent)) return;
    if (this.opponents.size() === MAX_COMBATANTS) return;
    if (this.opponents.size() >= this.team.size() + 1) return;
    this.opponents.push(opponent);
    this.pullInCombatant(opponent);
  }

  public destroy(): void {
    this.animations.Idle.Stop();
    this.playAnimation("OnRemove");
    this.fadeOut().Completed.Once(() => this.janitor.Destroy());
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

    const fadeInfo = new TweenInfoBuilder().SetTime(0.35);
    const glowInfo = new TweenInfoBuilder().SetTime(0.4).SetReverses(true);
    tween(this.instance.Main.Decal, fadeInfo, { Transparency: 0 });
    tween(this.instance.Vortex.Decal, fadeInfo, { Transparency: 0 });
    tween(this.instance.Glow.Decal, glowInfo, { Transparency: 0 });
  }

  private playAnimation(name: keyof typeof this.animations): void {
    const track = this.animations[name];
    track.Play(0);

    switch(name) {
      case "OnAdd": {
        // TODO: fade in circle & glow effect
        break;
      }
      case "OnRemove": {
        // TODO: fade out
        break;
      }
    }
  }

  private toggleMovement(combatant: Player, on: boolean): void {
    if (!on) {
      const combatantIsNPC = combatant instanceof Enemy;
      const character = combatantIsNPC ? combatant.instance : combatant.Character!;
      character.PrimaryPart!.Anchored = true;
      character.PrimaryPart!.AssemblyLinearVelocity = new Vector3;
    }

    const movementMode = on ? <ExtractKeys<typeof Enum.DevComputerMovementMode, EnumItem>>combatant.GetAttribute("DefaultMovementMode") : "Scriptable";
    const touchMode = on ? <ExtractKeys<typeof Enum.DevTouchMovementMode, EnumItem>>combatant.GetAttribute("DefaultTouchMode") : "Scriptable";
    combatant.DevComputerMovementMode = Enum.DevComputerMovementMode[movementMode];
    combatant.DevTouchMovementMode = Enum.DevTouchMovementMode[touchMode];
  }

  private async pullInCombatant(combatant: Combatant): Promise<void> {
    return new Promise<void>(resolve => {
      const combatantIsNPC = combatant instanceof Enemy;
      const character = combatantIsNPC ? combatant.instance : combatant.Character!;
      const humanoid = character.FindFirstChildOfClass("Humanoid")!;
      const runAnim = <Maybe<Animation>>character.FindFirstChild("Animate")?.FindFirstChild("run")?.FindFirstChild("RunAnim");
      let runTrack: Maybe<AnimationTrack>;
      if (runAnim) {
        runTrack = humanoid.LoadAnimation(runAnim)
        runTrack.Play();
      }

      if (!combatantIsNPC)
        this.toggleMovement(combatant, false);

      const combatantCollection = this.opponents.includes(combatant) ? this.opponents : this.team;
      const positionParts = this.instance[this.opponents.includes(combatant) ? "OpponentPositions" : "TeamPositions"];
      const positionPart = <BasePart>positionParts.FindFirstChild(combatantCollection.size());
      const tweenInfo = new TweenInfoBuilder()
        .SetEasingStyle(Enum.EasingStyle.Linear);

      const [_, characterSize] = character.GetBoundingBox();
      tween(character.PrimaryPart!, tweenInfo.SetTime(1), { Position: positionPart.Position.add(new Vector3(0, characterSize.Y / 2, 0)) }).Completed.Wait();

      runTrack?.Stop();
      tween(character.PrimaryPart!, tweenInfo.SetTime(0.3), { Orientation: positionPart.Orientation })
        .Completed.Once(() => {
          character.PrimaryPart!.Anchored = true;
          if (combatantIsNPC) return;
        });

      resolve();
    });
    // TODO: set camera mode to Battle, enable DeckHand UI, and add cards from deck to hand
  }
}