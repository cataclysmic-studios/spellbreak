import { Service } from "@flamework/core";
import { HttpService as HTTP } from "@rbxts/services";

import type { OnPlayerJoin } from "server/hooks";
import type { LogStart } from "shared/hooks";
import type { CharacterData } from "shared/data-models/character-data";
import { isValidUUID } from "shared/utility/strings";
import { School, type PlayableSchool } from "shared/data-models/school";
import type Deck from "shared/data-models/items/deck";
import NEW_CHARACTER from "shared/default-structs/new-character";

import type SpellHelper from "shared/helpers/spell";
import type { DatabaseService } from "./third-party/database";

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
    private readonly db: DatabaseService,
    private readonly spellHelper: SpellHelper
  ) { }

  // *TEMP
  public onPlayerJoin(player: Player): void {
    const characters = this.getAll(player);
    if (!characters.isEmpty()) return;

    this.create(player, "Runic", School.Myth);
  }

  public create(player: Player, name: string, school: PlayableSchool): void {
    const characters = this.getAll(player);
    const id = HTTP.GenerateGUID(USE_CURLY_BRACES_FOR_UUIDS);
    const character = { id, name, school, ...NEW_CHARACTER };
    const characterDeck = this.getEquippedDeck(character);
    character.stats.health = DEFAULT_HEALTHS[school];
    characterDeck?.addSpell(this.spellHelper.getFirstSpell(school));
    character.equippedGear.Deck = characterDeck;
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

  public getEquippedDeck(character: CharacterData): Maybe<Deck> {
    return <Maybe<Deck>>character.equippedGear.Deck;
  }

  private update(player: Player, newCharacters: CharacterData[]): void {
    this.db.set(player, "characters", newCharacters);
  }

  private getAll(player: Player): CharacterData[] {
    return this.db.get(player, "characters", []);
  }
}