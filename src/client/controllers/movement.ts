import { Controller, type OnPhysics } from "@flamework/core";

import { Message } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { character } from "client/constants";
import Log from "shared/log";

import type { InputController } from "./input";
import { XZ } from "shared/constants";

const { rad } = math;
const angles = CFrame.Angles

// Below this, a velocity/turn delta is physics jitter, not real motion - writing it back
// would keep the character's assembly permanently "awake" (see `updateVelocity`).
const REST_EPSILON = 0.01;

@Controller()
export class MovementController implements OnPhysics {
  public walkSpeed = 18;
  public turnSpeed = 6;

  private readonly alignOrientation: AlignOrientation;
  private enabled = true;
  private turnAngle = 0;
  private lastAppliedTurnAngle = 0;

  public constructor(
    private readonly input: InputController
  ) {
    const alignOrientation = new Instance("AlignOrientation", character.collider);
    alignOrientation.RigidityEnabled = true;
    alignOrientation.ReactionTorqueEnabled = true;
    alignOrientation.Mode = Enum.OrientationAlignmentMode.OneAttachment;
    alignOrientation.Attachment0 = character.attachment;
    this.alignOrientation = alignOrientation;
  }

  public onPhysics(dt: number): void {
    if (!this.enabled) return;

    const [x, y] = this.input.getInputVector();
    this.turnAngle += x * (this.turnSpeed / 3) * 60 * dt;
    this.updateOrientationAlignment();
    this.updateVelocity(y);
  }

  @OnClientMessage(Message.Movement_Toggle)
  public toggleMovement(on: boolean): void {
    Log.info("Movement toggled " + (on ? "on" : "off"));
    this.enabled = on;

    // RigidityEnabled means this constraint actively fights any orientation it doesn't own -
    // disabling it here too is what lets server-driven rotation (e.g. facing into a duel
    // position) actually stick while movement is off, instead of snapping back every frame.
    this.alignOrientation.Enabled = on;
  }

  // Only drive horizontal movement here - forcing Y to 0 every step would fight gravity's own
  // velocity accumulation (this runs on Stepped, right before physics simulates), so an airborne
  // character (e.g. right after a zone tunnel teleport) would sink at a fraction of its real
  // fall speed instead of dropping normally.
  //
  // Compares against the collider's actual current velocity (not a cached target) and skips the
  // write when it's already within `REST_EPSILON` of where we want it - writing
  // `AssemblyLinearVelocity` every physics step, even to an unchanged value, keeps the assembly
  // permanently "awake", so an idle player never stops reporting velocity state to the server.
  private updateVelocity(verticalInput: number): void {
    const targetVelocity = character.getCFrame().LookVector
      .mul(verticalInput * this.walkSpeed)
      .mul(XZ);

    const currentVelocity = character.getVelocity();
    if (
      math.abs(currentVelocity.X - targetVelocity.X) < REST_EPSILON
      && math.abs(currentVelocity.Z - targetVelocity.Z) < REST_EPSILON
    ) return;

    character.setVelocity(new Vector3(targetVelocity.X, currentVelocity.Y, targetVelocity.Z));
  }

  /**
   * Updates the orientation alignment such that the character is
   * always vertically aligned and can never tip over or roll
   */
  private updateOrientationAlignment(): void {
    if (this.turnAngle === this.lastAppliedTurnAngle) return;
    this.lastAppliedTurnAngle = this.turnAngle;
    this.alignOrientation.CFrame = angles(rad(90), 0, rad(this.turnAngle));
  }
}