import Vide from "@rbxts/vide";

import { player } from "client/constants";

import { MainMenu } from "./views/main-menu";

Vide.mount(() =>
(
  <screengui Name="MainMenu" ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets}>
    <MainMenu />
  </screengui>
),
  player.WaitForChild("PlayerGui")
);