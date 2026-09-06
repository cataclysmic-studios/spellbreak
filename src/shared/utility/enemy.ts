import { CollectionService } from "@rbxts/services";
import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";

import { loadDescriptors } from "./data-registry";
import { EnemyID, type EnemyDescriptor } from "../structs/enemy/descriptor";
import Log from "shared/log";

const enemiesFolder = getInstanceAtPath("src/shared/game-data/enemies") as Folder;
const allEnemies = loadDescriptors<EnemyID, EnemyDescriptor>(enemiesFolder, "enemy");

/** Tagged onto every spawned `EnemyModel`, alongside an `EnemyID` attribute, so live enemies can be found by ID without a per-zone folder to search (unlike NPCs, enemies patrol freely and aren't parented under a fixed container). */
export const ENEMY_TAG = "Enemy";

export function getEnemyByID(id: EnemyID): EnemyDescriptor {
  Log.assert(allEnemies.has(id), "enemy with ID " + id + " not found");
  return allEnemies.get(id)!;
}

export function getEnemyByName(name: string): Maybe<EnemyDescriptor> {
  for (const [_, descriptor] of allEnemies)
    if (descriptor.name === name)
      return descriptor;
}

/** Finds the closest living, spawned instance of `id` to `fromPosition`, if any are currently in the world. */
export function getNearestEnemyPosition(id: EnemyID, fromPosition: Vector3): Maybe<Vector3> {
  let nearest: Maybe<Vector3>;
  let nearestDistance = math.huge;

  for (const instance of CollectionService.GetTagged(ENEMY_TAG)) {
    const model = instance as EnemyModel;
    if (model.GetAttribute<number>("EnemyID") !== id) continue;

    const primaryPart = model.PrimaryPart;
    if (primaryPart === undefined) continue;

    const position = primaryPart.Position;
    const distance = position.sub(fromPosition).Magnitude;
    if (distance >= nearestDistance) continue;

    nearest = position;
    nearestDistance = distance;
  }

  return nearest;
}
