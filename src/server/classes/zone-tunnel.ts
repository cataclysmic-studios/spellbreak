import { Players } from "@rbxts/services";
import Signal from "@rbxts/lemon-signal";

import { getZoneIDByName, getZoneOfInstance } from "shared/utility/zone";
import { getQuestIDByName } from "shared/utility/quests";
import type { QuestID } from "shared/structs/quests";
import type { ZoneID } from "shared/structs/zone";
import Log from "shared/log";

const log: ReturnType<typeof Log.scoped> = Log.scoped("zone tunnel");
/** A character has several body parts that can each independently touch the collider within the same crossing, so debounce by time rather than by touch state. */
const DEBOUNCE_SECONDS = 2;

export class ZoneTunnel {
  public readonly zoneID: ZoneID;
  /** The zone this tunnel is physically parented under, i.e. the zone it's the *exit* of. */
  public readonly homeZoneID: ZoneID;
  public readonly requiredQuestID?: QuestID;
  /** Unlike `requiredQuestID` (which demands full completion), this only demands the quest be picked up - e.g. gating an NPC's own room shut until you've taken the quest they hand you. */
  public readonly requiredActiveQuestID?: QuestID;
  /** Fires whenever a player touches this tunnel's collider, regardless of whether their gate is open. */
  public readonly touchedByPlayer = new Signal<(player: Player) => void>;

  private readonly debounced = new Set<Player>;

  /** `ZoneID`/`RequiredQuestID`/`RequiredActiveQuestID` are set in Studio as the *name* of the enum member (e.g. "PegasusLane"), not its numeric value. */
  public constructor(public readonly model: TunnelModel) {
    const zoneName = model.GetAttribute<string>("ZoneID");
    log.assert(zoneName !== undefined, `ZoneTunnel @ ${model.GetFullName()} is missing a "ZoneID" attribute`);

    this.zoneID = getZoneIDByName(zoneName);
    this.homeZoneID = getZoneOfInstance(model);

    const questName = model.GetAttribute<string>("RequiredQuestID");
    this.requiredQuestID = questName !== undefined ? getQuestIDByName(questName) : undefined;

    const activeQuestName = model.GetAttribute<string>("RequiredActiveQuestID");
    this.requiredActiveQuestID = activeQuestName !== undefined ? getQuestIDByName(activeQuestName) : undefined;

    this.registerTouch();
  }

  private registerTouch(): void {
    this.model.collider.Touched.Connect(hit => {
      const player = Players.GetPlayerFromCharacter(hit.FindFirstAncestorOfClass("Model"));
      if (player === undefined || this.debounced.has(player)) return;

      this.debounced.add(player);
      task.delay(DEBOUNCE_SECONDS, () => this.debounced.delete(player));

      this.touchedByPlayer.Fire(player);
    });
  }
}
