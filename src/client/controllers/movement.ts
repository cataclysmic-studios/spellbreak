import { Controller, type OnPhysics } from "@flamework/core";
import { InputManager, StandardActionBuilder } from "@rbxts/mechanism";
import { Lazy } from "@rbxts/lazy";

import { Message } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { character } from "client/constants";
import Log from "shared/log";

const NO_Y = new Vector3(1, 0, 1);

// TODO: controller binds
const forwardAction = new StandardActionBuilder("W", "Up");
const backwardAction = new StandardActionBuilder("S", "Down");
const leftAction = new StandardActionBuilder("A", "Left");
const rightAction = new StandardActionBuilder("D", "Right");
const inputManager = new InputManager;
inputManager
  .bind(forwardAction)
  .bind(backwardAction)
  .bind(leftAction)
  .bind(rightAction);

@Controller()
export class MovementController implements OnPhysics {
  public walkSpeed = 18;
  public turnSpeed = 6;

  private readonly alignOrientation = new Lazy(() => {
    const alignOrientation = new Instance("AlignOrientation", character.collider);
    alignOrientation.RigidityEnabled = true;
    alignOrientation.ReactionTorqueEnabled = true;
    alignOrientation.Mode = Enum.OrientationAlignmentMode.OneAttachment;
    alignOrientation.Attachment0 = character.attachment;

    return alignOrientation;
  }).getValue();

  private enabled = true;
  private turnAngle = 0;

  public onPhysics(dt: number): void {
    this.updateOrientationAlignment();

    if (!this.enabled) return;
    const positionalInput = this.getPositionalInput();
    const turnInput = this.getTurnInput();
    const velocity = character.getCFrame().LookVector
      .mul(positionalInput * this.walkSpeed)
      .mul(NO_Y)

    character.setVelocity(velocity);
    this.turnAngle += turnInput * (this.turnSpeed / 3) * 60 * dt;
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
    if (this.alignOrientation === undefined) return;
    this.alignOrientation.CFrame = CFrame.Angles(math.rad(90), 0, math.rad(this.turnAngle));
  }

  private getTurnInput(): number {
    const left = leftAction.isActive ? -1 : 0;
    const right = rightAction.isActive ? 1 : 0;
    return left + right;
  }

  private getPositionalInput(): number {
    const forward = forwardAction.isActive ? 1 : 0;
    const backward = backwardAction.isActive ? -1 : 0;
    return forward + backward;
  }
}