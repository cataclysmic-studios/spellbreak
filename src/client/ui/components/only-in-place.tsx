import Vide, { Node, Show } from "@rbxts/vide";
import { PlaceID } from "shared/structs/place-id";

interface OnlyInPlaceProps {
  readonly placeID: PlaceID;
  readonly children: () => Node | void;
}

export function OnlyInPlace({ placeID, children }: OnlyInPlaceProps) {
  return (
    <Show when={() => game.PlaceId === placeID}>
      {children}
    </Show>
  );
}