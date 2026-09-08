import { RunService, TweenService, Workspace as World } from "@rbxts/services";
import { getChildrenOfType } from "@rbxts/instance-utility";
import Sift from "@rbxts/sift";

import { assets, maxCardsInHand, XZ } from "shared/constants";
import { DuelCirclePosition } from "shared/structs/duel";
import { GearCategory } from "shared/structs/data/items/gear";
import { SpellTargetKind } from "shared/structs/spell";
import type { DeckData, DeckLinkedData } from "shared/structs/data/items/gear/deck";
import type { SpellReference } from "shared/structs/data/reference/spell";
import type { CharacterData } from "shared/structs/data";
import type { SpellReferenceData } from "shared/structs/spell";
import type { ZoneID } from "shared/structs/zone";
import { getZoneModel } from "./zone";
import { getEquippedGear } from "./data";
import Log from "shared/log";

const log = Log.scoped("duel pips");

export function getDuelCirclePositionPart(positions: DuelCirclePositions, position: DuelCirclePosition): Part {
  switch (position) {
    case DuelCirclePosition.First: return positions["1"];
    case DuelCirclePosition.Second: return positions["2"];
    case DuelCirclePosition.Third: return positions["3"];
    case DuelCirclePosition.Fourth: return positions["4"];
  }
}

/** The `zoneID` zone's `DuelCircleLocations` marker closest to `position`, or `undefined` if none are placed yet. */
export function getClosestDuelCircleLocation(zoneID: ZoneID, position: Vector3): Maybe<BasePart> {
  const locations = getChildrenOfType(getZoneModel(zoneID).DuelCircleLocations, "BasePart");
  let closest: Maybe<BasePart>;
  let closestDistance = math.huge;

  for (const location of locations) {
    const distance = location.Position.sub(position).Magnitude;
    if (distance >= closestDistance) continue;

    closest = location;
    closestDistance = distance;
  }

  return closest;
}

/**
 * The CFrame `combatant` should end up at to stand on top of `targetPart` facing the same
 * direction it does, rather than centered on it - `targetPart.CFrame` alone puts the
 * combatant's collider (centered on its own body) at ground level, sinking it halfway
 * into the floor. Same ground-offset technique as `Enemy.teleport`.
 */
export function getGroundedTargetCFrame(combatant: CombatantModel, targetPart: BasePart): CFrame {
  const [, size] = combatant.GetBoundingBox();
  return targetPart.CFrame.add(new Vector3(0, size.Y / 2 - targetPart.Size.Y / 2, 0));
}

/** Corrects `assets.duel.combatantSigil`'s authored orientation to lie flat on the ground. */
const SIGIL_FLAT_ROTATION = CFrame.Angles(math.rad(90), 0, 0);

/**
 * Places `assets.duel.combatantSigil` at `combatant`'s feet and welds it there so it tracks
 * them for the rest of the fight; destroyed automatically along with `combatant`.
 *
 * Call this only once `combatant` is actually active in the fight - a combatant standing in
 * the circle but still waiting to be added shouldn't have a sigil yet.
 */
export function attachCombatantSigil(combatant: CombatantModel): MeshPart {
  const sigil = assets.duel.combatantSigil.Clone();
  const [boundsCFrame, size] = combatant.GetBoundingBox();

  const collider = combatant.collider.Position;
  const feetPosition = new Vector3(collider.X, boundsCFrame.Position.Y - size.Y / 2, collider.Z);

  sigil.CFrame = new CFrame(feetPosition.add(new Vector3(0, sigil.Size.Z / 2 + 1, 0))).mul(SIGIL_FLAT_ROTATION);
  sigil.Parent = combatant;

  const weld = new Instance("WeldConstraint");
  weld.Part0 = sigil;
  weld.Part1 = combatant.collider;
  weld.Parent = sigil;

  return sigil;
}

/**
 * Clones `assets.duel.pipPositions` at `combatant`'s feet, facing the same direction, and welds
 * each of its 7 slot parts to `combatant.collider` so they track them for the rest of the fight;
 * destroyed automatically along with `combatant`.
 */
export function attachPipPositions(combatant: CombatantModel): typeof assets.duel.pipPositions {
  const positions = assets.duel.pipPositions.Clone();

  // X/Z centered on `collider`, Y from the bounding box's own bottom edge - see
  // attachCombatantSigil for why.
  const [boundsCFrame, size] = combatant.GetBoundingBox();
  const collider = combatant.collider.Position;
  const feetPosition = new Vector3(collider.X, boundsCFrame.Position.Y - size.Y / 2, collider.Z);
  const facing = combatant.collider.CFrame.LookVector.mul(XZ);
  const facingUnit = facing.Magnitude > 0.01 ? facing.Unit : facing;
  const facingCFrame = CFrame.lookAt(feetPosition, feetPosition.add(facingUnit));
  positions.PivotTo(facingCFrame);

  // pipPositions' own pivot defaults to its bounding-box center (no PrimaryPart/authored pivot),
  // so anchoring straight to `facingCFrame` buried half of it below ground - same fix as
  // `spawnSelectionAura`: re-measure the AABB (reflects the post-rotation extent) and nudge up
  // so the model's own bottom face rests at `feetPosition` instead of its center.
  const [, positionsSize] = positions.GetBoundingBox();
  positions.PivotTo(facingCFrame.add(new Vector3(0, positionsSize.Y / 2, 0)));
  positions.Parent = combatant;

  const slots = getChildrenOfType(positions, "Part");
  for (const slot of slots) {
    const weld = new Instance("WeldConstraint");
    weld.Part0 = slot;
    weld.Part1 = combatant.collider;
    weld.Parent = slot;
  }

  log.debug(`attached ${positions.GetFullName()} to ${combatant.GetFullName()} at ${feetPosition} (${slots.size()} slot part(s) found and welded)`);
  return positions;
}

function getEquippedDeck(character: CharacterData): Maybe<DeckData & DeckLinkedData> {
  return getEquippedGear<DeckData & DeckLinkedData>(GearCategory.Deck, character);
}

/**
 * Shuffles `character`'s equipped deck and deals a starting hand from it, capped at
 * `maxCardsInHand`. Returns bare references rather than full `SpellCard`s - `Spell`'s
 * shape (nested unions, `Vector2`s, etc.) is too much for the network guard `MessageEmitter`
 * generates for `Duel_Start` to validate, and the client can already turn a reference back
 * into a `SpellCard` via `getSpellCardFromReferenceData`.
 */
export function getShuffledHand(character: CharacterData): SpellReferenceData[] {
  const deck = getEquippedDeck(character);
  if (deck === undefined) return [];

  const shuffled = Sift.Array.shuffle(deck.spellReferences);
  const hand: SpellReferenceData[] = [];
  for (let i = 0; i < math.min(shuffled.size(), maxCardsInHand); i++)
    hand.push(shuffled[i]);

  return hand;
}

/** `character`'s equipped deck's sideboard treasure card references, or `[]` if they have no deck equipped. */
export function getDeckSideboard(character: CharacterData): SpellReference[] {
  return getEquippedDeck(character)?.sideboardSpellReferences ?? [];
}

const CIRCLE_FLASH_IN_DURATION = 0.25;
const CIRCLE_FLASH_OUT_DURATION = 0.6;

/**
 * Plays the duel circle's spawn-in effect: `Glow` flashes in to solid white, then fades back
 * out to its authored appearance while `Main`/`Vortex` fade in underneath it, revealing the
 * circle. `Main`/`Vortex`/`Glow`'s current transparency/color are captured as the "final"
 * appearance to animate towards, so this works regardless of how the template is authored.
 */
export function playCircleSpawnAnimation(circle: DuelCircleModel): void {
  const { Main, Vortex, Glow } = circle;
  const finalMainTransparency = Main.Transparency;
  const finalVortexTransparency = Vortex.Transparency;
  const finalGlowTransparency = Glow.Transparency;
  const finalGlowColor = Glow.Color;

  Main.Transparency = 1;
  Vortex.Transparency = 1;
  Glow.Transparency = 1;
  Glow.Color = new Color3(1, 1, 1);

  const flashIn = TweenService.Create(Glow, new TweenInfo(CIRCLE_FLASH_IN_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { Transparency: 0 });
  flashIn.Completed.Once(() => {
    TweenService.Create(Main, new TweenInfo(CIRCLE_FLASH_OUT_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { Transparency: finalMainTransparency }).Play();
    TweenService.Create(Vortex, new TweenInfo(CIRCLE_FLASH_OUT_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { Transparency: finalVortexTransparency }).Play();
    TweenService.Create(Glow, new TweenInfo(CIRCLE_FLASH_OUT_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { Transparency: finalGlowTransparency, Color: finalGlowColor }).Play();
  });
  flashIn.Play();
}

/** Loops the duel circle's idle animation on its own `AnimationController`. */
export function playCircleIdleAnimation(circle: DuelCircleModel): void {
  const track = circle.AnimationController.Animator.LoadAnimation(assets.animations.duel.circle.idle);
  track.Looped = true;
  track.Play();
}

/** Plays the duel circle's one-shot "a combatant just joined" effect - for combatants added to an already-forming duel, not the founding pair. */
export function playCombatantAddedAnimation(circle: DuelCircleModel): void {
  circle.AnimationController.Animator.LoadAnimation(assets.animations.duel.circle.combatantAdded).Play();
}

const POINTER_FORWARD_OFFSET = 6;
const POINTER_FLASH_COUNT = 3;
const POINTER_FLASH_DURATION = 0.15;
const POINTER_FLASH_COLOR = new Color3(1, 1, 1);

/**
 * Flashes `pointer`'s `SurfaceGui.ImageLabel` white and back to its authored color
 * `POINTER_FLASH_COUNT` times in a row, to draw the eye to who it's pointing at. Tweening the
 * `Part`'s own `Color` did nothing visible - the pointer's rendered as an image on its
 * `SurfaceGui`, not the part's surface color.
 *
 * Also tweens `ImageTransparency` down to fully opaque alongside the color - a color-only tween
 * is invisible if the label is authored with any transparency, since a whiter tint on a
 * partially-see-through image can look identical to the untinted version.
 */
function flashPointer(pointer: typeof assets.duel.pointer): void {
  const { ImageLabel } = pointer.SurfaceGui;
  const originalColor = ImageLabel.ImageColor3;
  const originalTransparency = ImageLabel.ImageTransparency;
  let flashesLeft = POINTER_FLASH_COUNT;

  const flashOnce = () => {
    if (flashesLeft-- <= 0) return;

    const flashIn = TweenService.Create(ImageLabel, new TweenInfo(POINTER_FLASH_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { ImageColor3: POINTER_FLASH_COLOR, ImageTransparency: 0 });
    flashIn.Completed.Once(() => {
      const flashOut = TweenService.Create(ImageLabel, new TweenInfo(POINTER_FLASH_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.In), { ImageColor3: originalColor, ImageTransparency: originalTransparency });
      flashOut.Completed.Once(flashOnce);
      flashOut.Play();
    });
    flashIn.Play();
  };

  flashOnce();
}

/**
 * Randomly picks which side goes first and rotates `assets.duel.pointer`, sitting at the
 * circle's center, to point at that side's first combatant, flashing it to draw attention.
 * Returns `true` if the team side was chosen, `false` for the opponent side.
 *
 * Destroys any pointer already parented to `circle` first, so a duplicate call can't leave two
 * pointers behind.
 */
export function pointAtFirstTurnCombatant(circle: DuelCircleModel): boolean {
  circle.FindFirstChild(assets.duel.pointer.Name)?.Destroy();

  const startsWithTeam = math.random() < 0.5;
  const firstPositions = startsWithTeam ? circle.teamPositions : circle.opponentPositions;
  const target = getDuelCirclePositionPart(firstPositions, DuelCirclePosition.First);

  const facingCFrame = CFrame.lookAt(circle.Root.Position, target.Position);
  const pointer = assets.duel.pointer.Clone();
  pointer.CFrame = facingCFrame.add(facingCFrame.LookVector.mul(POINTER_FORWARD_OFFSET));
  pointer.Parent = circle;
  flashPointer(pointer);

  return startsWithTeam;
}

/** Which position folder/count/side a single-target spell targets, given who's casting it. `undefined` for spells that aren't single-target (`MultipleEnemies` AOE targeting isn't handled here yet). */
function resolveTargetFolder(
  model: DuelCircleModel,
  onOpposingTeam: boolean,
  targetKind: SpellTargetKind,
  teamCount: number,
  opponentCount: number
): Maybe<readonly [folder: DuelCirclePositions, count: number, isOpponent: boolean]> {
  const allyPositions = onOpposingTeam ? model.opponentPositions : model.teamPositions;
  const enemyPositions = onOpposingTeam ? model.teamPositions : model.opponentPositions;
  const allyCount = onOpposingTeam ? opponentCount : teamCount;
  const enemyCount = onOpposingTeam ? teamCount : opponentCount;

  if (targetKind === SpellTargetKind.SingleTeam) return [allyPositions, allyCount, false] as const;
  if (targetKind === SpellTargetKind.SingleEnemy) return [enemyPositions, enemyCount, true] as const;
  return undefined;
}

/** Corrects `assets.duel.selectionTarget`'s authored orientation (lying flat) to stand upright at `part`. */
const AURA_UPRIGHT_ROTATION = CFrame.Angles(math.rad(90), 0, 0);

function spawnSelectionAura(part: BasePart, position: DuelCirclePosition, isOpponent: boolean): Model {
  const aura = assets.duel.selectionTarget.Clone();
  const uprightCFrame = new CFrame(part.Position).mul(AURA_UPRIGHT_ROTATION);
  aura.PivotTo(uprightCFrame);

  // GetBoundingBox reflects the AABB post-rotation, so this has to run after the
  // PivotTo above (the ring's authored thickness axis becomes its height axis once
  // upright) - otherwise half the ring ends up sunk below `part`. Same offset technique
  // as `getGroundedTargetCFrame`: `part` is a marker with its own Size, so its .Position
  // sits at the marker's vertical center rather than its bottom face.
  const [, size] = aura.GetBoundingBox();
  aura.PivotTo(uprightCFrame.add(new Vector3(0, size.Y / 2 - part.Size.Y / 2, 0)));
  aura.SetAttribute("DuelCirclePosition", position);
  aura.SetAttribute("OpposingTeam", isOpponent);
  aura.Parent = World.TargetSelectionStorage;

  return aura;
}

/**
 * Spawns `assets.duel.selectionTarget` auras over every target `spell` can single-target right
 * now, tagged for `duel-card-button.tsx`'s target-picking raycast, and calls `onAuraSpawned` for
 * each. Position-folder slots are now anchored and present from the moment the circle replicates
 * in, so this reads them straight off `model` rather than waiting on `ChildAdded`.
 */
export function spawnSelectionTargets(
  model: DuelCircleModel,
  onOpposingTeam: boolean,
  targetKind: SpellTargetKind,
  teamCount: number,
  opponentCount: number,
  onAuraSpawned: (aura: Model) => void
): void {
  const resolved = resolveTargetFolder(model, onOpposingTeam, targetKind, teamCount, opponentCount);
  if (resolved === undefined) return;

  const [folder, count, isOpponent] = resolved;
  for (let i = 0; i < count; i++) {
    const position = i as DuelCirclePosition;
    const part = getDuelCirclePositionPart(folder, position);
    onAuraSpawned(spawnSelectionAura(part, position, isOpponent));
  }
}

/** Fraction of the approach's duration into which the turn from travel-facing to `targetCFrame`'s exact facing is compressed - see `moveCombatantToDuelPosition`. */
const ARRIVAL_TURN_START = 0.75;

/**
 * Runs `combatant` toward `targetCFrame` over exactly `duration` seconds
 * (regardless of distance, so combatants starting further away don't lag
 * behind - both should arrive together). Faces the travel direction for most
 * of the approach, then eases into `targetCFrame`'s exact facing over the
 * final `1 - ARRIVAL_TURN_START` of the duration, since the two can differ -
 * blending the whole way through would have it facing sideways to its own
 * movement for the entire approach instead of just the last stretch.
 *
 * `targetCFrame` (and every intermediate frame) is expressed in terms of where `collider` should
 * end up, matching `getGroundedTargetCFrame`, but is applied by pivoting the whole `combatant`
 * model rather than setting `collider.CFrame` directly - `collider` isn't necessarily the part
 * driving the rest of the rig's position (an `Enemy`'s visible model follows its `root`, not
 * `collider`, which is otherwise only used for touch detection), so writing to it alone can leave
 * the visible model behind while only the hitbox moves.
 *
 * `runningAnimation` is not wired up yet (no run animation plays for either
 * combatant during the approach) - pass it once dedicated duel-approach
 * clips exist.
 */
export function moveCombatantToDuelPosition(
  combatant: CombatantModel,
  targetCFrame: CFrame,
  runningAnimation: Maybe<Animation>,
  duration: number,
  onCompleted: () => void
): void {
  const { collider } = combatant;
  const colliderOffsetFromPivot = combatant.GetPivot().ToObjectSpace(collider.CFrame);
  const moveColliderTo = (cframe: CFrame) => combatant.PivotTo(cframe.mul(colliderOffsetFromPivot.Inverse()));

  const startPosition = collider.Position;
  const targetPosition = targetCFrame.Position;
  const travelDirection = targetPosition.sub(startPosition).mul(XZ);
  const startFacing = travelDirection.Magnitude > 0.01
    ? CFrame.lookAt(Vector3.zero, travelDirection)
    : collider.CFrame.sub(startPosition);
  const endFacing = targetCFrame.sub(targetPosition);

  const track = runningAnimation && combatant.AnimationController.Animator.LoadAnimation(runningAnimation);
  if (track) {
    track.Looped = true;
    track.Play();
  }

  const finish = () => {
    track?.Stop(0.15);
    moveColliderTo(targetCFrame);
    onCompleted();
  };

  if (duration <= 0.01) {
    finish();
    return;
  }

  const startTime = os.clock();
  const connection = RunService.Heartbeat.Connect(() => {
    const progress = math.clamp((os.clock() - startTime) / duration, 0, 1);
    const eased = TweenService.GetValue(progress, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut);
    const position = startPosition.Lerp(targetPosition, eased);

    const turnProgress = math.clamp((progress - ARRIVAL_TURN_START) / (1 - ARRIVAL_TURN_START), 0, 1);
    const turnEased = TweenService.GetValue(turnProgress, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut);
    const facing = startFacing.Lerp(endFacing, turnEased);

    moveColliderTo(new CFrame(position).mul(facing));

    if (progress >= 1) {
      connection.Disconnect();
      finish();
    }
  });
}
