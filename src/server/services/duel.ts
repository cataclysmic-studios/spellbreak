import { Service } from "@flamework/core";
import { getChildrenOfType } from "@rbxts/instance-utility";
import { Workspace as World } from "@rbxts/services";

import { DuelCircle, type Combatant } from "server/classes/duel-circle";
import type { Enemy } from "server/classes/enemy";

@Service()
export class DuelService {
  public readonly comabatantsInDuels = new Set<Combatant>;

  private readonly circles: DuelCircle[] = [];
  private readonly circleLocations = getChildrenOfType(World.WaitForChild("DuelCircleLocations"), "BasePart")
    .map(part => part.Position);

  /**
   * Starts a PvE duel with the given enemy, placing the player and enemy in a duel circle
   * at the nearest location to the player.
   * @param player The player to start the duel with.
   * @param enemy The enemy to duel.
   */
  public startPvE(player: Player, enemy: Enemy): void {
    const playerPosition = player.Character!.GetPivot().Position;
    const circleLocation = this.getNearestCircleLocation(playerPosition);
    const duelCircle = new DuelCircle<false>(circleLocation);
    this.circles.push(duelCircle);

    // TODO: remove combatants from this.comabatantsInDuels when duel is completed
    this.comabatantsInDuels.add(player);
    this.comabatantsInDuels.add(enemy);
    duelCircle.addPlayer(player);
    duelCircle.addEnemy(enemy);
  }

  private getNearestCircleLocation(position: Vector3): Vector3 {
    const distances = this.circleLocations.map(location => position.sub(location).Magnitude);
    return this.circleLocations[distances.indexOf(math.min(...distances))];
  }
}