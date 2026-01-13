import { Service } from "@flamework/core";
import Sift from "@rbxts/sift";

import { Message, MessageData } from "shared/messaging";
import { OnServerMessage } from "shared/meta";
import { npcGivesQuest } from "shared/utility/npc";
import { canReceiveQuest } from "shared/utility/quests";
import Log from "shared/log";

import type { CharacterService } from "./character";
import type { DatabaseService } from "./database";

@Service()
export class QuestService {
  public constructor(
    private readonly character: CharacterService,
    private readonly database: DatabaseService
  ) { }

  @OnServerMessage(Message.Quest_PickUp)
  public pickUp(player: Player, { id, npcID }: MessageData[Message.Quest_PickUp]): void {
    const data = this.database.get(player);
    const characterIndex = this.character.getSelected();
    const character = data.characters[characterIndex];
    if (!npcGivesQuest(npcID, id)) return;
    if (!canReceiveQuest(character, id)) return;

    Log.info(player + " picked up quest " + id);
    this.database.updateCharacter(player, character =>
      Sift.Dictionary.merge(character, {
        activeQuests: Sift.Dictionary.set(character.activeQuests, id, 0)
      })
    );
  }
}