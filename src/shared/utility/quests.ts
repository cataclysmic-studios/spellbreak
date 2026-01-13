import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";
import { getDescendantsOfType } from "@rbxts/instance-utility";
import type { CharacterData } from "shared/structs/data";
import type { QuestDescriptor, QuestID } from "shared/structs/quests";

const allQuests = new Map<QuestID, QuestDescriptor>;
const questsFolder = getInstanceAtPath("src/shared/game-data/quests") as Folder;
for (const questModule of getDescendantsOfType(questsFolder, "ModuleScript")) {
  const quest = require<QuestDescriptor>(questModule);
  allQuests.set(quest.id, quest);
}

export function getQuestByID(id: QuestID): QuestDescriptor {
  return allQuests.get(id)!;
}

function getID(quest: QuestID | QuestDescriptor): QuestID {
  return typeIs(quest, "number") ? quest : quest.id;
}

export function canReceiveQuest(character: CharacterData, id: QuestID | QuestDescriptor): boolean {
  const quest = typeIs(id, "number") ? getQuestByID(id) : id;
  return character.level >= quest.requiredLevel
    && !hasCompletedQuest(character, quest)
    && (!hasPrequests(quest) || quest.prequests.every(prequest => hasCompletedQuest(character, prequest)));
}

export function hasQuest(character: CharacterData, quest: QuestID | QuestDescriptor): boolean {
  return character.activeQuests[getID(quest)] !== undefined;
}

export function hasCompletedQuest(character: CharacterData, quest: QuestID | QuestDescriptor): boolean {
  return character.completedQuests.includes(getID(quest));
}

export function hasPrequests(quest: QuestDescriptor): quest is QuestDescriptor & { prequests: NonNullable<QuestDescriptor["prequests"]> } {
  return quest.prequests !== undefined && quest.prequests.size() > 0;
}
