import Vide, { type Derivable } from "@rbxts/vide";

import { Message, messaging } from "shared/messaging";
import type { QuestInfo } from "shared/structs/quests";

import { Container } from "shared/ui/utility/components/container";
import { QuestBackgroundArt } from "./background-art";
import { QuestFrame } from "./frame";

interface QuestSlotProps {
  readonly info?: QuestInfo
  readonly slot: 1 | 2 | 3 | 4;
  readonly selected?: Derivable<boolean>;
}

export function QuestSlot({ info, slot, selected }: QuestSlotProps): Vide.Node {
  return (
    <Container name="QuestSlot" size={UDim2.fromScale(0.4, 0.4)} layoutOrder={slot}>
      {
        info !== undefined
          ? <QuestFrame info={info} layoutOrder={slot} selected={selected}
              activated={() => messaging.server.emit(Message.Quest_Select, info.questID)}
            />
          : <QuestBackgroundArt slot={slot} />
      }
    </Container>
  )
}