import { Controller, type OnStart } from "@flamework/core";

import { assets } from "shared/constants";
import { playerGui } from "client/constants";

/** Ultimate fallback in case the page-flip animation never fires `Ended` - the load screen must never softlock the game. */
const PAGE_FLIP_TIMEOUT = 5;

@Controller()
export class LoadScreenController implements OnStart {
  private readonly loadScreen = playerGui.WaitForChild("LoadScreen") as PlayerGui["LoadScreen"];

  public constructor() {
    const { ViewportFrame } = this.loadScreen;
    ViewportFrame.AnchorPoint = new Vector2(0, 0);
    ViewportFrame.Position = UDim2.fromScale(0, 0);
    ViewportFrame.Size = UDim2.fromScale(1, 1);
  }

  public onStart(): void {
    if (!game.IsLoaded())
      game.Loaded.Wait();

    const hide = () => this.loadScreen.Enabled = false;
    const { Page } = this.loadScreen.ViewportFrame;
    const [loaded, track] = pcall(() => Page.AnimationController.Animator.LoadAnimation(assets.animations.pageFlip));
    if (!loaded) {
      hide();
      return;
    }

    track.Looped = false;
    track.Ended.Once(hide);
    task.delay(PAGE_FLIP_TIMEOUT, hide);
    track.Play();
  }
}
