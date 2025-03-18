import { Service, type OnTick } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { getChildrenOfType } from "@rbxts/instance-utility";
import { flatten } from "@rbxts/array-utils";

import { EnemyPathLoop } from "server/classes/enemy-path-loop";
import type { Enemy } from "server/classes/enemy";

@Service()
export class EnemyService implements OnTick {
  private readonly pathLoops = getChildrenOfType(World.WaitForChild("EnemyPathLoops"), "Model")
    .map(model => new EnemyPathLoop(model));

  public onTick(dt: number): void {
    for (const pathLoop of this.pathLoops) {
      pathLoop.update(dt);

      if (!pathLoop.canSpawn()) continue;
      const enemy = pathLoop.getRandomEnemy();
      pathLoop.spawn(enemy);
    }
  }

  public findEnemyByID(id: number): Maybe<Enemy> {
    return flatten(this.pathLoops.map(pathLoop => pathLoop.enemies))
      .find(enemy => enemy.id === id);
  }
}