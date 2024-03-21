import { Service } from "@flamework/core";
import { Components } from "@flamework/components";

import { Assets } from "shared/utility/helpers";

import type { Enemy } from "server/components/enemy";
import type { BattleCircle } from "server/components/battle-circle";

@Service()
export class BattleService {
  public constructor(
    private readonly components: Components
  ) {}

  public startPvE(player: Player, enemy: Enemy): void {
    const battleCircle = this.components.addComponent<BattleCircle>(Assets.BattleCircle.Clone());
    battleCircle.addTeammate(player);
    battleCircle.addOpponent(enemy);
  }

  public startPvP(player: Player, opponent: Player): void {

  }

  public conclude(battleCircle: BattleCircle): void {
    battleCircle.destroy();
  }
}