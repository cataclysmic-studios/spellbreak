import { Service } from "@flamework/core";
import { HttpService as HTTP } from "@rbxts/services";

import type { OnPlayerJoin } from "server/hooks";
import type { LogStart } from "shared/hooks";
import { USE_CURLY_BRACES_FOR_UUIDS } from "shared/constants";
import { isValidUUID } from "shared/utility/strings";
import { School, type PlayableSchool } from "shared/data-models/school";
import type { CharacterData } from "shared/data-models/character-data";
import { NEW_CHARACTER, DEFAULT_HEALTHS } from "shared/default-structs/new-character";

import type { DatabaseService } from "./third-party/database";
import type { CharacterService } from "./character";
import type CharacterHelper from "shared/helpers/character";

@Service()
export class CharacterDataService implements OnPlayerJoin, LogStart {
  public constructor(
    private readonly db: DatabaseService,
    private readonly character: CharacterService,
    private readonly characterHelper: CharacterHelper
  ) { }

  // *TEMP
  public onPlayerJoin(player: Player): void {
    const characters = this.getAll(player);
    if (!characters.isEmpty()) return;

    this.create(player, "Runic", School.Myth);
  }

  public getCurrent(player: Player): CharacterData {
    return this.db.get(player, `characters/${this.character.getCurrentIndex()}`);
  }

  public create(player: Player, name: string, school: PlayableSchool): CharacterData {
    const characters = this.getAll(player);
    const id = HTTP.GenerateGUID(USE_CURLY_BRACES_FOR_UUIDS);
    const character = { id, name, school, ...NEW_CHARACTER };
    this.characterHelper.trainFirstSpell(character);
    character.stats.health = DEFAULT_HEALTHS[school];
    characters.push(character);

    this.update(player, characters);
    return character;
  }

  public delete(player: Player, characterID: string): boolean {
    const characters = this.getAll(player);
    const character = characters.find(char => char.id === characterID);
    if (!isValidUUID(characterID, USE_CURLY_BRACES_FOR_UUIDS)) return false;
    if (!character) return false;

    characters.remove(characters.indexOf(character));
    this.update(player, characters);
    return true;
  }

  private update(player: Player, newCharacters: CharacterData[]): void {
    this.db.set(player, "characters", newCharacters);
  }

  private getAll(player: Player): CharacterData[] {
    return this.db.get(player, "characters", []);
  }
}