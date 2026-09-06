import { Service, type OnTick } from "@flamework/core";
import { CollectionService, Players } from "@rbxts/services";

import { ZoneTunnel } from "server/classes/zone-tunnel";
import { hasCompletedQuest, hasQuest } from "shared/utility/quests";
import type { OnPlayerLeave } from "server/hooks/players";
import Log from "shared/log";

import type { DatabaseService } from "./database";
import type { ZoneService } from "./zone";

const log: ReturnType<typeof Log.scoped> = Log.scoped("zone tunnel service");
const TAG = "ZoneTunnel";
/** How far in front of the destination tunnel's collider (along its facing direction) to land the player, so they don't spawn inside the trigger and immediately bounce back. */
const ARRIVAL_OFFSET = 10;
/** How close a player has to walk to a tunnel before its destination is worth pre-streaming - see `prefetchNearbyDestinations`. */
const PREFETCH_RADIUS = 60;

@Service()
export class ZoneTunnelService implements OnTick, OnPlayerLeave {
  private readonly tunnels: ZoneTunnel[];
  private readonly prefetchedFor = new Map<Player, Set<ZoneTunnel>>();

  public constructor(
    private readonly database: DatabaseService,
    private readonly zone: ZoneService
  ) {
    this.tunnels = CollectionService.GetTagged(TAG).map(instance => new ZoneTunnel(instance as TunnelModel));
    for (const tunnel of this.tunnels)
      tunnel.touchedByPlayer.Connect(player => this.onTouch(tunnel, player));

    log.info(`Found ${this.tunnels.size()} zone tunnels`);
  }

  public onPlayerLeave(player: Player): void {
    this.prefetchedFor.delete(player);
  }

  // Streaming the destination zone's content only starts once `teleportTo` requests it at the
  // exact moment of transfer, which is a real one-time burst (see `CharacterService.teleportTo`).
  // Since a tunnel's destination is known well before the player actually touches it, start that
  // same request as soon as they're within `PREFETCH_RADIUS` of the tunnel - by the time they
  // actually cross it, most or all of the destination should already be resident, so the burst
  // lands while they're still walking over instead of all at once at the transfer.
  public onTick(): void {
    for (const player of Players.GetPlayers()) {
      const root = player.Character?.PrimaryPart;
      if (root === undefined) continue;

      const prefetched = this.prefetchedFor.get(player);
      for (const tunnel of this.tunnels) {
        if (prefetched?.has(tunnel)) continue;
        if (root.Position.sub(tunnel.model.collider.Position).Magnitude > PREFETCH_RADIUS) continue;

        this.markPrefetched(player, tunnel);
        const arrival = this.getArrivalCFrame(tunnel);
        task.spawn(() => player.RequestStreamAroundAsync(arrival.Position));
      }
    }
  }

  private onTouch(tunnel: ZoneTunnel, player: Player): void {
    const character = this.database.getCharacter(player);
    if (tunnel.requiredQuestID !== undefined && !hasCompletedQuest(character, tunnel.requiredQuestID))
      return;

    if (
      tunnel.requiredActiveQuestID !== undefined
      && !hasQuest(character, tunnel.requiredActiveQuestID)
      && !hasCompletedQuest(character, tunnel.requiredActiveQuestID)
    )
      return;

    const arrival = this.getArrivalCFrame(tunnel);
    this.zone.transferToZone(player, tunnel.zoneID, arrival);
  }

  private getArrivalCFrame(tunnel: ZoneTunnel): CFrame {
    const destinationTunnel = this.tunnels.find(other => other.homeZoneID === tunnel.zoneID && other.zoneID === tunnel.homeZoneID);
    log.assert(destinationTunnel !== undefined, `no return ZoneTunnel found from zone ${tunnel.zoneID} back to zone ${tunnel.homeZoneID}`);

    return destinationTunnel.model.collider.CFrame.mul(new CFrame(0, 0, -ARRIVAL_OFFSET));
  }

  private markPrefetched(player: Player, tunnel: ZoneTunnel): void {
    const existing = this.prefetchedFor.get(player);
    if (existing !== undefined) {
      existing.add(tunnel);
      return;
    }

    this.prefetchedFor.set(player, new Set([tunnel]));
  }
}
