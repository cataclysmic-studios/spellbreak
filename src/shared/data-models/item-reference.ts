export interface ItemReference<T = unknown> {
  readonly reference: string;
  readonly linkedData: T;
}