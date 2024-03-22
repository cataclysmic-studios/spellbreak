import { Service } from "@flamework/core";
import { Components } from "@flamework/components";

import { Assets } from "shared/utility/helpers";

import { Enemy } from "server/components/enemy";
import type { BattleCircle } from "server/components/battle-circle";

type Combatant = Player | Enemy;

@Service()
export class BattleService {
  public constructor(
    private readonly components: Components
  ) {}

  public startPvE(player: Player, enemy: Enemy): void {
    const battleCircle = this.createCircle(player);
    battleCircle.addTeammate(player);
    battleCircle.addOpponent(enemy);
  }

  public startPvP(team1: Player[], team2: Player[]): void {
    const battleCircle = this.createCircle(team1[0]);
    battleCircle.pvp = true;

    for (const player of team1)
      battleCircle.addTeammate(player);
    for (const player of team2)
      battleCircle.addOpponent(player);
  }

  private createCircle(firstCombatant: Combatant): BattleCircle {
    const combatantIsNPC = firstCombatant instanceof Enemy;
    const character = combatantIsNPC ? firstCombatant.instance : firstCombatant.Character!;
    const battleCircleModel = Assets.Battle.BattleCircle.Clone();
    battleCircleModel.SetAttribute("FirstCombatantPosition", character.PrimaryPart!.Position);
    return this.components.addComponent<BattleCircle>(battleCircleModel);
  }

  public conclude(battleCircle: BattleCircle): void {
    battleCircle.destroy();
  }
}