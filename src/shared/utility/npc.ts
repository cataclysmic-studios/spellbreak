import { Workspace as World } from "@rbxts/services";
import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";
import { getChildrenOfType } from "@rbxts/instance-utility";

import { loadDescriptors } from "./data-registry";
import type { QuestID } from "shared/structs/quests";
import type { NpcID, NpcDescriptor } from "shared/structs/npc/descriptor";

const npcsFolder = getInstanceAtPath("src/shared/game-data/npcs") as Folder;
const allNPCs = loadDescriptors<NpcID, NpcDescriptor>(npcsFolder, "npc");

export function getNpcByName(name: string): NpcDescriptor {
  for (const [_, descriptor] of allNPCs)
    if (descriptor.name === name)
      return descriptor;

  throw "Failed to find NPC with name: " + name;
}

export function getNpcByID(id: NpcID): NpcDescriptor {
  assert(allNPCs.has(id), "npc with ID " + id + " not found");
  return allNPCs.get(id)!;
}

export function npcGivesQuest(id: NpcID, questID: QuestID): boolean {
  return getNpcByID(id).questsGiven.some(id => id === questID);
}

const modelMap = new Map<NpcID, NpcModel>;
export function getNpcModelByID(id: NpcID): NpcModel {
  if (!modelMap.has(id))
    for (const model of getChildrenOfType<"Model", NpcModel>(World.NPCs, "Model"))
      modelMap.set(model.GetAttribute<NpcID>("ID")!, model);

  return modelMap.get(id)!;
}
