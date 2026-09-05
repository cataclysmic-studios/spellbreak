import Vide, { cleanup, effect, source, type Source } from "@rbxts/vide";
import { RunService, Workspace as World } from "@rbxts/services";

import { assets } from "shared/constants";

/** Ultimate fallback in case the page-flip animation never fires `Ended` - the load screen must never softlock the game. */
const PAGE_FLIP_TIMEOUT = 5;

/** Far below the map, out of sight - AnimationTracks never advance for a rig parented inside a ViewportFrame, so the page-flip has to actually play out here and get mirrored onto the ViewportFrame's display rig every frame. */
const PUPPET_CFRAME = new CFrame(0, -500, 0);

function mirrorPose(source: Instance, target: Instance): void {
  if (source.IsA("Bone") && target.IsA("Bone")) {
    target.Transform = source.Transform;
  } else if (source.IsA("Motor6D") && target.IsA("Motor6D")) {
    target.Transform = source.Transform;
  }

  for (const child of source.GetChildren()) {
    const targetChild = target.FindFirstChild(child.Name);
    if (targetChild !== undefined) {
      mirrorPose(child, targetChild);
    }
  }
}

interface BoneRestState {
  readonly bone: Bone;
  readonly localPosition: Vector3;
}

interface LoadScreenProps {
  /** Bumped by `LoadScreenController` each time the screen should show and (re)play the page-flip animation. */
  readonly trigger: Source<number>;
}

export function LoadScreen({ trigger }: LoadScreenProps): Vide.Node {
  const visible = source(false);

  const page = assets.loadScreenPage.Clone();
  const { Page_FrontSide: frontSide, Page_BackSide: backSide } = page;
  const originalWidth = frontSide.Size.X;
  const originalHeight = frontSide.Size.Z;
  const boneRestStates: BoneRestState[] = [];

  const accumulationRoot = page.FindFirstChild<Bone>("Accumulation_Root", true);
  let bone = accumulationRoot?.FindFirstChildWhichIsA("Bone");
  while (bone !== undefined) {
    boneRestStates.push({
      bone,
      localPosition: frontSide.CFrame.PointToObjectSpace(bone.WorldPosition),
    });
    bone = bone.FindFirstChildWhichIsA("Bone");
  }
  cleanup(page);

  const camera = new Instance("Camera");
  const outward = frontSide.CFrame.UpVector.mul(-1);
  const up = frontSide.CFrame.LookVector.mul(-1);
  const distance = (originalHeight / 2) / math.tan(math.rad(camera.FieldOfView / 2)) * 1.05;
  camera.FieldOfView = 67;
  camera.CFrame = CFrame.lookAt(frontSide.Position.add(outward.mul(distance)), frontSide.Position, up);
  cleanup(camera);

  /**
   * Stretches the page's width to match the viewport's aspect ratio, keeping height fixed.
   * Bone offsets are expressed relative to `Page_FrontSide`'s own CFrame, so local X is always
   * the width axis regardless of how the model happens to be oriented in the world - only that
   * axis is scaled, which keeps the page-flip rig from warping.
   */
  const updateAspectRatio = (viewportSize: Vector2) => {
    /**
     * Vide fires `*Changed` props synchronously before the instance is parented (see
     * `apply.luau`), so this first fires with `AbsoluteSize` still `(0, 0)` - dividing by
     * that produces NaN, which silently no-ops for `BasePart.Size` but permanently corrupts
     * `Bone.WorldPosition` below. A real `AbsoluteSizeChanged` follows once the ViewportFrame
     * is actually laid out; skip the bogus zero-size call and let that one apply instead.
     */
    if (viewportSize.X <= 0 || viewportSize.Y <= 0) return;

    const width = originalHeight * (viewportSize.X / viewportSize.Y);
    const scale = width / originalWidth;

    for (const part of [frontSide, backSide]) {
      const size = part.Size;
      part.Size = new Vector3(width, size.Y, size.Z);
    }

    for (const { bone: restBone, localPosition } of boneRestStates) {
      const scaledLocal = new Vector3(localPosition.X * scale, localPosition.Y, localPosition.Z);
      restBone.WorldPosition = frontSide.CFrame.PointToWorldSpace(scaledLocal);
    }
  };

  let mounted = false;
  effect(() => {
    trigger();
    if (!mounted) {
      mounted = true;
      return;
    }

    visible(true);

    const puppet = assets.loadScreenPage.Clone();
    for (const part of puppet.GetDescendants()) {
      if (part.IsA("BasePart")) {
        part.Anchored = true;
        part.CanCollide = false;
        part.CanQuery = false;
        part.CanTouch = false;
        part.Transparency = 1;
      }
    }
    puppet.PivotTo(PUPPET_CFRAME);
    puppet.Parent = World;
    cleanup(puppet);

    const [loaded, track] = pcall(() => puppet.AnimationController.Animator.LoadAnimation(assets.animations.pageFlip));
    if (!loaded) {
      visible(false);
      return;
    }

    track.Looped = false;

    const renderConnection = RunService.RenderStepped.Connect(() => mirrorPose(puppet, page));
    cleanup(renderConnection);

    track.Ended.Once(() => {
      renderConnection.Disconnect();
      visible(false);
    });
    task.delay(PAGE_FLIP_TIMEOUT, () => visible(false));
    track.Play();
  });

  return (
    <screengui Name="LoadScreen" Enabled={visible} IgnoreGuiInset DisplayOrder={100}>
      <viewportframe Name="ViewportFrame"
        AnchorPoint={new Vector2(0, 0)}
        Position={UDim2.fromScale(0, 0)}
        Size={UDim2.fromScale(1, 1)}
        BackgroundTransparency={1}
        BorderSizePixel={0}
        Ambient={Color3.fromRGB(240, 240, 240)}
        LightColor={new Color3(1, 1, 1)}
        LightDirection={new Vector3(-1, -1, -1)}
        CurrentCamera={camera}
        AbsoluteSizeChanged={updateAspectRatio}
      >
        {camera}
        {page}
      </viewportframe>
    </screengui>
  );
}
