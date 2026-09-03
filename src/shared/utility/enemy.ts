import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";

import { loadDescriptors } from "./data-registry";
import { EnemyID, type EnemyDescriptor } from "../structs/enemy/descriptor";

const enemiesFolder = getInstanceAtPath("src/shared/game-data/enemies") as Folder;
const allEnemies = loadDescriptors<EnemyID, EnemyDescriptor>(enemiesFolder, "enemy");

export function getEnemyByID(id: EnemyID): EnemyDescriptor {
  assert(allEnemies.has(id), "enemy with ID " + id + " not found");
  return allEnemies.get(id)!;
}

export function getEnemyByName(name: string): Maybe<EnemyDescriptor> {
  for (const [_, descriptor] of allEnemies)
    if (descriptor.name === name)
      return descriptor;
}
