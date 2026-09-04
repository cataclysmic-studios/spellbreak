import { Service, type OnTick } from "@flamework/core";
import { getChildrenOfType } from "@rbxts/instance-utility";

import { EnemyPathLoop } from "server/classes/enemy-path-loop";
import { getZoneModel } from "shared/utility/zone";
import { ALL_ZONE_IDS } from "shared/structs/zone";
import type { Enemy } from "server/classes/enemy";

import type { DuelService } from "./duel";

function collectPathLoops(): EnemyPathLoop[] {
  const loops: EnemyPathLoop[] = [];
  for (const zoneID of ALL_ZONE_IDS)
    for (const model of getChildrenOfType(getZoneModel(zoneID).EnemyPathLoops, "Model"))
      loops.push(new EnemyPathLoop(model));

  return loops;
}

@Service()
export class EnemyService implements OnTick {
  private readonly pathLoops = collectPathLoops();

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

  /** Resolves a part touched during physics collision back to the `Enemy` instance it belongs to, via the "ID" attribute set on every enemy's model. */
  public findEnemyFromTouch(hit: BasePart): Maybe<Enemy> {
    const model = hit.FindFirstAncestorOfClass("Model");
    const id = model?.GetAttribute("ID") as Maybe<number>;
    return id === undefined ? undefined : this.findEnemyByID(id);
  }

  public findEnemyInPathLoopByID(pathLoop: EnemyPathLoop, id: number): Maybe<Enemy> {
    return pathLoop.enemies.find(enemy => enemy.id === id);
  }
}