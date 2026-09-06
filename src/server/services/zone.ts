import { Service } from "@flamework/core";
import Signal from "@rbxts/lemon-signal";
import Sift from "@rbxts/sift";

import { Message, messaging } from "shared/messaging";
import { cframeToLocation } from "shared/utility/character";
import type { ZoneID } from "shared/structs/zone";
import type { OnPlayerLeave } from "server/hooks/players";
import Log from "shared/log";

import type { CharacterService } from "./character";
import type { DatabaseService } from "./database";
import type { QuestService } from "./quest";

const log: ReturnType<typeof Log.scoped> = Log.scoped("zone service");
/** How long to wait for the client's transfer-cover ack before teleporting anyway - see `waitForTransferCoverReady`. */
const TRANSFER_COVER_TIMEOUT = 3;

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
    log.assert(zoneID !== undefined, `${player} has no tracked current zone`);
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
  public async transferToZone(player: Player, zoneID: ZoneID, destination: CFrame): Promise<void> {
    log.info(`${player} transferred to zone ${zoneID}`);
    messaging.client.emit(player, Message.Zone_Transferring, zoneID);
    await this.waitForTransferCoverReady(player, zoneID);
    this.character.teleportTo(player, destination);
    this.setCurrentZone(player, zoneID, true, destination);
    this.quest.onZoneEntered(player, zoneID);
  }

  /**
   * `Zone_Transferring` is tether-batched (up to ~42ms) while the teleport itself is a raw,
   * unbatched property write - without this, the character's new position can reach the client
   * before the message telling it to show the load screen does, so the player briefly sees
   * themselves pop into the new zone before the cover animation appears. Waiting for the client's
   * ack (sent the instant it starts the cover animation, not once it finishes - see
   * `LoadScreenController.onZoneTransferring`) guarantees the ordering regardless of network
   * timing. Falls back to a fixed delay if the ack never arrives (dropped message, client stuck)
   * so a transfer can never hang forever.
   */
  private waitForTransferCoverReady(player: Player, zoneID: ZoneID): Promise<void> {
    return new Promise(resolve => {
      let disconnect: () => void;
      const finish = () => {
        disconnect();
        resolve();
      };

      disconnect = messaging.server.on(Message.Zone_TransferCoverReady, (ackPlayer, ackZoneID) => {
        if (ackPlayer !== player || ackZoneID !== zoneID) return;
        finish();
      });

      task.delay(TRANSFER_COVER_TIMEOUT, finish);
    });
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

  /**
   * `destination` is only passed for an actual physical transfer (see {@link transferToZone}) so
   * `lastLocation` gets persisted alongside `currentZone` in the same write - otherwise a save
   * that ends before the next clean `onPlayerLeave` (e.g. Studio's Stop button) leaves the two
   * out of sync: `currentZone` points at the new zone but the character reloads at the old
   * `lastLocation`, which then never streams in for that zone.
   */
  private setCurrentZone(player: Player, zoneID: ZoneID, persist = true, destination?: CFrame): void {
    const previousZoneID = this.currentZones.get(player);
    this.currentZones.set(player, zoneID);
    messaging.client.emit(player, Message.Zone_Entered, zoneID);

    if (persist)
      this.database.updateCharacter(player, character => Sift.Dictionary.merge(character, {
        currentZone: zoneID,
        ...(destination !== undefined ? { lastLocation: cframeToLocation(destination) } : {})
      }));

    if (previousZoneID !== undefined && previousZoneID !== zoneID)
      this.playerLeftZone.Fire(player, previousZoneID);

    this.playerEnteredZone.Fire(player, zoneID);
  }
}
