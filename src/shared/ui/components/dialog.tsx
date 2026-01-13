import Vide, { source, Source } from "@rbxts/vide";
import type { BaseID } from "@rbxts/id";

import { Message, messaging } from "shared/messaging";
import { Images } from "../utility/images";
import { anchorPoints, positions } from "../utility/positioning";
import { getDialogByID, getNpcByID } from "shared/utility/npc";
import { getQuestByID, hasQuest } from "shared/utility/quests";
import { usePx } from "../hooks/use-px";
import { palette } from "../palette";
import type { CharacterData } from "shared/structs/data";
import type { DialogDescriptor, DialogID } from "shared/structs/npc/dialog";

import { WizText } from "./wiz-text";
import { WizButton } from "./wiz-button";

interface DialogProps extends BaseID<Source<Maybe<DialogID>>> {
  readonly character: Source<CharacterData>
}

export function Dialog({ id, character }: DialogProps): Vide.Node {
  const px = usePx();
  const paragraphIndex = source(0);
  const getDialog = () => id() !== undefined ? getDialogByID(id()!) : undefined;
  const closeDialog = () => id(undefined);
  const portraitImage = () => {
    const dialog = getDialog();
    if (!dialog) return "";

    const npc = getNpcByID(dialog.speaker);
    return npc.portrait;
  }
  const titleText = () => {
    const dialog = getDialog();
    if (!dialog) return "";

    const npc = getNpcByID(dialog.speaker);
    return npc.name;
  }
  const bodyText = () => {
    const dialog = getDialog();
    if (!dialog) return "";

    return dialog.paragraphs[paragraphIndex()];
  }
  const isOnLastParagraph = (dialog: DialogDescriptor) => paragraphIndex() + 1 === dialog.paragraphs.size();
  const canAcceptQuest = (dialog: DialogDescriptor) => dialog.givesQuest !== undefined && !hasQuest(character(), dialog.givesQuest);
  const advanceButtonText = () => {
    const dialog = getDialog();
    if (!dialog) return "";

    return isOnLastParagraph(dialog)
      ? canAcceptQuest(dialog)
        ? "Accept"
        : "Done"
      : "Next";
  }
  const canDecline = () => {
    const dialog = getDialog();
    if (!dialog) return false;

    return isOnLastParagraph(dialog)
      && dialog.givesQuest !== undefined
      && !getQuestByID(dialog.givesQuest).main;
  }
  const advance = () => {
    const dialog = getDialog();
    if (!dialog) return;

    if (isOnLastParagraph(dialog)) {
      closeDialog();
      if (canAcceptQuest(dialog))
        messaging.server.emit(Message.Quest_PickUp, {
          id: dialog.givesQuest!,
          npcID: dialog.speaker,
        });

      return;
    }

    paragraphIndex(paragraphIndex() + 1);
  }

  const rightPad = 0.08;
  const buttonYOffset = 0.02;
  const buttonSize = UDim2.fromOffset(px(120), px(33));
  return (
    <imagelabel Name="DialogContainer"
      AnchorPoint={anchorPoints.bottomCenter}
      Position={positions.bottomCenter.sub(UDim2.fromScale(0, buttonYOffset))}
      BackgroundTransparency={1}
      Size={UDim2.fromScale(0.5, 0.5)}
      Visible={() => id() !== undefined}
      Image={Images.Background_Dialog}
    >
      <uiaspectratioconstraint AspectRatio={4} />
      <imagelabel Name="PortraitBorder"
        AnchorPoint={anchorPoints.leftCenter}
        Position={positions.leftCenter}
        BackgroundTransparency={1}
        Size={UDim2.fromScale(0.95, 0.95)}
        Image={portraitImage}
        ZIndex={2}
      >
        <uiaspectratioconstraint />
      </imagelabel>
      <WizText name="Title"
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter.add(UDim2.fromScale(0, 0.06))}
        size={UDim2.fromScale(0.55, 0.15)}
        alignX={Enum.TextXAlignment.Left}
        textScaled={true}
        textColor={palette.black}
        text={titleText}
        zIndex={1}
      />
      <WizText name="Body"
        anchorPoint={anchorPoints.bottomRight}
        position={positions.bottomRight.sub(UDim2.fromScale(rightPad, 0.19))}
        size={UDim2.fromScale(0.675, 0.55)}
        textSize={px(18)}
        textWrap={true}
        font={Enum.Font.Cartoon}
        alignX={Enum.TextXAlignment.Left}
        textColor={palette.black}
        text={bodyText}
        zIndex={1}
      />
      <WizButton
        anchorPoint={anchorPoints.bottomLeft}
        position={positions.bottomLeft.add(UDim2.fromScale(0.25, buttonYOffset))}
        size={buttonSize}
        visible={() => paragraphIndex() > 0}
        text="Back"
        activated={() => paragraphIndex(paragraphIndex() - 1)}
      />
      <WizButton
        anchorPoint={anchorPoints.bottomLeft}
        position={positions.bottomLeft.add(UDim2.fromScale(0.25, buttonYOffset))}
        size={buttonSize}
        visible={canDecline}
        text="Decline"
        activated={closeDialog}
      />
      <WizButton
        anchorPoint={anchorPoints.bottomRight}
        position={positions.bottomRight.sub(UDim2.fromScale(rightPad, -buttonYOffset))}
        size={buttonSize}
        text={advanceButtonText}
        activated={advance}
      />
    </imagelabel>
  );
}