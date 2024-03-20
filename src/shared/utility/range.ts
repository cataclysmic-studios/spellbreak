export default class Range {
  public constructor(
    public readonly minimum: number,
    public readonly maximum: number = minimum
  ) {}

  public numberIsWithin(n: number): boolean {
    return n >= this.minimum && n <= this.maximum;
  }

  public numberIsExclusivelyWithin(n: number): boolean {
    return n > this.minimum && n < this.maximum;
  }
}