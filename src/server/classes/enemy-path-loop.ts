import { getChildrenOfType } from "@rbxts/instance-utility";

import { Enemy } from "./enemy";
import { getEnemyDescriptor } from "shared/utility";
import Log from "shared/log";

export class EnemyPathLoop {
  public readonly enemies: Enemy[] = [];

  private readonly enemyNames: string[] = [];
  private readonly nodes: BasePart[];
  private readonly maxEnemies: number;
  private readonly spawnInterval: number;
  private lastSpawn = 0;
  private lastSpawnNode?: BasePart;

  public constructor(folder: Folder) {
    this.nodes = getChildrenOfType(folder, "BasePart");
    this.maxEnemies = folder.GetAttribute("MaxEnemies") ?? 6;
    this.spawnInterval = folder.GetAttribute("SpawnInterval") ?? 1.5;

    for (const tag of folder.GetTags()) {
      const [enemyName] = tag.match("Spawns%[(.-)%]");
      if (enemyName === undefined) continue;

      this.enemyNames.push(enemyName as string);
    }
  }

  public update(dt: number): void {
    // TODO: move enemies
  }

  public canSpawn(): boolean {
    return this.enemies.size() < this.maxEnemies &&
      os.clock() - this.lastSpawn >= this.spawnInterval;
  }

  public getRandomEnemy(): Enemy {
    const enemyName = this.enemyNames[math.random(1, this.enemyNames.size()) - 1];
    const descriptor = getEnemyDescriptor(enemyName);
    if (descriptor === undefined)
      return Log.warn(`Failed to spawn enemy: Failed to find enemy descriptor with name "${enemyName}"`, ["EnemyPathLoop"]);

    return new Enemy(descriptor);
  }

  public spawn(enemy: Enemy): void {
    const spawnNode = this.getRandomNode();
    if (spawnNode.Name === this.lastSpawnNode?.Name)
      return this.spawn(enemy);

    enemy.teleport(spawnNode);
    this.enemies.push(enemy);
    this.lastSpawn = os.clock();
    this.lastSpawnNode = spawnNode;
  }

  private getRandomNode(): BasePart {
    return this.getNode(math.random(1, this.nodes.size()));
  }

  private getNode(n: number): BasePart {
    const index = (n - 1) % this.nodes.size();
    return this.nodes[index];
  }
}