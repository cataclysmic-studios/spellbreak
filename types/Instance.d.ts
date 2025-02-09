type ChildrenOfInstance<T extends Instance> = ExcludeKeys<ExtractMembers<T, Instance>, keyof InstanceProperties<T>>;

interface Instance {
  WaitForChild<K extends ChildrenOfInstance<this> = ChildrenOfInstance<this>>(childName: K): this[K];
  WaitForChild<K extends ChildrenOfInstance<this> = ChildrenOfInstance<this>>(childName: K, timeout: number): Maybe<this[K]>;
  WaitForChild<T extends Instance = Instance>(childName: string): T;
  WaitForChild<T extends Instance = Instance>(childName: string, timeout: number): Maybe<T>;
  FindFirstChild<K extends ChildrenOfInstance<this> = ChildrenOfInstance<this>>(childName: K, recursive?: boolean): this[K];
  FindFirstChild<T extends Instance = Instance>(childName: string | number, recursive?: boolean): Maybe<T>;
  FindFirstAncestor<T extends Instance = Instance>(name: string | number): Maybe<T>;
  FindFirstDescendant<T extends Instance = Instance>(name: string | number): Maybe<T>;
  GetAttribute<T extends AttributeValue = AttributeValue>(attribute: string): Maybe<T>;
}