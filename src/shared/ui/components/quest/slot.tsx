import Vide from "@rbxts/vide";

import { palette } from "shared/ui/palette";
import type { QuestInfo } from "shared/structs/quests";

import { Container } from "shared/ui/utility/components/container";
import { QuestBackgroundArt } from "./background-art";
import { QuestFrame } from "./frame";

interface QuestSlotProps {
  readonly info?: QuestInfo
  readonly slot: 1 | 2 | 3 | 4;
}

export function QuestSlot({ info, slot }: QuestSlotProps): Vide.Node {
  return (
    <Container name="QuestSlot" size={UDim2.fromScale(0.5, 0.5)} color={palette.black} transparency={0}>
      {
        info !== undefined
          ? <QuestFrame info={info} layoutOrder={slot} />
          : <QuestBackgroundArt slot={slot} />
      }
    </Container>
  )
}