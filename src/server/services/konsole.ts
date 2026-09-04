import { Service } from "@flamework/core";
import Konsole = require("@kyrorblx/konsole");

import { findZoneIDByName, getZoneByID, getZoneSpawn } from "shared/utility/zone";
import { ALL_ZONE_IDS, ZoneID } from "shared/structs/zone";
import Log from "shared/log";

import type { ZoneService } from "./zone";

const log = Log.scoped("konsole service");

@Service()
export class KonsoleService {
  public constructor(private readonly zone: ZoneService) {
    Konsole.define({
      name: "zone",
      rank: 50,
      aliases: ["tpzone", "gotozone"],
      description: "Teleports you to a zone's spawn point.",
      server: "teleportToZoneServer",
      args: [
        {
          name: "zone",
          type: "string",
          required: true,
          suggestions: ALL_ZONE_IDS.map(id => ZoneID[id])
        }
      ]
    });

    Konsole.host({
      teleportToZoneServer: (context, zoneNameArg) => {
        const player = context.entity;
        if (player === undefined) return context.err("no-caller", "No calling player.");

        const zoneName = zoneNameArg as string;
        const zoneID = findZoneIDByName(zoneName);
        if (zoneID === undefined) return context.err("unknown-zone", `Unknown zone "${zoneName}".`);

        this.zone.transferToZone(player, zoneID, getZoneSpawn(zoneID));
        return context.reply(`Teleported to ${getZoneByID(zoneID).name}.`);
      }
    });

    log.info("Registered zone teleport command");
  }
}
