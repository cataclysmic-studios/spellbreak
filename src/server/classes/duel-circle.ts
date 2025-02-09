import { Workspace as World } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import { tween } from "@rbxts/instance-utility";

import { MessageEmitter } from "shared/structs/message/emitter";
import { Message } from "shared/structs/message";
import { assets } from "shared/constants";

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

export const enum DuelCirclePosition {
  First,
  Second,
  Third,
  Fourth
}

export class DuelCircle<PvP extends boolean = boolean> extends Destroyable {
  public readonly opponentPositions: DuelCirclePositions;
  public readonly teamPositions: DuelCirclePositions;

  // TODO: when duel circle is touched pull in more combatants
  /**
   * Creates a new duel circle.
   * @param location The location of the duel circle.
   * @param pvp Optional boolean indicating if the duel circle is for PvP.
   * If `true`, players may be placed in opponent positions and enemies can not enter. Defaults to `false`.
   */
  public constructor(
    location: Vector3,
    private readonly pvp: PvP = false as PvP
  ) {
    super();

    const model = assets.duel.circle.Clone();
    model.PivotTo(new CFrame(location));
    model.Parent = World.DuelCircles;
    this.opponentPositions = model.opponentPositions;
    this.teamPositions = model.teamPositions;
  }

  /**
   * Adds a player to the duel circle, positioning them in either the team or opponent
   * positions depending on whether they are part of the enemy team.
   * @param player The player to add to the duel circle.
   * @param enemyTeam Optional boolean indicating if the player should be positioned
   * in the opponent positions. Only applicable if the duel circle is for PvP.
   */
  public addPlayer(player: Player, position = DuelCirclePosition.First, enemyTeam?: PvP extends true ? boolean : undefined): void {
    const positions = enemyTeam
      ? this.opponentPositions
      : this.teamPositions;

    MessageEmitter.emitClient(player, Message.TOGGLE_MOVEMENT, false);
    this.pullInCombatant(player.Character!, positions, position);
  }

  /**
   * Adds an enemy to the duel circle, positioning it in the enemy's position.
   * Does nothing if the duel circle is for PvP.
   * @param enemy The enemy to add
   */
  public addEnemy(enemy: Enemy, position = DuelCirclePosition.First): void {
    if (this.pvp) return;
    this.pullInCombatant(enemy.model, this.opponentPositions, position);
  }

  private pullInCombatant(combatantModel: Model, positions: DuelCirclePositions, position: DuelCirclePosition): void {
    const combatantHeight = combatantModel.GetBoundingBox()[1].Y;
    const positionPart = positions[tostring(position + 1) as ExtractKeys<DuelCirclePositions, Part>];

    combatantModel.PrimaryPart!.Anchored = true;
    tween(combatantModel.PrimaryPart!, PULL_IN_TWEEN_INFO, {
      Position: positionPart.Position.add(new Vector3(0, combatantHeight / 2, 0))
    }).Completed.Once(() =>
      tween(combatantModel.PrimaryPart!, TURN_TWEEN_INFO, {
        Orientation: positionPart.Orientation
      })
    );
  }
}