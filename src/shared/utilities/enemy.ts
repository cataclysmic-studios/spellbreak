import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";
import { getDescendantsOfType } from "@rbxts/instance-utility";

import type { EnemyDescriptor } from "../structs/enemy/descriptor";

export function getEnemyDescriptor(name: string): Maybe<EnemyDescriptor> {
  const descriptorFolder = getInstanceAtPath("src/shared/enemies")!;
  return getDescendantsOfType(descriptorFolder, "ModuleScript")
    .map(require<EnemyDescriptor>)
    .find(descriptor => descriptor.name === name);
}