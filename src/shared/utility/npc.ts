import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";
import { getChildrenOfType } from "@rbxts/instance-utility";

import type { QuestID } from "shared/structs/quests";
import type { NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";
import type { DialogID, DialogDescriptor } from "shared/structs/npc/dialog";

const allNPCs = new Map<NpcID, NpcDescriptor>;
const npcsFolder = getInstanceAtPath("src/shared/game-data/npcs") as Folder;
for (const npcModule of getChildrenOfType(npcsFolder, "ModuleScript")) {
  const npc = require<NpcDescriptor>(npcModule);
  allNPCs.set(npc.id, npc);
}

const allDialogs = new Map<DialogID, DialogDescriptor>;
const dialogFolder = getInstanceAtPath("src/shared/game-data/dialog") as Folder;
for (const dialogModule of getChildrenOfType(dialogFolder, "ModuleScript")) {
  const dialog = require<DialogDescriptor>(dialogModule);
  allDialogs.set(dialog.id, dialog);
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

export function npcGivesQuest(id: NpcID, questID: QuestID): boolean {
  return getNpcByID(id).questsGiven.some(quest => quest.id === questID);
}

export function getDialogByID(id: DialogID): DialogDescriptor {
  return allDialogs.get(id)!;
}