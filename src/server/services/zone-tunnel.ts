import { Service } from "@flamework/core";
import { CollectionService } from "@rbxts/services";

import { ZoneTunnel } from "server/classes/zone-tunnel";
import { hasCompletedQuest, hasQuest } from "shared/utility/quests";
import Log from "shared/log";

import type { DatabaseService } from "./database";
import type { ZoneService } from "./zone";

const log = Log.scoped("zone tunnel service");
const TAG = "ZoneTunnel";
/** How far in front of the destination tunnel's collider (along its facing direction) to land the player, so they don't spawn inside the trigger and immediately bounce back. */
const ARRIVAL_OFFSET = 10;

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
    const character = this.database.getCharacter(player);
    if (tunnel.requiredQuestID !== undefined && !hasCompletedQuest(character, tunnel.requiredQuestID))
      return;

    if (
      tunnel.requiredActiveQuestID !== undefined
      && !hasQuest(character, tunnel.requiredActiveQuestID)
      && !hasCompletedQuest(character, tunnel.requiredActiveQuestID)
    )
      return;

    const destinationTunnel = this.tunnels.find(other => other.homeZoneID === tunnel.zoneID && other.zoneID === tunnel.homeZoneID);
    assert(destinationTunnel !== undefined, `no return ZoneTunnel found from zone ${tunnel.zoneID} back to zone ${tunnel.homeZoneID}`);

    const arrival = destinationTunnel.model.collider.CFrame.mul(new CFrame(0, 0, -ARRIVAL_OFFSET));
    this.zone.transferToZone(player, tunnel.zoneID, arrival);
  }
}
