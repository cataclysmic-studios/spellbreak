import { Dependency } from "@flamework/core";
import { Players, Workspace as World } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";
import { atom } from "@rbxts/charm";
import type { BaseID } from "@rbxts/id";

import { Message, messaging } from "shared/messaging";
import { assets } from "shared/constants";
import Log from "shared/log";

import { Destroyable } from "shared/classes/destroyable";
import { Enemy } from "./enemy";
import type { EnemyService } from "server/services/enemy";

const MAX_COMBATANTS = 8;
const TURN_INFO = new TweenInfoBuilder()
  .SetTime(0.5)
  .SetEasingStyle(Enum.EasingStyle.Linear)
  .Build();
const PULL_IN_INFO = new TweenInfoBuilder()
  .SetTime(1.5)
  .SetEasingStyle(Enum.EasingStyle.Linear)
  .Build();
const FADE_IN_INFO = new TweenInfoBuilder()
  .SetTime(0.4)
  .Build();
const FADE_OUT_INFO = new TweenInfoBuilder()
  .SetTime(1)
  .SetEasingStyle(Enum.EasingStyle.Cubic)
  .SetEasingDirection(Enum.EasingDirection.In)
  .Build();
const GLOW_INFO = new TweenInfoBuilder()
  .SetTime(0.5)
  .SetReverses(true)
  .Build();

export type Combatant = Player | Enemy;

export const enum DuelCirclePosition {
  First,
  Second,
  Third,
  Fourth
}

export const enum DuelPhase {
  Starting,
  Planning,
  Combat,
  Ending
}

export class DuelCircle<PvP extends boolean = boolean> extends Destroyable implements BaseID<number> {
  public static cumulativeID = 0;

  public readonly id = DuelCircle.cumulativeID++;
  public readonly currentPhase = atom(DuelPhase.Starting);
  public readonly opponentPositions: DuelCirclePositions;
  public readonly teamPositions: DuelCirclePositions;

  private readonly occupiedOpponentPositions = new Set<DuelCirclePosition>;
  private readonly occupiedTeamPositions = new Set<DuelCirclePosition>;
  private readonly combatants = new Set<Combatant>;
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

    if (!pvp) {
      this.janitor.Add(this.model.hitbox.Touched.Connect(hit => {
        const character = hit.FindFirstAncestorOfClass("Model");
        if (character === undefined) return;
        if (this.combatants.size() === MAX_COMBATANTS) return;
        this.onTouched(character);
      }));
    }

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
  public addPlayer(player: Player, position: DuelCirclePosition): void
  public addPlayer(player: Player, position: DuelCirclePosition, enemyTeam?: PvP extends true ? boolean : undefined): void
  public addPlayer(player: Player, position: DuelCirclePosition, enemyTeam?: PvP extends true ? boolean : undefined): void {
    this.combatants.add(player);
    const positions = enemyTeam
      ? this.opponentPositions
      : this.teamPositions;

    messaging.emitClient(player, Message.ToggleMovement, false);
    this.pullInCombatant(player.Character!, positions, position);
  }

  /**
   * Adds an enemy to the duel circle, positioning it in the enemy's position.
   * Throws if the duel circle is for PvP.
   * @param enemy The enemy to add
   */
  public addEnemy(enemy: Enemy, position: DuelCirclePosition): void {
    if (this.pvp)
      return Log.fatal("Attempt to add enemy to PvP duel circle", ["duel circle"]);

    this.combatants.add(enemy);
    this.pullInCombatant(enemy.model, this.opponentPositions, position);
  }

  public override destroy(): void {
    if (this.destroyed) return;

    const players = this.getPlayerCombatants();
    for (const player of players)
      messaging.emitClient(player, Message.ToggleMovement, true);

    this.animations.idle.Stop();
    this.animations.onRemove.Play(0);
    this.fadeOut().Completed.Once(() => this.janitor.Destroy());
  }

  private onTouched(character: Model): void {
    const isEnemy = character.HasTag("Enemy");
    if (character.FindFirstChildOfClass("Humanoid") === undefined && !isEnemy) return;
    if (isEnemy) {
      const enemies = Dependency<EnemyService>();
      const openPosition = this.getOpenOpponentPosition();
      if (openPosition === undefined) return;

      const id = character.GetAttribute<number>("ID")!;
      const enemy = enemies.findEnemyByID(id);
      if (enemy === undefined)
        return Log.warn(`Failed find enemy with ID ${id} while attempting to attract into duel circle`, ["duel circle"]);

      this.addEnemy(enemy, openPosition);
    } else {
      const player = Players.GetPlayerFromCharacter(character)!;
      const openPosition = this.getOpenTeamPosition();
      if (openPosition === undefined) return;
      this.addPlayer(player, openPosition);
    }
  }

  private getOpenOpponentPosition(): Maybe<DuelCirclePosition> {
    const size = this.occupiedOpponentPositions.size();
    if (size > DuelCirclePosition.Fourth) return;
    return size;
  }

  private getOpenTeamPosition(): Maybe<DuelCirclePosition> {
    const size = this.occupiedTeamPositions.size();
    if (size > DuelCirclePosition.Fourth) return;
    return size;
  }

  private getPlayerCombatants(): Player[] {
    return [...this.combatants].filter((combatant): combatant is Player => typeIs(combatant, "Instance") && combatant.IsA("Player"));
  }

  private getEnemyCombatants(): Enemy[] {
    return [...this.combatants].filter(combatant => combatant instanceof Enemy);
  }

  private began(): void {
    Log.info("Duel began")
    this.animations.onAdd.AdjustSpeed(0);
    this.animations.idle.Play(0);
    this.currentPhase(DuelPhase.Planning);
  }

  private pullInCombatant(combatantModel: Model, positions: DuelCirclePositions, position: DuelCirclePosition): void {
    const positionPart = positions[tostring(position + 1) as ExtractKeys<DuelCirclePositions, Part>];
    const height = combatantModel.GetBoundingBox()[1].Y;
    const root = combatantModel.PrimaryPart!;

    root.Anchored = true;
    this.janitor.Add(() => root.Anchored = false);

    const [x, y, z] = new CFrame(root.Position, positionPart.Position).ToOrientation();
    tween(root, TURN_INFO, { Orientation: new Vector3(x, y, z) })
    tween(root, PULL_IN_INFO, {
      Position: positionPart.Position.add(new Vector3(0, height / 2, 0))
    }).Completed.Once(() => tween(root, TURN_INFO, { Orientation: positionPart.Orientation }));
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

    tween(this.model.Main.texture, FADE_IN_INFO, { Transparency: 0 });
    tween(this.model.Vortex.texture, FADE_IN_INFO, { Transparency: 0 });
    tween(this.model.Glow.texture, GLOW_INFO, { Transparency: 0.3 });
  }

  private fadeOut(): Tween {
    tween(this.model.Main.texture, FADE_OUT_INFO, { Transparency: 1 });
    return tween(this.model.Vortex.texture, FADE_OUT_INFO, { Transparency: 1 });
  }
}