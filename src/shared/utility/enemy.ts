import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";
import { getDescendantsOfType } from "@rbxts/instance-utility";

import type { EnemyDescriptor } from "../structs/enemy/descriptor";

export function getEnemyDescriptor(name: string): Maybe<EnemyDescriptor> {
  return getAllEnemyDescriptors().find(descriptor => descriptor.name === name);
}

let allEnemyDescriptorsCache: Maybe<EnemyDescriptor[]>;
function getAllEnemyDescriptors(): EnemyDescriptor[] {
  if (allEnemyDescriptorsCache !== undefined)
    return allEnemyDescriptorsCache;

  const descriptorFolder = getInstanceAtPath("src/shared/enemies")!;
  return allEnemyDescriptorsCache = getDescendantsOfType(descriptorFolder, "ModuleScript").map(require<EnemyDescriptor>);
}
