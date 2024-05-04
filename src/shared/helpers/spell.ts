import Object from "@rbxts/object-utils";

import { Singleton } from "shared/dependencies";
import { type PlayableSchool, School } from "shared/data-models/school";
import type { Spell } from "shared/structs/spell";
import Spells from "shared/default-structs/spells";
import { flatten } from "shared/utility/array";
import Log from "shared/logger";

const ALL_SPELLS = flatten(Object.values(Spells).map(list => flatten(Object.values(list), true)), true);

@Singleton()
export default class SpellHelper {
  public findSpell(school: School, name: string): Maybe<Spell> {
    return ALL_SPELLS.find(spell => spell.school === school && spell.name === name);
  }

  public mustFindSpell(school: School, name: string): Spell {
    const spell = this.findSpell(school, name);
    if (spell === undefined)
      throw new Log.Exception("CouldNotFindSpell", `Failed to find ${school} spell "${name}"`);

    return spell;
  }

  public getFirstSpell(schoolName: PlayableSchool): Spell {
    const school = School[schoolName];
    switch (schoolName) {
      // case School.Fire: return this.mustFindSpell(school, "Flame Lynx");
      // case School.Frost: return this.mustFindSpell(school, "Flame Lynx");
      // case School.Storm: return this.mustFindSpell(school, "Flame Lynx");
      // case School.Life: return this.mustFindSpell(school, "Flame Lynx");
      // case School.Death: return this.mustFindSpell(school, "Flame Lynx");
      case School.Myth: return this.mustFindSpell(school, "Goblin");
      // case School.Balance: return this.mustFindSpell(school, "Flame Lynx");
    }
    return <Spell><unknown>undefined;
  }
}