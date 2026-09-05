/** Tracks one combatant's HP for the duration of a single duel - ephemeral, not persisted. */
export class CombatantHealth {
  private current: number;

  public constructor(public readonly max: number) {
    this.current = max;
  }

  public getCurrent(): number {
    return this.current;
  }

  public isDefeated(): boolean {
    return this.current <= 0;
  }

  /** Applies up to `amount` damage, clamped to what's left. Returns the amount actually dealt. */
  public damage(amount: number): number {
    const applied = math.min(amount, this.current);
    this.current -= applied;
    return applied;
  }

  /** Restores up to `amount` HP, clamped to `max`. Returns the amount actually restored. */
  public heal(amount: number): number {
    const applied = math.min(amount, this.max - this.current);
    this.current += applied;
    return applied;
  }
}
