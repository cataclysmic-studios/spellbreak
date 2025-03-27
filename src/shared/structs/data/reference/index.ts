export interface ReferenceWithData<T, Reference extends number = number> {
  readonly reference: Reference;
  readonly data: T;
}