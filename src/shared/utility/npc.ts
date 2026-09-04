import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";

import { loadDescriptors } from "./data-registry";
import { getZoneModel } from "./zone";
import type { QuestID } from "shared/structs/quests";
import type { ZoneID } from "shared/structs/zone";
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

export function getNpcsInZone(zoneID: ZoneID): NpcDescriptor[] {
  const result: NpcDescriptor[] = [];
  for (const [_, descriptor] of allNPCs)
    if (descriptor.zone === zoneID)
      result.push(descriptor);

  return result;
}

export function npcGivesQuest(id: NpcID, questID: QuestID): boolean {
  return getNpcByID(id).questsGiven.some(id => id === questID);
}

/** NPCs only exist in the world while their zone is occupied, so this waits on their zone's `NPCs` folder rather than assuming the model is already there. */
export function getNpcModelByID(id: NpcID): NpcModel {
  const descriptor = getNpcByID(id);
  return getZoneModel(descriptor.zone).NPCs.WaitForChild(descriptor.name) as NpcModel;
}
