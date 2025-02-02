import { Controller, OnStart, type OnPhysics } from "@flamework/core";
import { Lazy } from "@rbxts/lazy";
import { InputManager, StandardActionBuilder } from "@rbxts/mechanism";

import { character } from "client/constants";

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
export class MovementController implements OnStart, OnPhysics {
  private readonly walkSpeed = 16;
  private readonly turnSpeed = 5.5;
  private readonly alignOrientation = new Lazy(() => {
    const alignOrientation = new Instance("AlignOrientation", character.collider);
    alignOrientation.RigidityEnabled = true;
    alignOrientation.ReactionTorqueEnabled = true;
    alignOrientation.Mode = Enum.OrientationAlignmentMode.OneAttachment;
    alignOrientation.Attachment0 = character.attachment;

    return alignOrientation;
  }).getValue();

  private turnAngle = 0;
  public onStart(): void {
    this.updateOrientationAlignment();
  }

  public onPhysics(): void {
    this.updateOrientationAlignment();

    const positionalInput = this.getPositionalInput();
    const turnInput = this.getTurnInput();
    const velocity = character.getCFrame().LookVector.mul(positionalInput * this.walkSpeed);
    if (velocity.Magnitude === 0 && turnInput === 0) return;

    character.setLinearVelocity(velocity);
    this.turnAngle += turnInput * (this.turnSpeed / 10);
  }

  /**
   * Updates the orientation alignment such that the character is
   * always vertically aligned and can nevr tip over or roll
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