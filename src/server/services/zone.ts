import { Service } from "@flamework/core";

import type { ZoneID } from "shared/structs/zone";
import Log from "shared/log";

import type { QuestService } from "./quest";

const log = Log.scoped("zone service");

@Service()
export class ZoneService {
  public constructor(
    private readonly quest: QuestService
  ) { }

  /**
   * The single entry point for "the player has been transferred into `zoneID`" - call this
   * from whatever actually moves the player between zones (a teleporter, an exit trigger, etc.)
   * once that's wired up. Advances any quest goal that was waiting on the player reaching this zone.
   */
  public transferToZone(player: Player, zoneID: ZoneID): void {
    log.info(`${player} transferred to zone ${zoneID}`);
    this.quest.onZoneEntered(player, zoneID);
  }
}
