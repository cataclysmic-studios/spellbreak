import { Service } from "@flamework/core";

import { Message, messaging } from "shared/messaging";
import { getNpcsInZone } from "shared/utility/npc";
import { NPC } from "server/classes/npc";
import type { NpcID } from "shared/structs/npc/descriptor";
import type { ZoneID } from "shared/structs/zone";
import Log from "shared/log";

import type { ZoneService } from "./zone";

const log = Log.scoped("npc service");

@Service()
export class NpcService {
  private readonly spawned = new Map<NpcID, NPC>;

  public constructor(
    private readonly zone: ZoneService
  ) {
    this.zone.playerEnteredZone.Connect((player, zoneID) => this.onPlayerEnteredZone(player, zoneID));
    this.zone.playerLeftZone.Connect((player, zoneID) => this.onPlayerLeftZone(player, zoneID));
  }

  /** Spawns `zoneID`'s NPCs if they aren't already, then tells `player` to hydrate them - covers both a zone's first occupant and everyone arriving after. */
  private onPlayerEnteredZone(player: Player, zoneID: ZoneID): void {
    const descriptors = getNpcsInZone(zoneID);
    const ids = new Set<NpcID>;

    for (const descriptor of descriptors) {
      if (!this.spawned.has(descriptor.id)) {
        log.info(`Spawning NPC ${descriptor.name} into zone ${zoneID}`);
        this.spawned.set(descriptor.id, new NPC(descriptor));
      }

      ids.add(descriptor.id);
    }

    if (ids.size() > 0)
      messaging.client.emit(player, Message.Hydrate_NPCs, ids);
  }

  /** Tells `player` to drop their local NPC references for the zone they just left, then despawns the zone's NPCs server-wide once nobody's left in it. */
  private onPlayerLeftZone(player: Player, zoneID: ZoneID): void {
    const descriptors = getNpcsInZone(zoneID);
    if (descriptors.size() === 0) return;

    const ids = new Set<NpcID>;
    for (const descriptor of descriptors) ids.add(descriptor.id);
    messaging.client.emit(player, Message.Dehydrate_NPCs, ids);

    if (this.zone.getOccupantCount(zoneID) > 0) return;

    for (const descriptor of descriptors) {
      const npc = this.spawned.get(descriptor.id);
      if (npc === undefined) continue;

      log.info(`Despawning NPC ${descriptor.name} - zone ${zoneID} is empty`);
      npc.destroy();
      this.spawned.delete(descriptor.id);
    }
  }
}