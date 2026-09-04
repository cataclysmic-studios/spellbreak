import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";
import Object from "@rbxts/object-utils";

import { loadDescriptors } from "./data-registry";
import { getNpcByID, getNpcModelByID } from "./npc";
import { getEnemyByID } from "./enemy";
import { getZoneByID } from "./zone";
import { QuestGoalAction, QuestID, type TalkQuestGoal, type QuestDescriptor, type QuestGoal, type QuestInfo } from "shared/structs/quests";
import type { CharacterData } from "shared/structs/data";
import type { NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";
import type { ZoneID } from "shared/structs/zone";

const questsFolder = getInstanceAtPath("src/shared/game-data/quests") as Folder;
const allQuests = loadDescriptors<QuestID, QuestDescriptor>(questsFolder, "quest");

export function getAllQuests(): Map<QuestID, QuestDescriptor> {
  return allQuests;
}

export function getQuestByID(id: QuestID): QuestDescriptor {
  assert(allQuests.has(id), "quest with ID " + id + " not found");
  return allQuests.get(id)!;
}

/** Looks up a `QuestID` by its enum member name (e.g. Studio attribute values, which store "WC_1" rather than its numeric value). */
export function getQuestIDByName(name: string): QuestID {
  const id = QuestID[name as keyof typeof QuestID];
  assert(id !== undefined, "quest with name " + name + " not found");
  return id;
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
      return getZoneByID(target).name;
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

export function getGoalTargetPosition({ action, target }: QuestGoal): Vector3 {
  switch (action) {
    case QuestGoalAction.Talk:
      return getNpcModelByID(target).PrimaryPart!.Position;
    case QuestGoalAction.Explore:
      return Vector3.zero;
    case QuestGoalAction.Defeat:
      return Vector3.zero;
  }
}

export function getGoalTargetPortrait({ action, target }: QuestGoal): string {
  switch (action) {
    case QuestGoalAction.Talk:
      return getNpcByID(target).portrait;
    case QuestGoalAction.Explore:
      return "";
    case QuestGoalAction.Defeat:
      return "";
  }
}

export function getQuestDescription(id: QuestID, goalIndex = 0): string {
  const quest = getQuestByID(id);
  const goal = quest.goals[goalIndex];
  const zone = getGoalTargetZone(goal);

  return `${goal.action} ${getGoalTargetName(goal)} in ${getZoneByID(zone).name}`;
}

export function getSelectedQuestInfo({ selectedQuest, activeQuests }: CharacterData): Maybe<QuestInfo> {
  if (selectedQuest === undefined) return;

  const goalIndex = activeQuests[selectedQuest];
  if (goalIndex === undefined) return;

  return { questID: selectedQuest, goalIndex };
}