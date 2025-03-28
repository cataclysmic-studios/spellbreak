import { Service } from "@flamework/core";
import { getChildrenOfType } from "@rbxts/instance-utility";
import { Workspace as World } from "@rbxts/services";

import { OnMessage } from "server/decorators";
import { Message, type MessageData } from "shared/messaging";
import { DuelCircle, type Combatant } from "server/classes/duel-circle";
import { DuelCirclePosition } from "shared/structs/duel";
import type { Enemy } from "server/classes/enemy";

@Service()
export class DuelService {
  public readonly combatantsInDuels = new Set<Combatant>;

  private readonly circles: DuelCircle[] = [];
  private readonly circleLocations = getChildrenOfType(World.WaitForChild("DuelCircleLocations"), "BasePart")
    .map(part => part.Position);

  /** @hidden */
  @OnMessage(Message.DuelSubmitChoice)
  public choiceSubmitted(player: Player, { id, choice }: MessageData[Message.DuelSubmitChoice]): void {
    const duel = this.circles.find(circle => circle.id === id);
    if (duel === undefined)
      return player.Kick("stop it");

    duel.submitPlayerChoice(player, choice);
  }

  /** @hidden */
  @OnMessage(Message.DuelRevokeChoice)
  public choiceRevoked(player: Player, { id }: MessageData[Message.DuelRevokeChoice]): void {
    const duel = this.circles.find(circle => circle.id === id);
    if (duel === undefined)
      return player.Kick("stop it");

    duel.revokePlayerChoice(player);
  }

  /**
   * Starts a PvE duel with the given enemy, placing the player and enemy in a duel circle
   * at the nearest location to the player.
   * @param player The player to start the duel with.
   * @param enemy The enemy to duel.
   */
  public startPvE(player: Player, enemy: Enemy): void {
    const playerPosition = player.Character!.GetPivot().Position;
    const circleLocation = this.getNearestCircleLocation(playerPosition);
    const duel = new DuelCircle(this, circleLocation)
    this.circles.push(duel);

    duel.addPlayer(player, DuelCirclePosition.First);
    duel.addEnemy(enemy, DuelCirclePosition.First);
  }

  // TODO: startPvP, arena stuff

  private getNearestCircleLocation(position: Vector3): Vector3 {
    const distances = this.circleLocations.map(location => position.sub(location).Magnitude);
    return this.circleLocations[distances.indexOf(math.min(...distances))];
  }
}