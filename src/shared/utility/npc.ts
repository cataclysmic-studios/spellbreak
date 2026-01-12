import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";
import { getChildrenOfType } from "@rbxts/instance-utility";
import type { NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";

const allNPCs = new Map<NpcID, NpcDescriptor>;
const npcsFolder = getInstanceAtPath("src/shared/npcs") as Folder;
for (const npcModule of getChildrenOfType(npcsFolder, "ModuleScript")) {
  const npc = require<NpcDescriptor>(npcModule);
  allNPCs.set(npc.id, npc);
}

export function getNpcByName(name: string): NpcDescriptor {
  for (const [_, descriptor] of allNPCs)
    if (descriptor.name === name)
      return descriptor;

  throw "Failed to find NPC with name: " + name;
}

export function getNpcByID(id: NpcID): NpcDescriptor {
  return allNPCs.get(id)!;
}