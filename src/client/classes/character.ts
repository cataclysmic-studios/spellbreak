export class Character<Model extends CharacterModel = CharacterModel> {
  public constructor(
    public readonly model: Model
  ) { }

  public getCFrame(): CFrame {
    return this.model.Collider.CFrame;
  }

  public setCFrame(cframe: CFrame): void {
    this.model.Collider.CFrame = cframe;
  }

  public setLinearVelocity(velocity: Vector3): void {
    this.model.Collider.AssemblyLinearVelocity = velocity;
  }
}