import { Janitor } from "@rbxts/janitor";

export abstract class Destroyable {
  protected readonly janitor = new Janitor;
  protected destroyed = false;

  public destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.janitor.Destroy();
  }
}