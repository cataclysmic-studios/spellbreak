import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";
import { getDescendantsOfType } from "@rbxts/instance-utility";

import { EnemyID, type EnemyDescriptor } from "../structs/enemy/descriptor";

const allEnemies = new Map<EnemyID, EnemyDescriptor>;;
const descriptorFolder = getInstanceAtPath("src/shared/game-data/enemies")!;
for (const descriptor of getDescendantsOfType(descriptorFolder, "ModuleScript").map(require<EnemyDescriptor>))
  allEnemies.set(descriptor.id, descriptor);

export function getEnemyByID(id: EnemyID): EnemyDescriptor {
  assert(allEnemies.has(id), "enemy with ID " + id + " not found");
  return allEnemies.get(id)!;
}

export function getEnemyByName(name: string): Maybe<EnemyDescriptor> {
  for (const [_, descriptor] of allEnemies)
    if (descriptor.name === name)
      return descriptor;
}
