import { tween } from "@rbxts/instance-utility";

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