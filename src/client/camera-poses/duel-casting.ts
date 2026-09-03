import { CameraPoseKind } from "shared/structs/camera";
import { DuelCirclePosition } from "shared/structs/duel";
import { getDuelCirclePositionPart } from "shared/utility/duel";
import { DuelCircleFacingPose } from "./duel-circle-facing";

import type { ClientDuelInfo } from "shared/structs/duel";

export class DuelCastingPose extends DuelCircleFacingPose {
  public readonly kind = CameraPoseKind.DuelCasting;
  protected readonly fov = 55;

  protected getLookTarget(info: ClientDuelInfo): Vector3 {
    const firstCasterPositions = info.firstTurnOnTeam ? info.model.teamPositions : info.model.opponentPositions;
    return getDuelCirclePositionPart(firstCasterPositions, DuelCirclePosition.First).Position;
  }
}
