import Vide from "@rbxts/vide";

import { player } from "client/constants";
import { PlaceID } from "shared/structs/place-id";

import { OnlyInPlace } from "shared/ui/utility/components/only-in-place";
import { MainMenu } from "shared/ui/views/main-menu";

Vide.mount(() =>
(
  <OnlyInPlace placeID={PlaceID.MainMenu}>
    {() => (
      <screengui Name="MainMenu" ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets}>
        <MainMenu />
      </screengui>
    )}
  </OnlyInPlace>
),
  player.WaitForChild("PlayerGui")
);