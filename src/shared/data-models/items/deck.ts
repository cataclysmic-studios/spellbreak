import { Socket } from "../sockets";
import type { Spell } from "../../structs/spell";
import { type Gear, GearCategory } from "./gear";

export interface DeckData extends Gear {
  readonly maxSpells: number,
  readonly maxSideboardSpells: number,
  readonly maxCopies: number,
  readonly maxSchoolCopies: number,
  readonly spells: Spell[],
  readonly sideboardSpells: Spell[]
}

export class Deck implements DeckData {
  public readonly category: GearCategory = GearCategory.Deck;

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
  ) { }

  public static from(data: DeckData): Deck {
    return new Deck(
      data.name, data.noAuction, data.noTrade, data.pvpOnly, data.noPvp, data.sockets,
      data.maxSpells, data.maxSideboardSpells, data.maxCopies, data.maxSchoolCopies, data.spells, data.sideboardSpells
    );
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