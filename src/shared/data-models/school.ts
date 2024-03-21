export type PlayableSchool = keyof Omit<typeof School, "Solar" | "Lunar" | "Stellar" | "Shadow">;

export const enum School {
  Fire = "Fire",
  Frost = "Frost",
  Storm = "Storm",
  Life = "Life",
  Death = "Death",
  Myth = "Myth",
  Balance = "Balance",
  Solar = "Solar",
  Lunar = "Lunar",
  Stellar = "Stellar",
  Shadow = "Shadow"
}

export namespace SchoolUtil {
  // TODO: astral schools + extra boosts
  export function doesBoost(schoolA: School, schoolB: School): boolean {
    switch (schoolA) {
      case School.Fire:
        return schoolB === School.Frost;
      case School.Frost:
        return schoolB === School.Fire;
      case School.Storm:
        return schoolB === School.Myth;
      case School.Life:
        return schoolB === School.Death;
      case School.Death:
        return schoolB === School.Life;
      case School.Myth:
        return schoolB === School.Storm;
    }
    return false;
  }

  // TODO: astral schools
  export function doesResist(schoolA: School, schoolB: School): boolean {
    return schoolA === schoolB;
  }
}