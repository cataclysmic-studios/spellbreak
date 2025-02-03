import { tween } from "@rbxts/instance-utility";

/**
 * Generates a map and a decorator that adds the target to the map, for the given object type and constructor arguments
 */
export function createMappingDecorator<T extends object, CtorArgs extends unknown[] = never[], Args extends unknown[] = []>() {
  type ObjectConstructor = new (...args: CtorArgs) => T;

  const map = new Map<string, [ObjectConstructor, Args]>;
  const decorator = (...args: Args) => <K extends ObjectConstructor>(ctor: K) => void map.set(tostring(ctor), [ctor, args]);
  return <const>[map, decorator];
}

export async function tweenPromise<T extends Instance = Instance>(
  instance: T,
  tweenInfo: TweenInfo,
  goal: Partial<ExtractMembers<T, Tweenable>>
): Promise<Tween> {
  const t = tween(instance, tweenInfo, goal);
  await promisifyEvent(t.Completed);
  return t;
}

export async function promisifyEvent<Args extends unknown[]>(event: RBXScriptSignal<(...args: Args) => void>): Promise<Args> {
  return new Promise(resolve => event.Once((...args) => resolve(args)));
}