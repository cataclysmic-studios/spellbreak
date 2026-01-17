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
    this.updateOrientationAlignment();

    if (!this.enabled) return;
    const [x, y] = this.input.getInputVector();
    const velocity = character.getCFrame().LookVector
      .mul(y * this.walkSpeed)
      .mul(XZ);

    character.setVelocity(velocity);
    this.turnAngle += x * (this.turnSpeed / 3) * 60 * dt;
  }

  @OnClientMessage(Message.Movement_Toggle)
  public toggleMovement(on: boolean): void {
    Log.info("Movement toggled " + (on ? "on" : "off"));
    this.enabled = on;
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