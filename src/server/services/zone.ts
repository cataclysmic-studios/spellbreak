import { Service } from "@flamework/core";
import Signal from "@rbxts/lemon-signal";
import Sift from "@rbxts/sift";

import { Message, messaging } from "shared/messaging";
import type { ZoneID } from "shared/structs/zone";
import type { OnPlayerLeave } from "server/hooks/players";
import Log from "shared/log";

import type { CharacterService } from "./character";
import type { DatabaseService } from "./database";
import type { QuestService } from "./quest";

const log = Log.scoped("zone service");

@Service()
export class ZoneService implements OnPlayerLeave {
  /** Fires whenever a player's current zone changes, including their very first zone on join. */
  public readonly playerEnteredZone = new Signal<(player: Player, zoneID: ZoneID) => void>;
  /** Fires whenever a player stops being in a zone, either by transferring out of it or leaving the game. */
  public readonly playerLeftZone = new Signal<(player: Player, zoneID: ZoneID) => void>;

  private readonly currentZones = new Map<Player, ZoneID>;

  public constructor(
    private readonly character: CharacterService,
    private readonly database: DatabaseService,
    private readonly quest: QuestService
  ) {
    this.database.dataLoaded.Connect(player =>
      this.setCurrentZone(player, this.database.getCharacter(player).currentZone, false)
    );
    messaging.server.on(Message.Client_Ready, player => this.onClientReady(player));
  }

  public onPlayerLeave(player: Player): void {
    const zoneID = this.currentZones.get(player);
    this.currentZones.delete(player);
    if (zoneID !== undefined) this.playerLeftZone.Fire(player, zoneID);
  }

  public getCurrentZone(player: Player): ZoneID {
    const zoneID = this.currentZones.get(player);
    assert(zoneID !== undefined, `${player} has no tracked current zone`);
    return zoneID;
  }

  public getOccupantCount(zoneID: ZoneID): number {
    let count = 0;
    for (const [, occupiedZoneID] of this.currentZones)
      if (occupiedZoneID === zoneID) count++;

    return count;
  }

  /**
   * The single entry point for "the player has been transferred into `zoneID`" - call this
   * from whatever actually moves the player between zones (a teleporter, an exit trigger, etc.)
   * Teleports the player to `destination` and advances any quest goal that was waiting on them
   * reaching this zone.
   */
  public transferToZone(player: Player, zoneID: ZoneID, destination: CFrame): void {
    log.info(`${player} transferred to zone ${zoneID}`);
    messaging.client.emit(player, Message.Zone_Transferring, zoneID);
    this.character.teleportTo(player, destination);
    this.setCurrentZone(player, zoneID);
    this.quest.onZoneEntered(player, zoneID);
  }

  /**
   * The player's zone can be decided before their client has finished registering its
   * OnClientMessage listeners (Zone_Entered fires as soon as their save data loads, which races
   * Flamework's client bootstrap) - if that already happened, resend it now that we know the
   * client is actually listening. Re-firing `playerEnteredZone` this way also lets other services
   * (e.g. NpcService) resend whatever per-player state they'd have missed the first time, since
   * both handlers are idempotent. See client/main.client.ts for the other half of this handshake.
   */
  private onClientReady(player: Player): void {
    const zoneID = this.currentZones.get(player);
    if (zoneID !== undefined)
      this.setCurrentZone(player, zoneID, false);
  }

  private setCurrentZone(player: Player, zoneID: ZoneID, persist = true): void {
    const previousZoneID = this.currentZones.get(player);
    this.currentZones.set(player, zoneID);
    messaging.client.emit(player, Message.Zone_Entered, zoneID);

    if (persist)
      this.database.updateCharacter(player, character => Sift.Dictionary.merge(character, { currentZone: zoneID }));

    if (previousZoneID !== undefined && previousZoneID !== zoneID)
      this.playerLeftZone.Fire(player, previousZoneID);

    this.playerEnteredZone.Fire(player, zoneID);
  }
}
