import { getChildrenOfType } from "@rbxts/instance-utility";

import { Enemy } from "./enemy";
import { getEnemyByName } from "shared/utility/enemy";
import Log from "shared/log";

const log = Log.scoped("enemy path loop");

interface PatrolState {
  nodeIndex: number;
  direction: 1 | -1;
  moving: boolean;
  idleUntil: number;
}

export class EnemyPathLoop {
  public readonly enemies: Enemy[] = [];

  private readonly enemyNames: string[] = [];
  private readonly nodes: BasePart[];
  private readonly maxEnemies: number;
  private readonly spawnInterval: number;
  private readonly patrolPauseDuration: number;
  private readonly patrolStates = new Map<Enemy, PatrolState>();
  private lastSpawn = 0;
  private lastSpawnNode?: BasePart;

  public constructor(model: Model) {
    this.nodes = getChildrenOfType(model, "BasePart");
    this.maxEnemies = model.GetAttribute("MaxEnemies") ?? 6;
    this.spawnInterval = model.GetAttribute("SpawnInterval") ?? 1.5;
    this.patrolPauseDuration = model.GetAttribute("PatrolPauseDuration") ?? 2;

    for (const tag of model.GetTags()) {
      const [enemyName] = tag.match("Spawns%[(.-)%]");
      if (enemyName === undefined) continue;

      this.enemyNames.push(enemyName as string);
    }

    if (this.enemyNames.size() === 0)
      log.warn(`EnemyPathLoop @ ${model.GetFullName()} does not contain any enemy spawns.`);
  }

  public update(dt: number): void {
    for (const enemy of this.enemies) {
      if (enemy.dueling) continue;

      const state = this.patrolStates.get(enemy);
      if (state === undefined || state.moving || os.clock() < state.idleUntil || this.nodes.size() < 2) continue;

      const nextIndex = state.nodeIndex + state.direction;
      if (nextIndex < 0 || nextIndex >= this.nodes.size()) state.direction *= -1;

      const targetIndex = state.nodeIndex + state.direction;
      const targetNode = this.nodes[targetIndex];

      state.moving = true;
      enemy.moveTo(targetNode.Position, () => {
        state.nodeIndex = targetIndex;
        state.moving = false;
        state.idleUntil = os.clock() + this.patrolPauseDuration;
      });
    }
  }

  public canSpawn(): boolean {
    return this.enemyNames.size() > 0
      && this.enemies.size() < this.maxEnemies
      && os.clock() - this.lastSpawn >= this.spawnInterval;
  }

  public getRandomEnemy(): Maybe<Enemy> {
    const enemyName = this.enemyNames[math.random(1, this.enemyNames.size()) - 1];
    const descriptor = getEnemyByName(enemyName);
    if (descriptor === undefined) {
      log.warn(`Failed to spawn enemy: Failed to find enemy descriptor with name "${enemyName}"`);
      return;
    }

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
    this.patrolStates.set(enemy, {
      nodeIndex: this.nodes.indexOf(spawnNode),
      direction: math.random() < 0.5 ? 1 : -1,
      moving: false,
      idleUntil: os.clock() + this.patrolPauseDuration
    });
  }

  /** Call alongside removing `enemy` from `enemies` for good. */
  public forget(enemy: Enemy): void {
    this.patrolStates.delete(enemy);
  }

  private getRandomNode(): BasePart {
    return this.getNode(math.random(1, this.nodes.size()));
  }

  private getNode(n: number): BasePart {
    const index = (n - 1) % this.nodes.size();
    return this.nodes[index];
  }
}