import { Controller, type OnStart } from "@flamework/core";
import Vide, { mount, source } from "@rbxts/vide";
import { StarterGui } from "@rbxts/services";
import { Timer } from "@rbxts/timer";

import { playerGui } from "client/constants";
import { defaultData, timerLength } from "shared/constants";
import { PlaceID } from "shared/structs/place-id";
import type { DialogID } from "shared/structs/npc/dialog";
import type { Interactable } from "shared/structs/interactable";
import type { ActiveDuelState, ClientDuelInfo } from "shared/structs/duel";
import Log from "shared/log";

import { OnlyInPlace } from "shared/ui/utility/components/only-in-place";
import { MainMenu } from "shared/ui/views/main-menu";
import { HUD, type HudProps } from "shared/ui/views/hud";
import { BookPage } from "shared/ui/components/spellbook";

import type { CharacterController } from "./character";
import type { InputController } from "./input";
import type { ReplicaController } from "./replica";
import type { ZoneController } from "./zone";

@Controller()
export class UIController implements OnStart {
  private readonly hudState: HudProps;

  public constructor(
    character: CharacterController,
    replica: ReplicaController,
    zone: ZoneController,
    private readonly input: InputController
  ) {
    this.hudState = {
      player: source(defaultData),
      characterIndex: character.getIndex(),
      bookOpen: source(false),
      bookPage: source<BookPage>(BookPage.Options),
      activeDialog: source<Maybe<DialogID>>(undefined),
      activeInteractable: source<Maybe<Interactable>>(undefined),
      duelStarted: source(false),
      activeDuel: source<Maybe<ActiveDuelState>>(undefined),
      currentZone: zone.currentZone
    };
    replica.updated.Connect(() => this.hudState.player(replica.data));
  }

  public onStart(): void {
    StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.All, false);

    mount(() => <>
      <OnlyInPlace placeID={PlaceID.MainMenu}>
        {() => (
          <screengui Name="MainMenu" ScreenInsets="DeviceSafeInsets" ResetOnSpawn={false}>
            <MainMenu />
          </screengui>
        )}
      </OnlyInPlace>
      <OnlyInPlace placeID={PlaceID.InGame}>
        {() => (
          <screengui Name="HUD" ZIndexBehavior="Global" ScreenInsets="DeviceSafeInsets" ResetOnSpawn={false}>
            <HUD {...this.hudState} />
          </screengui>
        )}
      </OnlyInPlace>
    </>, playerGui);
    Log.info("Mounted game UI");

    const { actions } = this.input;
    const bookPageBindings = [
      [actions.openDeck, BookPage.Deck],
      [actions.openPets, BookPage.Pets],
      [actions.openCrafting, BookPage.Crafting],
      [actions.openBackpack, BookPage.Backpack],
      [actions.openQuests, BookPage.Quests],
      [actions.openCharacter, BookPage.Character],
      [actions.openMap, BookPage.Map],
      [actions.openOptions, BookPage.Options],
    ] as const;
    for (const [action, page] of bookPageBindings)
      action.activated.Connect(() => this.openBookToPage(page));
  }

  private openBookToPage(page: BookPage): void {
    const { bookOpen, bookPage } = this.hudState;
    if (bookOpen() && bookPage() === page) {
      bookOpen(false);
      return;
    }

    bookPage(page);
    bookOpen(true);
  }

  public createDialog(id: DialogID): void {
    Log.info("Created dialog with ID " + id);
    this.hudState.activeDialog(id);
  }

  public enableInteractPrompt(interactable: Interactable): void {
    this.hudState.activeInteractable(interactable);
  }

  public disableInteractPrompt(): void {
    this.hudState.activeInteractable(undefined);
  }

  /** A duel's just started - hides the main HUD immediately, ahead of the camera actually finishing its ease into the planning pose (see `showDuelPlanning`). */
  public beginDuel(): void {
    this.hudState.duelStarted(true);
  }

  public showDuelPlanning(info: ClientDuelInfo): void {
    const timer = new Timer(timerLength);
    timer.start();
    this.hudState.activeDuel({ info, timer: () => timer, planning: source(true) });
  }

  /** Casting's begun - drops the `DuelPlanning` subview, but leaves `activeDuel` set so the main HUD stays hidden through the rest of combat. */
  public hideDuelPlanning(): void {
    this.hudState.activeDuel()?.planning(false);
  }

  public endDuel(): void {
    this.hudState.duelStarted(false);
    this.hudState.activeDuel(undefined);
  }
}