import { Service } from "@flamework/core";
import { createCollection, type Document } from "@rbxts/lapis";
import { $nameof } from "rbxts-transform-debug";
import Signal from "@rbxts/lemon-signal";
import Sift from "@rbxts/sift";

import { Message, messaging, type MessageData } from "shared/messaging";
import { createDiff, fixNumericKeys, updateCharacter } from "shared/utility/data";
import { cframeToLocation, locationToCFrame } from "shared/utility/character";
import { defaultData } from "shared/constants";
import type { OnPlayerJoin, OnPlayerLeave } from "server/hooks/players";
import type { CharacterData, PlayerData } from "shared/structs/data";
import Log from "shared/log";

import type { CharacterService } from "./character";

type PlayerDataDocument = Document<PlayerData>;

const VERSION = 21;

@Service()
export class DatabaseService implements OnPlayerJoin, OnPlayerLeave {
  public readonly dataLoaded = new Signal<(player: Player) => void>;

  private readonly documents = new Map<Player, PlayerDataDocument>;
  private readonly clientsReady = new Set<Player>;
  private readonly collection = createCollection($nameof<PlayerData>(), { defaultData });

  public constructor(
    private readonly character: CharacterService
  ) {
    messaging.server.on(Message.Client_Ready, player => this.onClientReady(player));
  }

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
    const character = fixNumericKeys(oldData).characters[this.character.getSelected()];
    this.character.load(player, "roslyn", locationToCFrame(character.lastLocation));

    if (this.clientsReady.has(player))
      this.sendDiffToClient(player, {} as never, oldData);
    this.dataLoaded.Fire(player);
    Log.info(`Loaded player data for ${player.Name}`);
  }

  public async onPlayerLeave(player: Player): Promise<void> {
    this.clientsReady.delete(player);

    const document = this.documents.get(player);
    if (!document) return;

    const root = player.Character?.PrimaryPart;
    if (root !== undefined)
      await this.updateCharacter(player, character => Sift.Dictionary.merge(character, {
        lastLocation: cframeToLocation(root.CFrame)
      }));

    this.documents.delete(player);
    await document.close();
  }

  /**
   * The client's initial data send races the DataStore load against the client's own
   * bootstrap (Flamework ignite, listener registration). Whichever finishes last is
   * responsible for sending the snapshot, so neither order drops it.
   */
  private onClientReady(player: Player): void {
    this.clientsReady.add(player);

    const document = this.documents.get(player);
    if (document)
      this.sendDiffToClient(player, {} as never, this.get(player, document));
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
    // activeQuests is a plain dictionary at runtime; it's only typed as a serio HashMap
    // over the wire since the transformer can't otherwise expand its dynamic key set.
    const diff = fixNumericKeys(createDiff(oldData, newData)) as unknown as MessageData[Message.Data_Updated];
    messaging.client.emit(player, Message.Data_Updated, diff);
  }

  private getDocument(player: Player): PlayerDataDocument {
    const document = this.documents.get(player);
    Log.assert(document !== undefined, "Player data document not yet loaded.");
    return document;
  }
}