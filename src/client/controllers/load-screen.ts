import { Controller, type OnStart } from "@flamework/core";

import { Message } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { assets } from "shared/constants";
import { playerGui } from "client/constants";

/** Ultimate fallback in case the page-flip animation never fires `Ended` - the load screen must never softlock the game. */
const PAGE_FLIP_TIMEOUT = 5;

interface BoneRestState {
  readonly bone: Bone;
  readonly localPosition: Vector3;
}

@Controller()
export class LoadScreenController implements OnStart {
  private readonly loadScreen = playerGui.WaitForChild("LoadScreen") as PlayerGui["LoadScreen"];
  private readonly page = this.loadScreen.ViewportFrame.Page;
  private readonly frontSide = this.page.FindFirstChild<MeshPart>("Page_FrontSide")!;
  private readonly backSide = this.page.FindFirstChild<MeshPart>("Page_BackSide")!;
  private readonly originalWidth = this.frontSide.Size.X;
  private readonly originalHeight = this.frontSide.Size.Z;
  private readonly boneRestStates: BoneRestState[] = [];

  public constructor() {
    const { ViewportFrame } = this.loadScreen;
    ViewportFrame.AnchorPoint = new Vector2(0, 0);
    ViewportFrame.Position = UDim2.fromScale(0, 0);
    ViewportFrame.Size = UDim2.fromScale(1, 1);

    this.captureBoneRestStates();
    this.updateAspectRatio(ViewportFrame.AbsoluteSize);
    ViewportFrame.GetPropertyChangedSignal("AbsoluteSize").Connect(() =>
      this.updateAspectRatio(ViewportFrame.AbsoluteSize)
    );
  }

  public onStart(): void {
    if (!game.IsLoaded())
      game.Loaded.Wait();

    this.play();
  }

  /** @hidden */
  @OnClientMessage(Message.Zone_Transferring)
  public onZoneTransferring(): void {
    this.loadScreen.Enabled = true;
    this.play();
  }

  private play(): void {
    const hide = () => this.loadScreen.Enabled = false;
    const [loaded, track] = pcall(() => this.page.AnimationController.Animator.LoadAnimation(assets.animations.pageFlip));
    if (!loaded) {
      hide();
      return;
    }

    track.Looped = false;
    track.Ended.Once(hide);
    task.delay(PAGE_FLIP_TIMEOUT, hide);
    track.Play();
  }

  /** Records each bend bone's rest position relative to `Page_FrontSide`'s CFrame so every resize starts from the original rig instead of compounding onto an already-scaled one. */
  private captureBoneRestStates(): void {
    const accumulationRoot = this.page.FindFirstChild<Bone>("Accumulation_Root", true);
    let bone = accumulationRoot?.FindFirstChildWhichIsA("Bone");
    while (bone !== undefined) {
      this.boneRestStates.push({
        bone,
        localPosition: this.frontSide.CFrame.PointToObjectSpace(bone.WorldPosition),
      });
      bone = bone.FindFirstChildWhichIsA("Bone");
    }
  }

  /**
   * Stretches the page's width to match the viewport's aspect ratio, keeping height fixed.
   * Bone offsets are expressed relative to `Page_FrontSide`'s own CFrame, so local X is always
   * the width axis regardless of how the model happens to be oriented in the world - only that
   * axis is scaled, which keeps the page-flip rig from warping.
   */
  private updateAspectRatio(viewportSize: Vector2): void {
    const width = this.originalHeight * (viewportSize.X / viewportSize.Y);
    const scale = width / this.originalWidth;

    for (const part of [this.frontSide, this.backSide]) {
      const size = part.Size;
      part.Size = new Vector3(width, size.Y, size.Z);
    }

    for (const { bone, localPosition } of this.boneRestStates) {
      const scaledLocal = new Vector3(localPosition.X * scale, localPosition.Y, localPosition.Z);
      bone.WorldPosition = this.frontSide.CFrame.PointToWorldSpace(scaledLocal);
    }
  }
}
