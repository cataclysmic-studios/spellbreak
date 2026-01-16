import { Service } from "@flamework/core";
import Sift from "@rbxts/sift";

import { Message, type MessageData } from "shared/messaging";
import { OnServerMessage } from "shared/meta";
import { npcGivesQuest } from "shared/utility/npc";
import { canReceiveQuest, getCurrentGoalIndex, getQuestByID, hasQuest } from "shared/utility/quests";
import type { QuestID } from "shared/structs/quests";
import Log from "shared/log";

import type { DatabaseService } from "./database";

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
      return Log.warn(`Cannot pick up quest ${id}: NPC ${player} does not give this quest`, ["quest service"]);

    Log.info(`${player} picked up quest ${id} from NPC ${npcID}`, ["quest service"]);
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
      return Log.warn(`Cannot complete goal #${goalNumber} for ${player} on quest ${id}: Current goal is #${goalNumber}`, ["quest service"]);

    Log.info(`${player} completed goal #${goalNumber} for quest ${id}`, ["quest service"]);
    if (this.checkCompletion(player, id, goalNumber)) return;
    this.setActiveQuestGoal(player, id, goalNumber);
  }

  public async complete(player: Player, id: QuestID): Promise<void> {
    Log.info(`${player} completed quest ${id}!`, ["quest service"]);
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
    Log.info(`Is quest ${id} @ goal #${goalIndex + 1} complete for player ${player}?: ${completed ? "yes" : "no"}`, ["quest service"]);

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