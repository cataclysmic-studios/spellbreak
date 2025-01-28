export class Character<Model extends CharacterModel = CharacterModel> {
  public constructor(
    public readonly model: Model
  ) { }

  public setLinearVelocity(velocity: Vector3): void {
    this.model.Collider.AssemblyLinearVelocity = velocity;
  }
}