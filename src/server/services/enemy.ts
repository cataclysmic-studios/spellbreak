import { Service, type OnTick } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { getChildrenOfType } from "@rbxts/instance-utility";

import { EnemyPathLoop } from "server/classes/enemy-path-loop";

@Service()
export class EnemyService implements OnTick {
  private readonly pathLoops = getChildrenOfType(World.WaitForChild("EnemyPathLoops"), "Folder")
    .map(folder => new EnemyPathLoop(folder));

  public onTick(dt: number): void {
    for (const pathLoop of this.pathLoops) {
      pathLoop.update(dt);

      if (!pathLoop.canSpawn()) continue;
      const enemy = pathLoop.getRandomEnemy();
      pathLoop.spawn(enemy);
    }
  }
}