import { Service, type OnTick } from "@flamework/core";
import { getChildrenOfType } from "@rbxts/instance-utility";

import { EnemyPathLoop } from "server/classes/enemy-path-loop";
import { getZoneModel } from "shared/utility/zone";
import { ALL_ZONE_IDS, type ZoneID } from "shared/structs/zone";
import type { Enemy } from "server/classes/enemy";

import type { DuelService } from "./duel";
import type { ZoneService } from "./zone";

interface ZonePathLoop {
  zoneID: ZoneID;
  pathLoop: EnemyPathLoop;
}

function collectPathLoops(): ZonePathLoop[] {
  const loops: ZonePathLoop[] = [];
  for (const zoneID of ALL_ZONE_IDS)
    for (const model of getChildrenOfType(getZoneModel(zoneID).EnemyPathLoops, "Model"))
      loops.push({ zoneID, pathLoop: new EnemyPathLoop(model) });

  return loops;
}

@Service()
export class EnemyService implements OnTick {
  private readonly pathLoops = collectPathLoops();

  public constructor(
    private readonly duel: DuelService,
    private readonly zone: ZoneService
  ) { }

  // Skips patrol/spawn work entirely for zones nobody currently occupies - path loops used to
  // tick and spawn up to `maxEnemies` in every zone unconditionally from server start, wasting
  // CPU (and, for anyone else in the server, wasted network replication) on enemies nobody was
  // ever going to see.
  public onTick(dt: number): void {
    for (const { zoneID, pathLoop } of this.pathLoops) {
      if (this.zone.getOccupantCount(zoneID) === 0) continue;

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
    for (const { pathLoop } of this.pathLoops) {
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

  public removeEnemy(enemy: Enemy): void {
    for (const { pathLoop } of this.pathLoops) {
      const index = pathLoop.enemies.indexOf(enemy);
      if (index === -1) continue;

      pathLoop.enemies.remove(index);
      pathLoop.forget(enemy);
      break;
    }

    enemy.model.Destroy();
  }
}