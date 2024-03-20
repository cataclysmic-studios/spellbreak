import { Service } from "@flamework/core";
import { HttpService as HTTP } from "@rbxts/services";

import type { OnPlayerJoin } from "server/hooks";
import type { LogStart } from "shared/hooks";
import type { CharacterData } from "shared/data-models/character-data";
import { School, type PlayableSchool } from "shared/data-models/school";
import { isValidUUID } from "shared/utility/helpers";
import NEW_CHARACTER from "shared/data-models/new-character";

import type { DatabaseService } from "./database";

const USE_CURLY_BRACES_FOR_UUIDS = true;
const DEFAULT_HEALTHS: Record<PlayableSchool, number> = {
  Fire: 415,
  Frost: 500,
  Storm: 400,
  Myth: 425,
  Life: 460,
  Death: 450,
  Balance: 480
};

@Service()
export class CharactersService implements OnPlayerJoin, LogStart {
  public constructor(
    private readonly db: DatabaseService
  ) {}

   // TEMP
  public onPlayerJoin(player: Player): void {
    const characters = this.getAll(player);
    if (!characters.isEmpty()) return;

    this.create(player, "Runic", School.Myth);
  }

  public create(player: Player, name: string, school: PlayableSchool): void {
    const characters = this.getAll(player);
    const id = HTTP.GenerateGUID(USE_CURLY_BRACES_FOR_UUIDS);
    const character = { id, name, school, ...NEW_CHARACTER };
    character.stats.health = DEFAULT_HEALTHS[school];
    characters.push(character);
    this.update(player, characters);
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