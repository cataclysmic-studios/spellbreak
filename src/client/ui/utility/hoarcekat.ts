import Vide from "@rbxts/vide";

/**
 * Returns a function that can be used as a Hoarcekat story. This function will
 * mount the given component to the target instance and unmount it when the
 * story is unmounted.
 * @param TestComponent The component to mount.
 * @returns A Hoarcekat story.
 */
export function hoarcekat(TestComponent: () => Vide.Node) {
  return (target: Instance) => Vide.mount(TestComponent, target);
}