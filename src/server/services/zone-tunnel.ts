import { Service } from "@flamework/core";
import { CollectionService } from "@rbxts/services";

import { ZoneTunnel } from "server/classes/zone-tunnel";
import { hasCompletedQuest } from "shared/utility/quests";
import Log from "shared/log";

import type { DatabaseService } from "./database";
import type { ZoneService } from "./zone";

const log = Log.scoped("zone tunnel service");
const TAG = "ZoneTunnel";

@Service()
export class ZoneTunnelService {
  private readonly tunnels: ZoneTunnel[];

  public constructor(
    private readonly database: DatabaseService,
    private readonly zone: ZoneService
  ) {
    this.tunnels = CollectionService.GetTagged(TAG).map(instance => new ZoneTunnel(instance as TunnelModel));
    for (const tunnel of this.tunnels)
      tunnel.touchedByPlayer.Connect(player => this.onTouch(tunnel, player));

    log.info(`Found ${this.tunnels.size()} zone tunnels`);
  }

  private onTouch(tunnel: ZoneTunnel, player: Player): void {
    if (tunnel.requiredQuestID !== undefined && !hasCompletedQuest(this.database.getCharacter(player), tunnel.requiredQuestID))
      return;

    this.zone.transferToZone(player, tunnel.zoneID);
  }
}
