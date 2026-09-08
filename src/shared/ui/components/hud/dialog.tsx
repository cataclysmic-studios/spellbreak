import Vide, { derive, Show, source, Source } from "@rbxts/vide";
import type { BaseID } from "@rbxts/id";

import { Message, messaging } from "shared/messaging";
import { anchorPoints, positions } from "../../utility/positioning";
import { getNpcByID } from "shared/utility/npc";
import { getDialogByID } from "shared/utility/dialog";
import { getFirstCompletableTalkGoal, getQuestByID, getQuestGivenByDialog, hasQuest } from "shared/utility/quests";
import { usePx } from "../../hooks/use-px";
import { palette } from "../../palette";
import type { CharacterData } from "shared/structs/data";
import type { DialogDescriptor, DialogID } from "shared/structs/npc/dialog";

import { WizText } from "../wiz-text";
import { WizButton } from "../wiz-button";
import { PromptPanel } from "./prompt-panel";
import { QuestFrame } from "../quest/frame";

interface DialogProps extends BaseID<Source<Maybe<DialogID>>> {
  readonly character: Source<CharacterData>;
}

export function Dialog({ id, character }: DialogProps): Vide.Node {
  const px = usePx();
  const paragraphIndex = derive(() => {
    id();
    return source(0);
  });
  const getDialog = () => id() !== undefined ? getDialogByID(id()!) : undefined;
  const closeDialog = () => id(undefined);
  const getSpeaker = () => getDialog()?.speaker;
  const portrait = () => {
    const speaker = getSpeaker();
    if (speaker === undefined) return "";

    const npc = getNpcByID(speaker);
    return npc.portrait;
  }
  const title = () => {
    const speaker = getSpeaker();
    if (speaker === undefined) return "";

    const npc = getNpcByID(speaker);
    return npc.name;
  }
  const bodyText = () => {
    const dialog = getDialog();
    if (!dialog) return "";

    return dialog.paragraphs[paragraphIndex()()];
  }
  const isOnLastParagraph = (dialog: DialogDescriptor) => paragraphIndex()() + 1 === dialog.paragraphs.size();
  const canAcceptQuest = (dialog: DialogDescriptor) => {
    const id = getQuestGivenByDialog(dialog.id);
    return id !== undefined && !hasQuest(character(), id);
  }
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

    const id = getQuestGivenByDialog(dialog.id);
    return isOnLastParagraph(dialog)
      && id !== undefined
      && !getQuestByID(id).main;
  }
  const advance = () => {
    const dialog = getDialog();
    if (!dialog) return;

    if (isOnLastParagraph(dialog)) {
      closeDialog();
      const data = character();
      const result = getFirstCompletableTalkGoal(data, dialog.speaker);
      if (result !== undefined) {
        const { questID: id, goalIndex } = result;
        messaging.server.emit(Message.Quest_CompleteGoal, { id, goalIndex });
      } else if (canAcceptQuest(dialog))
        messaging.server.emit(Message.Quest_PickUp, {
          id: getQuestGivenByDialog(dialog.id)!,
          npcID: dialog.speaker,
        });
    }

    paragraphIndex()(paragraphIndex()() + 1);
  }
  const canGoBack = () => paragraphIndex()() > 0;
  const showGivenQuest = () => {
    const dialog = getDialog();
    if (!dialog) return false;

    return getQuestGivenByDialog(dialog.id) !== undefined && isOnLastParagraph(dialog);
  };

  const rightPad = 0.08;
  const buttonYOffset = 0.02;
  const buttonSize = UDim2.fromOffset(px(120), px(33));
  const size = px(680);
  return (
    <PromptPanel name="DialogContainer"
      anchorPoint={anchorPoints.bottomCenter}
      position={positions.bottomCenter.sub(UDim2.fromScale(0, buttonYOffset))}
      size={UDim2.fromOffset(size, size)}
      title={title}
      portrait={portrait}
      visible={() => id() !== undefined}
    >
      <Show when={showGivenQuest}>
        {() => (
          <QuestFrame
            anchorPoint={anchorPoints.topRight}
            position={positions.topRight.sub(UDim2.fromScale(rightPad / 6, 1.4))}
            size={UDim2.fromScale(1.36, 1.36)}
            info={{ questID: getQuestGivenByDialog(getDialog()!.id)!, goalIndex: 0 }}
          />
        )}
      </Show>
      <WizText name="Body"
        anchorPoint={anchorPoints.bottomRight}
        position={positions.bottomRight.sub(UDim2.fromScale(rightPad, 0.19))}
        size={UDim2.fromScale(0.675, 0.55)}
        textSize={px(18)}
        textWrap
        font={Enum.Font.Cartoon}
        alignX={Enum.TextXAlignment.Left}
        textColor={palette.black}
        text={bodyText}
      />
      <WizButton
        anchorPoint={anchorPoints.bottomLeft}
        position={positions.bottomLeft.add(UDim2.fromScale(0.25, buttonYOffset))}
        size={buttonSize}
        text={() => canGoBack() ? "Back" : "Cancel"}
        activated={() => canGoBack() ? paragraphIndex()(paragraphIndex()() - 1) : closeDialog()}
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
    </PromptPanel>
  );
}