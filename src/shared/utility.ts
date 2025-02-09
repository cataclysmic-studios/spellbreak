import { ReplicatedStorage, RunService } from "@rbxts/services";
import { getDescendantsOfType, tween } from "@rbxts/instance-utility";

import type { EnemyDescriptor } from "./structs/enemy/descriptor";

export function getEnemyDescriptor(name: string): Maybe<EnemyDescriptor> {
  const descriptorFolder = ReplicatedStorage.WaitForChild("TS").WaitForChild("enemies");
  return getDescendantsOfType(descriptorFolder, "ModuleScript")
    .map(require<EnemyDescriptor>)
    .find(descriptor => descriptor.name === name);
}