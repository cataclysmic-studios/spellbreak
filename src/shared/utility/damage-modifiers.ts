import { DamageModifierKind, type EnemyDescriptor } from "../structs/enemy/descriptor";
import { EnemyKind } from "../structs/enemy/kind";
import { School } from "../structs/school";

const standardBoostFactor = 10;
const standardBoostFactors = {
  [EnemyKind.Regular]: standardBoostFactor,
  [EnemyKind.Regular2]: standardBoostFactor,
  [EnemyKind.Elite]: standardBoostFactor,
  [EnemyKind.Boss]: standardBoostFactor * 2
};

const standardResistFactor = 10;
const standardResistFactors = {
  [EnemyKind.Regular]: standardResistFactor,
  [EnemyKind.Regular2]: standardResistFactor,
  [EnemyKind.Elite]: standardResistFactor,
  [EnemyKind.Boss]: 50
};

const balanceBoostFactor = 7;
const balanceBoostFactors = {
  [EnemyKind.Regular]: balanceBoostFactor,
  [EnemyKind.Regular2]: balanceBoostFactor,
  [EnemyKind.Elite]: balanceBoostFactor,
  [EnemyKind.Boss]: balanceBoostFactor
};

const balanceResistFactor = 20;
const balanceResistFactors = {
  [EnemyKind.Regular]: balanceResistFactor,
  [EnemyKind.Regular2]: balanceResistFactor,
  [EnemyKind.Elite]: balanceResistFactor,
  [EnemyKind.Boss]: 50
};

const astralBoostFactors = {
  [EnemyKind.Regular]: 0,
  [EnemyKind.Regular2]: 0,
  [EnemyKind.Elite]: 0,
  [EnemyKind.Boss]: 35
};

const astralResistFactor = 15;
const astralResistFactors = {
  [EnemyKind.Regular]: astralResistFactor,
  [EnemyKind.Regular2]: astralResistFactor,
  [EnemyKind.Elite]: astralResistFactor,
  [EnemyKind.Boss]: 80
};

const standardBoosts = new Map<School, Map<School, Record<EnemyKind, number>>>([
  [School.Fire, new Map([
    [School.Ice, standardBoostFactors]
  ])],
  [School.Ice, new Map([
    [School.Fire, standardBoostFactors]
  ])],
  [School.Storm, new Map([
    [School.Myth, standardBoostFactors]
  ])],
  [School.Life, new Map([
    [School.Death, standardBoostFactors]
  ])],
  [School.Death, new Map([
    [School.Life, standardBoostFactors]
  ])],
  [School.Myth, new Map([
    [School.Storm, standardBoostFactors]
  ])],
  [School.Balance, new Map([
    [School.Life, balanceBoostFactors],
    [School.Death, balanceBoostFactors],
    [School.Myth, balanceBoostFactors],
  ])],
  [School.Stellar, new Map([
    [School.Myth, astralBoostFactors],
    [School.Life, astralBoostFactors],
  ])],
  [School.Lunar, new Map([
    [School.Ice, astralBoostFactors],
    [School.Life, astralBoostFactors],
  ])],
  [School.Solar, new Map([
    [School.Ice, astralBoostFactors],
    [School.Storm, astralBoostFactors],
  ])],
  [School.Shadow, new Map]
]);

const standardResists = new Map<School, Map<School, Record<EnemyKind, number>>>([
  [School.Fire, new Map([
    [School.Fire, standardResistFactors]
  ])],
  [School.Ice, new Map([
    [School.Ice, standardResistFactors]
  ])],
  [School.Storm, new Map([
    [School.Storm, standardResistFactors]
  ])],
  [School.Life, new Map([
    [School.Life, standardResistFactors]
  ])],
  [School.Death, new Map([
    [School.Death, standardResistFactors]
  ])],
  [School.Myth, new Map([
    [School.Myth, standardResistFactors]
  ])],
  [School.Balance, new Map([
    [School.Balance, balanceResistFactors]
  ])],
  [School.Stellar, new Map([
    [School.Ice, astralResistFactors],
  ])],
  [School.Lunar, new Map([
    [School.Ice, astralResistFactors],
  ])],
  [School.Solar, new Map([
    [School.Ice, astralResistFactors],
  ])],
  [School.Shadow, new Map]
]);

const advancedBoosts = new Map<School, Map<School, Record<EnemyKind, number>>>([

]);

const advancedResists = new Map<School, Map<School, Record<EnemyKind, number>>>([

]);

function getDamageModifierMap({ schools, kind }: EnemyDescriptor, globalMap: Map<School, Map<School, Record<EnemyKind, number>>>): Map<School, number> {
  const finalModifierMap = new Map<School, number>;
  for (const school of schools) {
    const modifierMap = globalMap.get(school);
    if (modifierMap === undefined) continue;

    for (const [against, damageModifiers] of modifierMap) {
      if (finalModifierMap.has(against)) continue;
      finalModifierMap.set(against, damageModifiers[kind]);
    }
  }

  return finalModifierMap;
}

export function getBoosts(descriptor: EnemyDescriptor): Map<School, number> {
  if (descriptor.boostKind === DamageModifierKind.Custom)
    return descriptor.boosts;

  const globalModifierMap = descriptor.boostKind === DamageModifierKind.Standard ? standardBoosts : advancedBoosts;
  return getDamageModifierMap(descriptor, globalModifierMap);
}

export function getResists(descriptor: EnemyDescriptor): Map<School, number> {
  if (descriptor.resistKind === DamageModifierKind.Custom)
    return descriptor.resists;

  const globalModifierMap = descriptor.resistKind === DamageModifierKind.Standard ? standardResists : advancedResists;
  return getDamageModifierMap(descriptor, globalModifierMap);
}