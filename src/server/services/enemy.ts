import { Service, type OnTick } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { getChildrenOfType } from "@rbxts/instance-utility";

import { EnemyPathLoop } from "server/classes/enemy-path-loop";
import type { Enemy } from "server/classes/enemy";

import type { DuelService } from "./duel";

@Service()
export class EnemyService implements OnTick {
  private readonly pathLoops = getChildrenOfType(World.WaitForChild("EnemyPathLoops"), "Model")
    .map(model => new EnemyPathLoop(model));

  public constructor(
    private readonly duel: DuelService
  ) { }

  public onTick(dt: number): void {
    for (const pathLoop of this.pathLoops) {
      pathLoop.update(dt);

      if (!pathLoop.canSpawn()) continue;
      const enemy = pathLoop.getRandomEnemy();
      if (enemy === undefined) continue;

      enemy.touchedByPlayer.Connect(player => this.duel.startDuel(player, enemy));
      pathLoop.spawn(enemy);
    }
  }

  public findEnemyByID(id: number): Maybe<Enemy> {
    let enemy: Maybe<Enemy>;
    for (const pathLoop of this.pathLoops) {
      enemy = this.findEnemyInPathLoopByID(pathLoop, id);
      if (enemy !== undefined) break;
    }

    return enemy;
  }

  public findEnemyInPathLoopByID(pathLoop: EnemyPathLoop, id: number): Maybe<Enemy> {
    return pathLoop.enemies.find(enemy => enemy.id === id);
  }
}