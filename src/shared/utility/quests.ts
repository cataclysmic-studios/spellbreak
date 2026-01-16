import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";
import { getDescendantsOfType } from "@rbxts/instance-utility";
import Object from "@rbxts/object-utils";

import { getNpcByID } from "./npc";
import { getEnemyByID } from "./enemy";
import { getZoneName } from "./zone";
import { QuestGoalAction, type TalkQuestGoal, type QuestDescriptor, type QuestGoal, type QuestID } from "shared/structs/quests";
import type { CharacterData } from "shared/structs/data";
import type { NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";
import type { ZoneID } from "shared/structs/zone";

const allQuests = new Map<QuestID, QuestDescriptor>;
const questsFolder = getInstanceAtPath("src/shared/game-data/quests") as Folder;
for (const questModule of getDescendantsOfType(questsFolder, "ModuleScript")) {
  const quest = require<QuestDescriptor>(questModule);
  allQuests.set(quest.id, quest);
}

export function getAllQuests(): Map<QuestID, QuestDescriptor> {
  return allQuests;
}

export function getQuestByID(id: QuestID): QuestDescriptor {
  assert(allQuests.has(id), "quest with ID " + id + " not found");
  return allQuests.get(id)!;
}

function getID(quest: QuestID | QuestDescriptor): QuestID {
  return typeIs(quest, "number") ? quest : quest.id;
}

export function getActiveQuestIDs({ activeQuests }: CharacterData) {
  return Object.keys(activeQuests).mapFiltered(id => tonumber(id));
}

interface TalkGoalInfo {
  readonly questID: QuestID;
  readonly goalIndex: number;
  readonly goal: TalkQuestGoal;
}

export function getFirstCompletableTalkGoal(
  character: CharacterData,
  npcID: NpcID,
  quests: QuestID[] = getActiveQuestIDs(character)
): Maybe<TalkGoalInfo> {
  for (const questID of quests) {
    if (!hasQuest(character, questID)) continue;
    if (hasCompletedQuest(character, questID)) continue;

    const goalIndex = getCurrentGoalIndex(character, questID);
    if (goalIndex === undefined) continue;

    const goal = getQuestByID(questID).goals[goalIndex];
    if (goal.action !== QuestGoalAction.Talk) continue;
    if (goal.target !== npcID) continue;

    return { questID, goalIndex, goal };
  }

  return undefined;
}

export function canReceiveQuest(character: CharacterData, id: QuestID | QuestDescriptor): boolean {
  const quest = typeIs(id, "number") ? getQuestByID(id) : id;
  return character.level >= quest.requiredLevel
    && !hasQuest(character, quest)
    && !hasCompletedQuest(character, quest)
    && (!hasPrequests(quest) || quest.prequests.every(prequest => hasCompletedQuest(character, prequest)));
}

export function getCurrentGoalIndex(character: CharacterData, arg: QuestID | QuestDescriptor): Maybe<number> {
  const quest = typeIs(arg, "number") ? getQuestByID(arg) : arg;
  const id = getID(quest);
  if (!("goals" in quest)) return;

  const goalIndex = character.activeQuests[id];
  assert(goalIndex !== undefined, "cannot get current goal for quest " + id + ", quest is inactive");

  return goalIndex;
}

export function hasQuest({ activeQuests }: CharacterData, quest: QuestID | QuestDescriptor): boolean {
  const id = getID(quest);
  return id in activeQuests;
}

export function hasCompletedQuest({ completedQuests }: CharacterData, quest: QuestID | QuestDescriptor): boolean {
  return completedQuests.includes(getID(quest));
}

export function hasPrequests(quest: QuestDescriptor): quest is QuestDescriptor & { prequests: NonNullable<QuestDescriptor["prequests"]> } {
  return quest.prequests !== undefined && quest.prequests.size() > 0;
}

export function canGiveNewQuest(character: CharacterData, { questsGiven }: NpcDescriptor): boolean {
  return questsGiven.some(quest => canReceiveQuest(character, quest));
}

export function hasActiveQuestFrom(character: CharacterData, { questsGiven }: NpcDescriptor): boolean {
  return questsGiven.some(quest => hasQuest(character, quest));
}

export function getGoalTargetName({ action, target }: QuestGoal): string {
  switch (action) {
    case QuestGoalAction.Talk:
      return getNpcByID(target).name;
    case QuestGoalAction.Explore:
      return getZoneName(target);
    case QuestGoalAction.Defeat:
      return getEnemyByID(target).name;
  }
}

export function getGoalTargetZone({ action, target }: QuestGoal): ZoneID {
  switch (action) {
    case QuestGoalAction.Talk:
      return getNpcByID(target).zone;
    case QuestGoalAction.Explore:
      return target;
    case QuestGoalAction.Defeat:
      return getEnemyByID(target).zone;
  }
}

export function getQuestDescription(id: QuestID, goalIndex = 0): string {
  const quest = getQuestByID(id);
  const goal = quest.goals[goalIndex];
  const zone = getGoalTargetZone(goal);

  return `${goal.action} ${getGoalTargetName(goal)} in ${getZoneName(zone)}`;
}