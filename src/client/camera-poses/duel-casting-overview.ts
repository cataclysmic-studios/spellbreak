import { CameraPoseKind } from "shared/structs/camera";
import { DuelCircleFacingPose } from "./duel-circle-facing";

import type { ClientDuelInfo } from "shared/structs/duel";

/** Sits hovered above this player's corner of the duel circle, looking at its center - holds here briefly once casting begins, before the camera cuts to focus on whoever casts first. */
export class DuelCastingOverviewPose extends DuelCircleFacingPose {
  public readonly kind = CameraPoseKind.DuelCastingOverview;
  protected readonly fov = 50;

  protected getLookTarget(info: ClientDuelInfo): Vector3 {
    return info.model.Root.Position;
  }
}
