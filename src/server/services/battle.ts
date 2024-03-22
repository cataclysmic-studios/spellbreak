import { Service } from "@flamework/core";
import { Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { Assets } from "shared/utility/helpers";

import type { Enemy } from "server/components/enemy";
import type { BattleCircle } from "server/components/battle-circle";

@Service()
export class BattleService {
  public constructor(
    private readonly components: Components
  ) {}

  public startPvE(player: Player, enemy: Enemy): void {
    const battleCircle = this.createCircle();
    battleCircle.addTeammate(player);
    battleCircle.addOpponent(enemy);
  }

  public startPvP(team1: Player[], team2: Player[]): void {
    const battleCircle = this.createCircle();
    battleCircle.pvp = true;

    for (const player of team1)
      battleCircle.addTeammate(player);
    for (const player of team2)
      battleCircle.addOpponent(player);
  }

  private createCircle(): BattleCircle {
    const battleCircle = this.components.addComponent<BattleCircle>(Assets.BattleCircle.Clone());
    battleCircle.instance.Parent = World.BattleCircles;
    return battleCircle;
  }

  public conclude(battleCircle: BattleCircle): void {
    battleCircle.destroy();
  }
}