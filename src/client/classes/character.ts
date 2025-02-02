import { ForceMode } from "shared/structs/force-mode";

export class Character<TModel extends CharacterModel = CharacterModel> {
  public readonly collider: TModel["Collider"];
  public readonly attachment: Attachment;

  public constructor(
    private readonly model: TModel
  ) {
    this.collider = model.WaitForChild("Collider");
    this.attachment = new Instance("Attachment", this.collider);
    this.attachment.Orientation = new Vector3(90, 0, 0);
  }

  public isAlive(): boolean {
    return this.model !== undefined && this.model.PrimaryPart !== undefined;
  }

  public getCFrame(): CFrame {
    return this.collider.CFrame;
  }

  public setCFrame(cframe: CFrame): void {
    this.model.Collider.CFrame = cframe;
  }

  public applyForce(force: Vector3, forceMode = ForceMode.Velocity): void {
    switch (forceMode) {
      case ForceMode.Impulse:
        return this.addLinearImpulse(force);
      case ForceMode.Velocity:
        return this.addLinearVelocity(force);
    }
  }

  public applyTorque(force: Vector3, forceMode = ForceMode.Velocity): void {
    switch (forceMode) {
      case ForceMode.Impulse:
        return this.addAngularImpulse(force);
      case ForceMode.Velocity:
        return this.addAngularVelocity(force);
    }
  }

  public getLinearVelocity(): Vector3 {
    return this.model.Collider.AssemblyLinearVelocity;
  }

  public setLinearVelocity(velocity: Vector3): void {
    this.model.Collider.AssemblyLinearVelocity = velocity;
  }

  public getAngularVelocity(): Vector3 {
    return this.model.Collider.AssemblyAngularVelocity;
  }

  public setAngularVelocity(velocity: Vector3): void {
    this.model.Collider.AssemblyAngularVelocity = velocity;
  }

  private addAngularImpulse(impulse: Vector3): void {
    this.model.Collider.ApplyAngularImpulse(impulse);
  }

  private addAngularVelocity(velocity: Vector3): void {
    this.setAngularVelocity(this.getAngularVelocity().add(velocity));
  }

  private addLinearImpulse(impulse: Vector3): void {
    this.model.Collider.ApplyImpulse(impulse);
  }

  private addLinearVelocity(velocity: Vector3): void {
    this.setLinearVelocity(this.getLinearVelocity().add(velocity));
  }
}