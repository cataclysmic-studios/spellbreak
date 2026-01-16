import { Service } from "@flamework/core";
import { createCollection, type Document } from "@rbxts/lapis";
import { $nameof } from "rbxts-transform-debug";
import Signal from "@rbxts/lemon-signal";

import { Message, messaging } from "shared/messaging";
import { createDiff, fixNumericKeys, updateCharacter } from "shared/utility/data";
import { defaultData } from "shared/constants";
import type { OnPlayerJoin, OnPlayerLeave } from "server/hooks/players";
import type { CharacterData, PlayerData } from "shared/structs/data";
import Log from "shared/log";

import type { CharacterService } from "./character";

type PlayerDataDocument = Document<PlayerData>;

const VERSION = 18;

@Service()
export class DatabaseService implements OnPlayerJoin, OnPlayerLeave {
  public readonly dataLoaded = new Signal<(player: Player) => void>;

  private readonly documents = new Map<Player, PlayerDataDocument>;
  private readonly collection = createCollection($nameof<PlayerData>(), { defaultData });

  public constructor(
    private readonly character: CharacterService
  ) { }

  public async onPlayerJoin(player: Player): Promise<void> {
    const id = player.UserId;
    const document = await this.collection
      .load(`Player${id}_${VERSION}`, [id])
      .catch(() => player.Kick("Data failed to load."));

    if (!document) return;
    if (!player.Parent)
      return await document.close();

    this.documents.set(player, document);
    const oldData = document.read();
    this.sendDiffToClient(player, {} as never, oldData);
    this.dataLoaded.Fire(player);
    Log.info(`Loaded player data for ${player.Name}`);
  }

  public async onPlayerLeave(player: Player): Promise<void> {
    const document = this.documents.get(player);
    if (!document) return;

    this.documents.delete(player);
    await document.close();
  }

  public getCharacter(player: Player): CharacterData {
    return this.get(player).characters[this.character.getSelected()];
  }

  public get(player: Player, document = this.getDocument(player)): PlayerData {
    return fixNumericKeys(document.read());
  }

  public async updateCharacter(player: Player, transform: (data: Readonly<CharacterData>) => CharacterData): Promise<void> {
    const characterIndex = this.character.getSelected();
    await this.update(player, data =>
      updateCharacter(data, characterIndex, transform(data.characters[characterIndex]))
    );
  }

  public async update(player: Player, transform: (data: Readonly<PlayerData>) => PlayerData): Promise<void> {
    const document = this.getDocument(player);
    const oldData = this.get(player, document);
    const newData = fixNumericKeys(transform(oldData));
    this.sendDiffToClient(player, oldData, newData);

    document.write(newData);
    await document.save();
  }

  private sendDiffToClient(player: Player, oldData: PlayerData, newData: PlayerData): void {
    messaging.client.emit(player, Message.Data_Updated, fixNumericKeys(createDiff(oldData, newData)));
  }

  private getDocument(player: Player): PlayerDataDocument {
    const document = this.documents.get(player);
    assert(document !== undefined, "Player data document not yet loaded.");
    return document;
  }
}