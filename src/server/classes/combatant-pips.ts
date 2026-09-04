import Sift from "@rbxts/sift";

import { assets } from "shared/constants";
import { attachPipPositions } from "shared/utility/duel";
import { canAffordSpellCost, resolveSpellCost } from "shared/utility/spell";
import type { Spell } from "shared/structs/spell";
import Log from "shared/log";

const log = Log.scoped("combatant pips");

const MAX_PIPS = 7;
const POWER_PIP_VALUE = 2;

interface PipEntry {
  readonly isPower: boolean;
}

/**
 * Tracks one combatant's pips for a duel. The count/value is available as soon as this is
 * constructed, so planning-phase afford checks work, but the in-world `assets.duel.pipPositions`
 * visual isn't cloned in until `reveal()` is called - call that once the planning UI actually
 * appears, not at duel-join time, so pips don't show up before the player can see them. A pip is
 * worth 1, a power pip 2. Shadow pips aren't modeled here.
 */
export class CombatantPips {
  private positions?: typeof assets.duel.pipPositions;
  private entries: PipEntry[] = [];

  public constructor(private readonly combatant: CombatantModel) { }

  public getCount(): number {
    return this.entries.size();
  }

  /** Total spendable value - regular pips count as 1, power pips as 2. */
  public getValue(): number {
    let total = 0;
    for (const entry of this.entries) total += entry.isPower ? POWER_PIP_VALUE : 1;

    return total;
  }

  /** Whether `cost` (in pips - `"X"` is affordable with any pips at all) is affordable right now. */
  public canAfford(cost: Spell["cost"]): boolean {
    return canAffordSpellCost(this.getValue(), cost);
  }

  /** Clones `assets.duel.pipPositions` onto the combatant and materializes every pip gained so far into it. Safe to call more than once - only the first call does anything. */
  public reveal(): void {
    if (this.positions !== undefined) return;

    this.positions = attachPipPositions(this.combatant);
    this.render();
  }

  /** Gains up to `count` pips of a fixed kind, capped at 7 total. Returns how many were actually added. */
  public add(isPower: boolean, count = 1): number {
    let added = 0;
    while (added < count && this.entries.size() < MAX_PIPS) {
      this.entries.push({ isPower });
      added++;
    }

    if (added > 0) this.render();
    return added;
  }

  /** Gains up to `count` pips, independently rolling `powerPipChance` (0-1) for each one to decide if it comes in as a power pip instead of a regular one. Returns how many were actually added. */
  public gainWithChance(powerPipChance: number, count = 1): number {
    let added = 0;
    while (added < count && this.entries.size() < MAX_PIPS) {
      this.entries.push({ isPower: math.random() < powerPipChance });
      added++;
    }

    if (added > 0) this.render();
    return added;
  }

  /**
   * Spends `cost` if affordable, picking the combination of currently-held pips that covers it
   * with the least waste - and, among equally wasteful options, the fewest power pips - rather
   * than always draining every regular pip first. E.g. against a 3-pip spell with 2 pips and 2
   * power pips available: 1 pip + 1 power pip is exact (0 waste), so that's what gets spent
   * instead of 2 pips + 1 power pip (which would waste 1) or 2 power pips (which would waste 1
   * and needlessly break a second power pip). Returns whether anything was spent.
   */
  public spend(cost: Spell["cost"]): boolean {
    if (!this.canAfford(cost)) return false;

    const target = resolveSpellCost(this.getValue(), cost);
    const regulars = this.entries.filter(entry => !entry.isPower);
    const powers = this.entries.filter(entry => entry.isPower);

    let bestPowerCount = 0;
    let bestRegularCount = 0;
    let bestWaste = math.huge;
    for (let powerCount = 0; powerCount <= powers.size(); powerCount++) {
      const regularCount = math.clamp(target - powerCount * POWER_PIP_VALUE, 0, regulars.size());
      const value = regularCount + powerCount * POWER_PIP_VALUE;
      if (value < target) continue;

      const waste = value - target;
      if (waste >= bestWaste) continue;

      bestWaste = waste;
      bestPowerCount = powerCount;
      bestRegularCount = regularCount;
    }

    const toRemove = new Set<PipEntry>();
    for (const entry of Sift.Array.slice(regulars, 0, bestRegularCount)) toRemove.add(entry);
    for (const entry of Sift.Array.slice(powers, 0, bestPowerCount)) toRemove.add(entry);

    this.entries = this.entries.filter(entry => !toRemove.has(entry));
    this.render();
    log.debug(`spent ${bestRegularCount} pip(s) and ${bestPowerCount} power pip(s) on a ${cost.pips}-pip spell (${bestWaste} wasted, ${this.getValue()} remaining)`);
    return true;
  }

  /** Wipes and redraws every slot from the current `entries`, so pips always sit in slots 1..N with no gaps regardless of adds/removals. No-op before `reveal()`. */
  private render(): void {
    if (this.positions === undefined) return;

    for (let slot = 1; slot <= MAX_PIPS; slot++)
      this.getSlotPart(this.positions, slot).ClearAllChildren();

    this.entries.forEach((entry, i) => this.materialize(entry, i + 1));
  }

  private materialize(entry: PipEntry, slotIndex: number): void {
    const slot = this.getSlotPart(this.positions!, slotIndex);
    const token = (entry.isPower ? assets.duel.powerPip : assets.duel.pip).Clone();
    token.CFrame = slot.CFrame;
    token.Parent = slot;

    const weld = new Instance("WeldConstraint");
    weld.Part0 = token;
    weld.Part1 = slot;
    weld.Parent = token;

    log.debug(`placed ${entry.isPower ? "power " : ""}pip #${slotIndex} (${token.GetFullName()}) at ${token.Position}`);
  }

  private getSlotPart(positions: typeof assets.duel.pipPositions, slot: number): Part {
    switch (slot) {
      case 1: return positions["1"];
      case 2: return positions["2"];
      case 3: return positions["3"];
      case 4: return positions["4"];
      case 5: return positions["5"];
      case 6: return positions["6"];
      case 7: return positions["7"];
      default: return error(`Invalid pip slot: ${slot}`);
    }
  }
}
