import { Service } from "@flamework/core";
import Sift from "@rbxts/sift";

import { Message, type MessageData } from "shared/messaging";
import { OnServerMessage } from "shared/meta";
import { npcGivesQuest } from "shared/utility/npc";
import { canReceiveQuest, getActiveQuestIDs, getCurrentGoalIndex, getQuestByID, hasQuest } from "shared/utility/quests";
import { QuestGoalAction, type QuestID } from "shared/structs/quests";
import type { ZoneID } from "shared/structs/zone";
import Log from "shared/log";

import type { DatabaseService } from "./database";

const log = Log.scoped("quest service");

@Service()
export class QuestService {
  public constructor(
    private readonly database: DatabaseService
  ) { }

  /** @hidden */
  @OnServerMessage(Message.Quest_PickUp)
  public pickUp(player: Player, { id, npcID }: MessageData[Message.Quest_PickUp]): void {
    const character = this.database.getCharacter(player);
    if (!canReceiveQuest(character, id)) return;
    if (!npcGivesQuest(npcID, id))
      return log.warn(`Cannot pick up quest ${id}: NPC ${player} does not give this quest`);

    log.info(`${player} picked up quest ${id} from NPC ${npcID}`);
    if (this.checkCompletion(player, id, 0)) return; // some quests can be picked up and immediately completed w/o doing anything
    this.setActiveQuestGoal(player, id, 0, true);
  }

  /** @hidden */
  @OnServerMessage(Message.Quest_CompleteGoal)
  public completeGoal(player: Player, { id, goalIndex }: MessageData[Message.Quest_CompleteGoal]): void {
    const character = this.database.getCharacter(player);
    if (!hasQuest(character, id)) return;

    const currentGoalIndex = getCurrentGoalIndex(character, id);
    const goalNumber = goalIndex + 1;
    if (currentGoalIndex !== goalIndex)
      return log.warn(`Cannot complete goal #${goalNumber} for ${player} on quest ${id}: Current goal is #${goalNumber}`);

    log.info(`${player} completed goal #${goalNumber} for quest ${id}`);
    if (this.checkCompletion(player, id, goalNumber)) return;
    this.setActiveQuestGoal(player, id, goalNumber);
  }

  /** Completes the current goal of any active quest that's waiting on the player to reach `zoneID`. Call this whenever a player is transferred into a zone. */
  public onZoneEntered(player: Player, zoneID: ZoneID): void {
    const character = this.database.getCharacter(player);

    for (const id of getActiveQuestIDs(character)) {
      const goalIndex = getCurrentGoalIndex(character, id);
      if (goalIndex === undefined) continue;

      const goal = getQuestByID(id).goals[goalIndex];
      if (goal.action !== QuestGoalAction.Explore) continue;
      if (goal.target !== zoneID) continue;

      const goalNumber = goalIndex + 1;
      log.info(`${player} completed goal #${goalNumber} for quest ${id} by entering zone ${zoneID}`);
      if (this.checkCompletion(player, id, goalNumber)) continue;
      this.setActiveQuestGoal(player, id, goalNumber);
    }
  }

  public async complete(player: Player, id: QuestID): Promise<void> {
    log.info(`${player} completed quest ${id}!`);
    await this.database.updateCharacter(player, character =>
      Sift.Dictionary.merge(character, {
        selectedQuest: character.selectedQuest === id ? undefined : character.selectedQuest,
        activeQuests: Sift.Dictionary.filter(character.activeQuests, key => key !== id),
        completedQuests: Sift.Array.push(character.completedQuests, id)
      })
    );
  }

  private checkCompletion(player: Player, id: QuestID, goalIndex: number): boolean {
    const quest = getQuestByID(id);
    const completed = goalIndex === quest.goals.size();
    log.debug(`Is quest ${id} @ goal #${goalIndex + 1} complete for player ${player}?: ${completed ? "yes" : "no"}`);

    if (completed)
      this.complete(player, id);

    return completed;
  }

  private async setActiveQuestGoal(player: Player, id: QuestID, goalIndex: number, selectQuest = false): Promise<void> {
    await this.database.updateCharacter(player, character =>
      Sift.Dictionary.merge(character, {
        selectedQuest: selectQuest ? id : character.selectedQuest,
        activeQuests: Sift.Dictionary.set(character.activeQuests, id, goalIndex)
      })
    );
  }
}