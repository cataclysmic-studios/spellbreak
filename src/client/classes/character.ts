export class Character<TModel extends CharacterModel = CharacterModel> {
  public readonly collider: TModel["collider"];
  public readonly attachment: Attachment;

  public constructor(
    private readonly model: TModel
  ) {
    this.collider = model.WaitForChild("collider");
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
    this.collider.CFrame = cframe;
  }

  public getVelocity(): Vector3 {
    return this.collider.AssemblyLinearVelocity;
  }

  public setVelocity(velocity: Vector3): void {
    this.collider.AssemblyLinearVelocity = velocity;
  }
}