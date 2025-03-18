import { Workspace as World } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";
import type { BaseID } from "@rbxts/id";

import { Message, messaging } from "shared/messaging";
import { assets } from "shared/constants";
import Log from "shared/log";

import { Destroyable } from "shared/classes/destroyable";
import type { Enemy } from "./enemy";

const TURN_TWEEN_INFO = new TweenInfoBuilder()
  .SetTime(0.5)
  .SetEasingStyle(Enum.EasingStyle.Linear)
  .Build();
const PULL_IN_TWEEN_INFO = new TweenInfoBuilder()
  .SetTime(1.5)
  .SetEasingStyle(Enum.EasingStyle.Linear)
  .Build();

export type Combatant = Player | Enemy;

export const enum DuelCirclePosition {
  First,
  Second,
  Third,
  Fourth
}

export class DuelCircle<PvP extends boolean = boolean> extends Destroyable implements BaseID<number> {
  public static cumulativeID = 0;

  public readonly id = DuelCircle.cumulativeID++;
  public readonly opponentPositions: DuelCirclePositions;
  public readonly teamPositions: DuelCirclePositions;

  private readonly combatants: Combatant[] = [];
  private readonly model: DuelCircleModel;
  private readonly animations;

  // TODO: when duel circle is touched pull in more combatants
  /**
   * Creates a new duel circle and animates it.
   * @param location The location of the duel circle.
   * @param pvp Optional boolean indicating if the duel circle is for PvP.
   * If `true`, players may be placed in opponent positions and enemies can not enter. Defaults to `false`.
   */
  public constructor(
    location: Vector3,
    private readonly pvp: PvP = false as PvP
  ) {
    super();

    this.model = this.janitor.Add(assets.duel.circle.Clone());
    this.model.PivotTo(new CFrame(location));
    this.model.Parent = World.DuelCircles;

    const animations = assets.animations.duel.circle;
    const animator = this.model.AnimationController.Animator;
    this.animations = {
      onAdd: animator.LoadAnimation(animations.combatantAdded),
      onRemove: animator.LoadAnimation(animations.combatantRemoved),
      idle: animator.LoadAnimation(animations.idle)
    };

    this.playCreationAnimation();
    this.animations.onRemove.Ended.Once(() => this.destroy());

    this.opponentPositions = this.model.opponentPositions;
    this.teamPositions = this.model.teamPositions;
  }

  /**
   * Adds a player to the duel circle, positioning them in either the team or opponent
   * positions depending on whether they are part of the enemy team.
   * @param player The player to add to the duel circle.
   * @param enemyTeam Optional boolean indicating if the player should be positioned
   * in the opponent positions. Only applicable if the duel circle is for PvP.
   */
  public addPlayer(player: Player, position = DuelCirclePosition.First, enemyTeam?: PvP extends true ? boolean : undefined): void {
    this.combatants.push(player);
    const positions = enemyTeam
      ? this.opponentPositions
      : this.teamPositions;

    messaging.emitClient(player, Message.ToggleMovement, false);
    this.pullInCombatant(player.Character!, positions, position);
  }

  /**
   * Adds an enemy to the duel circle, positioning it in the enemy's position.
   * Does nothing if the duel circle is for PvP.
   * @param enemy The enemy to add
   */
  public addEnemy(enemy: Enemy, position = DuelCirclePosition.First): void {
    if (this.pvp) return;

    this.combatants.push(enemy);
    this.pullInCombatant(enemy.model, this.opponentPositions, position);
  }

  public override destroy(): void {
    if (this.destroyed) return;

    const players = this.combatants.filter((combatant): combatant is Player => typeOf(combatant) === "Instance" && (combatant as Instance).IsA("Player"));
    for (const player of players)
      messaging.emitClient(player, Message.ToggleMovement, true);

    this.animations.idle.Stop();
    this.animations.onRemove.Play(0);
    this.fadeOut().Completed.Once(() => this.janitor.Destroy());
  }

  private began(): void {
    Log.info("Duel began")
    this.animations.onAdd.AdjustSpeed(0);
    this.animations.idle.Play(0);
  }

  private pullInCombatant(combatantModel: Model, positions: DuelCirclePositions, position: DuelCirclePosition): void {
    const positionPart = positions[tostring(position + 1) as ExtractKeys<DuelCirclePositions, Part>];
    const height = combatantModel.GetBoundingBox()[1].Y;
    const root = combatantModel.PrimaryPart!;

    root.Anchored = true;
    this.janitor.Add(() => root.Anchored = false);

    const [x, y, z] = new CFrame(root.Position, positionPart.Position).ToOrientation();
    tween(root, TURN_TWEEN_INFO, { Orientation: new Vector3(x, y, z) })
    tween(root, PULL_IN_TWEEN_INFO, {
      Position: positionPart.Position.add(new Vector3(0, height / 2, 0))
    }).Completed.Once(() => tween(root, TURN_TWEEN_INFO, { Orientation: positionPart.Orientation }));
  }

  private playCreationAnimation(): void {
    this.fadeIn();
    const conn = this.animations.onAdd.KeyframeReached.Connect(kf => {
      if (kf !== "Final") return;
      this.began();
      conn.Disconnect();
    });

    this.animations.onAdd.Play(0);
  }

  private fadeIn(): void {
    this.model.Main.texture.Transparency = 1;
    this.model.Vortex.texture.Transparency = 1;
    this.model.Glow.texture.Transparency = 1;

    const fadeInfo = new TweenInfoBuilder()
      .SetTime(0.4)
      .Build();
    const glowInfo = new TweenInfoBuilder()
      .SetTime(0.5)
      .SetReverses(true)
      .Build();

    tween(this.model.Main.texture, fadeInfo, { Transparency: 0 });
    tween(this.model.Vortex.texture, fadeInfo, { Transparency: 0 });
    tween(this.model.Glow.texture, glowInfo, { Transparency: 0.3 });
  }

  private fadeOut(): Tween {
    const fadeInfo = new TweenInfoBuilder()
      .SetTime(1)
      .SetEasingStyle(Enum.EasingStyle.Cubic)
      .SetEasingDirection(Enum.EasingDirection.In)
      .Build();

    tween(this.model.Main.texture, fadeInfo, { Transparency: 1 });
    return tween(this.model.Vortex.texture, fadeInfo, { Transparency: 1 });
  }
}