import Vide, { cleanup } from "@rbxts/vide";
import { Players } from "@rbxts/services";
import { useEventListener } from "@rbxts/pretty-vide-utils";

/** Frames a head-and-shoulders bust, not the whole body. */
const TARGET_HEIGHT = 2.2;
const FIELD_OF_VIEW = 35;
/** Lowers the look target from `Head` to roughly collarbone height, so the head sits in the upper half of the frame instead of dead-center. */
const LOOK_TARGET_DROP = 0.45;

function findHeadPosition(model: Model): Vector3 {
  const head = model.FindFirstChild("Head", true);
  if (head?.IsA("Bone")) return head.WorldPosition;
  if (head?.IsA("BasePart")) return head.Position;

  const collider = model.PrimaryPart;
  return collider !== undefined ? collider.Position.add(new Vector3(0, 2, 0)) : Vector3.zero;
}

function frameOnHead(clone: Model, camera: Camera, viewport: ViewportFrame): void {
  const primaryPart = clone.PrimaryPart;
  const forward = primaryPart?.CFrame.LookVector ?? new Vector3(0, 0, -1);
  const up = primaryPart?.CFrame.UpVector ?? Vector3.yAxis;
  const lookTarget = findHeadPosition(clone).sub(up.mul(LOOK_TARGET_DROP));
  const distance = (TARGET_HEIGHT / 2) / math.tan(math.rad(camera.FieldOfView / 2));

  camera.CFrame = CFrame.lookAt(lookTarget.sub(forward.mul(distance)), lookTarget, up);
  // Key light shines from the camera's side of the subject, matching wherever this particular clone happens to be facing.
  viewport.LightDirection = forward;
}

/** A live, static-pose bust render of the local player's own character - a clone parented into the viewport, not the roaming, animating one in `Workspace`, which stays untouched. */
export function CharacterPortrait(): Vide.Node {
  const camera = new Instance("Camera");
  camera.FieldOfView = FIELD_OF_VIEW;
  camera.Name = "Camera";

  const viewport = new Instance("ViewportFrame");
  viewport.Name = "CharacterPortrait";
  viewport.BackgroundTransparency = 1;
  viewport.Size = UDim2.fromScale(1, 1);
  viewport.Ambient = new Color3(1, 1, 1);
  viewport.LightColor = new Color3(1, 1, 1);
  viewport.CurrentCamera = camera;
  camera.Parent = viewport;
  cleanup(viewport);

  let displayModel: Maybe<Model>;
  const showCharacter = (character: Model) => {
    const clone = character.Clone();
    for (const part of clone.GetDescendants()) {
      if (part.IsA("BasePart")) {
        part.Anchored = true;
        part.CanCollide = false;
        part.CanQuery = false;
        part.CanTouch = false;
      }
    }

    frameOnHead(clone, camera, viewport);
    clone.Parent = viewport;

    displayModel?.Destroy();
    displayModel = clone;
  };

  const player = Players.LocalPlayer;
  if (player.Character !== undefined) {
    showCharacter(player.Character);
  }

  useEventListener(player.CharacterAdded, showCharacter);
  cleanup(() => displayModel?.Destroy());

  return viewport;
}
