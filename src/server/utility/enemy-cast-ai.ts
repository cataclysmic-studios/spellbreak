import { School } from "shared/structs/school";
import { SpellKind } from "shared/structs/spell";
import { SpellActionKind } from "shared/structs/spell/actions";
import { canAffordSpellCost, getSpellFromReference } from "shared/utility/spell";
import Log from "shared/log";

import type { RangeJSON } from "@rbxts/range";
import type { Spell } from "shared/structs/spell";
import type { SpellActionKinds } from "shared/structs/spell/actions";
import type { SpellReference } from "shared/structs/data/reference/spell";
import type { DuelChoice, DuelChoiceTarget, DuelCirclePosition } from "shared/structs/duel";
import type { ActiveDuel } from "server/classes/duel";
import type { Enemy } from "server/classes/enemy";

const log = Log.scoped("enemy cast ai");

/** Below this fraction of max health, healing pre-empts every other consideration, regardless of school. */
const ENEMY_AI_HEAL_HP_THRESHOLD = 0.5;

/** Per-enemy, per-duel state the AI needs beyond what `ActiveDuel` already tracks generically - approximations standing in for engine state that doesn't exist yet (see the caveats below). */
export interface EnemyAIMemory {
  wardCast: boolean;
  trappedTargets: Set<CombatantModel>;
}

const enum AIBucket { Heal, Ward, Blade, Trap, Manipulation, Utility, Attack }

/** Exhaustive so a newly-added `SpellKind` fails to compile here until it's bucketed. */
const BUCKET_BY_KIND: Record<SpellKind, AIBucket> = {
  [SpellKind.Heal]: AIBucket.Heal,
  [SpellKind.Ward]: AIBucket.Ward,
  [SpellKind.Charm]: AIBucket.Blade,
  [SpellKind.Global]: AIBucket.Blade,
  [SpellKind.Trap]: AIBucket.Trap,
  [SpellKind.Curse]: AIBucket.Trap,
  [SpellKind.Jinx]: AIBucket.Trap,
  [SpellKind.Manipulation]: AIBucket.Manipulation,
  [SpellKind.Aura]: AIBucket.Utility,
  [SpellKind.Enchantment]: AIBucket.Utility,
  [SpellKind.Polymorph]: AIBucket.Utility,
  [SpellKind.Mutate]: AIBucket.Utility,
  [SpellKind.Damage]: AIBucket.Attack,
  [SpellKind.AOE]: AIBucket.Attack,
  [SpellKind.Drain]: AIBucket.Attack
};

/**
 * The order each school's enemies weigh non-Heal buckets in before defaulting to Attack - Heal is
 * always checked first regardless of school, since self-preservation isn't a personality trait.
 * No official KingsIsle AI spec is public; this is a best-effort approximation from
 * community-documented behavior (blade-before-attack, wards being uncommon outside scripted
 * bosses) plus each school's own established identity - a tunable starting point, not verified
 * ground truth. Exhaustive over every `School`, astral/Shadow included, so a newly-added school
 * can't silently fall through unconsidered.
 */
const BUCKET_ORDER_BY_SCHOOL: Record<School, AIBucket[]> = {
  // Aggressive/DOT-minded - wards are rare, so Ward sits near-last instead of being dropped outright.
  [School.Fire]: [AIBucket.Blade, AIBucket.Trap, AIBucket.Manipulation, AIBucket.Utility, AIBucket.Ward, AIBucket.Attack],
  // Tanky/defensive - wards and blades before ever attacking.
  [School.Ice]: [AIBucket.Ward, AIBucket.Blade, AIBucket.Trap, AIBucket.Manipulation, AIBucket.Utility, AIBucket.Attack],
  // Glass cannon - no Ward bucket at all, it just doesn't play defense.
  [School.Storm]: [AIBucket.Blade, AIBucket.Trap, AIBucket.Manipulation, AIBucket.Utility, AIBucket.Attack],
  // Support/healer - Heal is already covered universally above; otherwise plays it safe.
  [School.Life]: [AIBucket.Ward, AIBucket.Blade, AIBucket.Manipulation, AIBucket.Trap, AIBucket.Utility, AIBucket.Attack],
  // Attrition/drain-focused - blades itself up but doesn't bother warding.
  [School.Death]: [AIBucket.Blade, AIBucket.Manipulation, AIBucket.Trap, AIBucket.Utility, AIBucket.Attack],
  // Trap/minion identity - traps and manipulation (summons) come before blading up.
  [School.Myth]: [AIBucket.Trap, AIBucket.Manipulation, AIBucket.Blade, AIBucket.Ward, AIBucket.Utility, AIBucket.Attack],
  // Versatile/neutral - the plainest order of the bunch.
  [School.Balance]: [AIBucket.Ward, AIBucket.Blade, AIBucket.Trap, AIBucket.Manipulation, AIBucket.Utility, AIBucket.Attack],
  // Global team buffs/debuffs are this school's whole identity - Utility (its auras/enchantments) leads.
  [School.Stellar]: [AIBucket.Utility, AIBucket.Ward, AIBucket.Blade, AIBucket.Trap, AIBucket.Manipulation, AIBucket.Attack],
  // Single-target self-enchantments are this school's whole identity - Utility leads, then it blades up.
  [School.Solar]: [AIBucket.Utility, AIBucket.Blade, AIBucket.Ward, AIBucket.Trap, AIBucket.Manipulation, AIBucket.Attack],
  // Polymorph/transformation-focused - Utility (the polymorph itself) leads.
  [School.Lunar]: [AIBucket.Utility, AIBucket.Ward, AIBucket.Blade, AIBucket.Trap, AIBucket.Manipulation, AIBucket.Attack],
  // Dangerous, high-risk arcane power - aggressive like Storm, no Ward.
  [School.Shadow]: [AIBucket.Blade, AIBucket.Manipulation, AIBucket.Trap, AIBucket.Utility, AIBucket.Attack]
};

interface PlayerTargetResult {
  readonly target: DuelChoiceTarget;
  readonly model: CombatantModel;
}

/** Every pool spell in `bucket` this enemy can currently afford, deduped (repeats in a pool only encode future pick-weight). */
function getCandidates(pool: SpellReference[], bucket: AIBucket, pips: number): Spell[] {
  const seen = new Set<SpellReference>();
  const candidates: Spell[] = [];
  for (const reference of pool) {
    if (seen.has(reference)) continue;
    seen.add(reference);

    const spell = getSpellFromReference(reference);
    if (BUCKET_BY_KIND[spell.kind] === bucket && canAffordSpellCost(pips, spell.cost))
      candidates.push(spell);
  }

  return candidates;
}

function isDamageActionKind(kind: SpellActionKinds): boolean {
  return kind === SpellActionKind.Damage.Hit || kind === SpellActionKind.Damage.HitAOE
    || kind === SpellActionKind.Damage.DrainHit || kind === SpellActionKind.Damage.DrainHitAOE
    || kind === SpellActionKind.Damage.DOT || kind === SpellActionKind.Damage.DOTAOE;
}

function averageActionValue(spell: Spell): number {
  let total = 0;
  let count = 0;
  for (const action of spell.actions) {
    if (!isDamageActionKind(action.kind)) continue;

    const range = action.value as RangeJSON;
    total += (range.minimum + range.maximum) / 2;
    count++;
  }

  return count > 0 ? total / count : 0;
}

function pipCostValue(spell: Spell): number {
  return spell.cost.pips === "X" ? math.huge : spell.cost.pips;
}

/** Highest accuracy-weighted average damage wins, ties broken by lowest pip cost. */
function pickBestAttack(candidates: Spell[]): Spell {
  return candidates.reduce((best, spell) => {
    const bestScore = (best.accuracy / 100) * averageActionValue(best);
    const score = (spell.accuracy / 100) * averageActionValue(spell);
    if (score !== bestScore) return score > bestScore ? spell : best;

    return pipCostValue(spell) < pipCostValue(best) ? spell : best;
  });
}

function pickLowestHealthPlayerTarget(duel: ActiveDuel): Maybe<PlayerTargetResult> {
  let best: Maybe<PlayerTargetResult>;
  let bestHealth = math.huge;
  for (let position = 0; position < duel.players.size(); position++) {
    const model = duel.combatantAt(position as DuelCirclePosition, false);
    const health = model !== undefined ? duel.getHealth(model) : undefined;
    if (model === undefined || health === undefined || health.isDefeated() || health.getCurrent() >= bestHealth) continue;

    bestHealth = health.getCurrent();
    best = { target: { position: position as DuelCirclePosition, isOpponent: false }, model };
  }

  return best;
}

function pickHighestPipPlayerTarget(duel: ActiveDuel): Maybe<PlayerTargetResult> {
  let best: Maybe<PlayerTargetResult>;
  let bestPips = -1;
  for (let position = 0; position < duel.players.size(); position++) {
    const model = duel.combatantAt(position as DuelCirclePosition, false);
    const pips = model !== undefined ? duel.getPips(model)?.getValue() ?? 0 : undefined;
    if (model === undefined || pips === undefined || pips <= bestPips) continue;

    bestPips = pips;
    best = { target: { position: position as DuelCirclePosition, isOpponent: false }, model };
  }

  return best;
}

function pickBladedPlayerTarget(duel: ActiveDuel): Maybe<PlayerTargetResult> {
  for (let position = 0; position < duel.players.size(); position++) {
    const model = duel.combatantAt(position as DuelCirclePosition, false);
    if (model !== undefined && duel.hasPendingBlade(model))
      return { target: { position: position as DuelCirclePosition, isOpponent: false }, model };
  }

  return undefined;
}

function selfTarget(enemy: Enemy, duel: ActiveDuel): Maybe<DuelChoiceTarget> {
  return duel.locate(enemy.model);
}

function toChoice(spell: Spell, target: Maybe<DuelChoiceTarget>): DuelChoice {
  return { spellReference: spell.reference, target: target?.position, targetIsOpponent: target?.isOpponent };
}

/**
 * `GainPips`/`StealPips`/`StripBlades`/`StealBlades` are scored against real tracked state
 * (pip values, `hasPendingBlade`) - everything else here needs engine subsystems that don't exist
 * yet (negative-charm/trap/shield tracking, stunning, mid-duel summoning), so they're stubbed
 * rather than guessed at.
 */
function chooseManipulation(enemy: Enemy, duel: ActiveDuel, pool: SpellReference[], pips: number): Maybe<DuelChoice> {
  for (const spell of getCandidates(pool, AIBucket.Manipulation, pips)) {
    const action = spell.actions[0];
    if (action === undefined) continue;

    if (action.kind === SpellActionKind.Manipulation.GainPips) {
      const canAffordAnyAttack = pool.some(reference => {
        const attackSpell = getSpellFromReference(reference);
        return BUCKET_BY_KIND[attackSpell.kind] === AIBucket.Attack && canAffordSpellCost(pips, attackSpell.cost);
      });
      if (!canAffordAnyAttack) return toChoice(spell, selfTarget(enemy, duel));
    } else if (action.kind === SpellActionKind.Manipulation.StealPips) {
      const target = pips <= 1 ? pickHighestPipPlayerTarget(duel) : undefined;
      if (target !== undefined) return toChoice(spell, target.target);
    } else if (action.kind === SpellActionKind.Manipulation.StripBlades || action.kind === SpellActionKind.Manipulation.StealBlades) {
      const target = pickBladedPlayerTarget(duel);
      if (target !== undefined) return toChoice(spell, target.target);
    } else {
      log.debug(`"${spell.name}"'s ${action.kind} manipulation isn't scored yet - skipping`);
    }
  }

  return undefined;
}

/** Picks this enemy's spell + target for the round it's about to enter, or `undefined` to pass. */
export function chooseEnemyCast(enemy: Enemy, duel: ActiveDuel): Maybe<DuelChoice> {
  const pool = enemy.descriptor.spellPool;
  const pips = duel.getPips(enemy.model)?.getValue() ?? 0;
  const health = duel.getHealth(enemy.model);

  if (health !== undefined && health.getCurrent() / health.max <= ENEMY_AI_HEAL_HP_THRESHOLD) {
    const healSpell = getCandidates(pool, AIBucket.Heal, pips)[0];
    if (healSpell !== undefined) return toChoice(healSpell, selfTarget(enemy, duel));
  }

  const memory = duel.getAIMemory(enemy);
  const primarySchool = enemy.descriptor.schools[0] ?? School.Balance;
  for (const bucket of BUCKET_ORDER_BY_SCHOOL[primarySchool]) {
    if (bucket === AIBucket.Ward) {
      if (memory.wardCast) continue;
      const wardSpell = getCandidates(pool, AIBucket.Ward, pips)[0];
      if (wardSpell === undefined) continue;

      memory.wardCast = true;
      return toChoice(wardSpell, selfTarget(enemy, duel));
    }

    if (bucket === AIBucket.Blade) {
      if (duel.hasPendingBlade(enemy.model)) continue;
      const bladeSpell = getCandidates(pool, AIBucket.Blade, pips)[0];
      if (bladeSpell === undefined) continue;

      return toChoice(bladeSpell, selfTarget(enemy, duel));
    }

    if (bucket === AIBucket.Trap) {
      const trapSpell = getCandidates(pool, AIBucket.Trap, pips)[0];
      if (trapSpell === undefined) continue;

      const target = pickLowestHealthPlayerTarget(duel);
      if (target === undefined || memory.trappedTargets.has(target.model)) continue;

      memory.trappedTargets.add(target.model);
      return toChoice(trapSpell, target.target);
    }

    if (bucket === AIBucket.Manipulation) {
      const choice = chooseManipulation(enemy, duel, pool, pips);
      if (choice !== undefined) return choice;
      continue;
    }

    if (bucket === AIBucket.Utility) {
      const utilitySpell = getCandidates(pool, AIBucket.Utility, pips)[0];
      if (utilitySpell !== undefined) log.debug(`"${utilitySpell.name}" isn't scored yet - skipping`);
      continue;
    }
  }

  const attackCandidates = getCandidates(pool, AIBucket.Attack, pips);
  if (attackCandidates.size() === 0) return undefined;

  const target = pickLowestHealthPlayerTarget(duel);
  return target !== undefined ? toChoice(pickBestAttack(attackCandidates), target.target) : undefined;
}
