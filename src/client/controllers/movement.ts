import { Controller, type OnPhysics } from "@flamework/core";

import { Message } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { character } from "client/constants";
import Log from "shared/log";

import type { InputController } from "./input";
import { XZ } from "shared/constants";

const { rad } = math;
const angles = CFrame.Angles

@Controller()
export class MovementController implements OnPhysics {
  public walkSpeed = 18;
  public turnSpeed = 6;

  private readonly alignOrientation: AlignOrientation;
  private enabled = true;
  private turnAngle = 0;

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
    this.updateOrientationAlignment();

    const [x, y] = this.input.getInputVector();
    const velocity = character.getCFrame().LookVector
      .mul(y * this.walkSpeed)
      .mul(XZ);

    // Only drive horizontal movement here - forcing Y to 0 every step would fight gravity's
    // own velocity accumulation (this runs on Stepped, right before physics simulates), so
    // an airborne character (e.g. right after a zone tunnel teleport) would sink at a fraction
    // of its real fall speed instead of dropping normally.
    character.setVelocity(new Vector3(velocity.X, character.getVelocity().Y, velocity.Z));
    this.turnAngle += x * (this.turnSpeed / 3) * 60 * dt;
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

  /**
   * Updates the orientation alignment such that the character is
   * always vertically aligned and can never tip over or roll
   */
  private updateOrientationAlignment(): void {
    const { alignOrientation } = this;
    if (alignOrientation === undefined) return;
    alignOrientation.CFrame = angles(rad(90), 0, rad(this.turnAngle));
  }
}