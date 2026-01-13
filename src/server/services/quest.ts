import { Service } from "@flamework/core";
import Sift from "@rbxts/sift";

import { Message, MessageData } from "shared/messaging";
import { OnServerMessage } from "shared/meta";
import { npcGivesQuest } from "shared/utility/npc";
import { canReceiveQuest } from "shared/utility/quests";
import Log from "shared/log";

import type { DatabaseService } from "./database";

const LOG_TAGS = ["quest service"];

@Service()
export class QuestService {
  public constructor(
    private readonly database: DatabaseService
  ) { }

  @OnServerMessage(Message.Quest_PickUp)
  public pickUp(player: Player, { id, npcID }: MessageData[Message.Quest_PickUp]): void {
    const character = this.database.getCharacter(player);
    if (!canReceiveQuest(character, id)) return;
    if (!npcGivesQuest(npcID, id))
      return Log.warn("Cannot pick up quest " + id + ": NPC " + npcID + " does not give this quest", LOG_TAGS);

    Log.info(player + " picked up quest " + id + " from NPC " + npcID, LOG_TAGS);
    this.database.updateCharacter(player, character =>
      Sift.Dictionary.merge(character, {
        activeQuests: Sift.Dictionary.set(character.activeQuests, id, 0)
      })
    );
  }
}