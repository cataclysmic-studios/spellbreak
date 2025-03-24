import { getChildrenOfType } from "@rbxts/instance-utility";

import { Enemy } from "./enemy";
import { getEnemyDescriptor } from "shared/utility/enemy";
import Log from "shared/log";

export class EnemyPathLoop {
  public readonly enemies: Enemy[] = [];

  private readonly enemyNames: string[] = [];
  private readonly nodes: BasePart[];
  private readonly maxEnemies: number;
  private readonly spawnInterval: number;
  private lastSpawn = 0;
  private lastSpawnNode?: BasePart;

  public constructor(model: Model) {
    this.nodes = getChildrenOfType(model, "BasePart");
    this.maxEnemies = model.GetAttribute("MaxEnemies") ?? 6;
    this.spawnInterval = model.GetAttribute("SpawnInterval") ?? 1.5;

    for (const tag of model.GetTags()) {
      const [enemyName] = tag.match("Spawns%[(.-)%]");
      if (enemyName === undefined) continue;

      this.enemyNames.push(enemyName as string);
    }

    if (this.enemyNames.size() === 0)
      Log.warn(`EnemyPathLoop @ ${model.GetFullName()} does not contain any enemy spawns.`);
  }

  public update(dt: number): void {

  }

  public canSpawn(): boolean {
    return this.enemyNames.size() > 0 &&
      this.enemies.size() < this.maxEnemies &&
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