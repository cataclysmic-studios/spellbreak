import { Controller, type OnStart } from "@flamework/core";
import { InputManager, StandardActionBuilder } from "@rbxts/mechanism";

@Controller()
export class InputController implements OnStart {
  public readonly actions = {
    // TODO: controller binds
    forward: new StandardActionBuilder("W", "Up"),
    backward: new StandardActionBuilder("S", "Down"),
    left: new StandardActionBuilder("A", "Left"),
    right: new StandardActionBuilder("D", "Right"),

    interact: new StandardActionBuilder("X", "ButtonX")
  }

  private readonly manager = new InputManager;

  public onStart(): void {
    for (const [_, action] of pairs(this.actions))
      this.manager.bind(action);
  }

  public getInputVector(): LuaTuple<[number, number]> {
    return $tuple(this.getHorizontalInput(), this.getVerticalInput());
  }

  private getHorizontalInput(): number {
    const left = this.actions.left.isActive ? -1 : 0;
    const right = this.actions.right.isActive ? 1 : 0;
    return left + right;
  }

  private getVerticalInput(): number {
    const forward = this.actions.forward.isActive ? 1 : 0;
    const backward = this.actions.backward.isActive ? -1 : 0;
    return forward + backward;
  }
}