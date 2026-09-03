import { CameraPoseKind } from "shared/structs/camera";
import { DuelCircleFacingPose } from "./duel-circle-facing";

import type { ClientDuelInfo } from "shared/structs/duel";

export class DuelPlanningPose extends DuelCircleFacingPose {
  public readonly kind = CameraPoseKind.DuelPlanning;
  protected readonly fov = 50;

  protected getLookTarget(info: ClientDuelInfo): Vector3 {
    return info.model.Root.Position;
  }
}
