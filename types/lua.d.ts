interface String {
  lower<T extends string>(this: T): Lowercase<T>;
  upper<T extends string>(this: T): Uppercase<T>;
}

declare function pairs<K extends string | number, V>(
  object: Readonly<Record<K, V>>,
): IterableFunction<LuaTuple<[Exclude<K, undefined>, Exclude<V, undefined>]>>;

declare function require<T = unknown>(moduleScript: ModuleScript | number): T;