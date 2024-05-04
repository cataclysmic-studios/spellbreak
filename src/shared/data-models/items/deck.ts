import { Socket } from "../sockets";
import type { Spell } from "../../structs/spell";
import { type Gear, GearCategory } from "./gear";

export default class Deck implements Gear {
  public readonly category: GearCategory;

  public constructor(
    public readonly name: string,
    public readonly noAuction: boolean,
    public readonly noTrade: boolean,
    public readonly pvpOnly: boolean,
    public readonly noPvp: boolean,
    public readonly sockets: Socket[],
    public readonly maxSpells: number,
    public readonly maxSideboardSpells: number,
    public readonly maxCopies: number,
    public readonly maxSchoolCopies: number,
    public readonly spells: Spell[],
    public readonly sideboardSpells: Spell[]
  ) {
    this.category = GearCategory.Deck;
  }

  public addSpell(spell: Spell): void {
    if (this.spells.size() === this.maxSpells) return;
    this.spells.push(spell);
  }

  public removeSpell(index: number): void {
    this.spells.remove(index);
  }

  public clear(): void {
    this.spells.clear();
  }

  public addSideboardSpell(spell: Spell): void {
    if (this.sideboardSpells.size() === this.maxSpells) return;
    this.sideboardSpells.push(spell);
  }

  public removeSideboardSpell(index: number): void {
    this.sideboardSpells.remove(index);
  }

  public clearSideboard(): void {
    this.sideboardSpells.clear();
  }
}