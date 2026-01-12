import { RunService } from "@rbxts/services";
import Vide from "@rbxts/vide";

declare const _G: Record<string, unknown>;

if (RunService.IsStudio()) {
  _G.__DEV__ = true;
  Vide.strict = true;
}