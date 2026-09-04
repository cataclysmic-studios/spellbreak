import Vide, { source, For } from "@rbxts/vide";
import Object from "@rbxts/object-utils";
import Sift from "@rbxts/sift";

import { usePx } from "shared/ui/hooks/use-px";
import type { QuestID, QuestInfo } from "shared/structs/quests";
import type { PageProps } from "..";

import { QuestSlot } from "../../quest/slot";
import { BookPageContainer } from "./book-page-container";

const QUESTS_PER_PAGE = 4;

function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];

  for (const i of $range(1, array.size(), size))
    result.push(Sift.Array.slice(array, i, i + size));

  return result;
}

function padToLength<T, F extends Maybe<T>>(array: T[], length: number, filler?: () => F): (T | F)[] {
  const result = table.clone(array);
  for (const i of $range(result.size() + 1, length))
    result[i - 1] = filler?.()!;

  return result;
}

export function QuestsPage({ character }: PageProps): Vide.Node {
  const px = usePx();
  const pageIndex = source(0);
  const quests = () => Object.keys(character().activeQuests);
  const questPages = () => chunk(quests(), QUESTS_PER_PAGE);
  const questsOnPage = () => {
    let filler = -1;
    return padToLength(questPages()[pageIndex()] ?? [], QUESTS_PER_PAGE, () => filler-- as QuestID);
  };

  return (
    <BookPageContainer>
      <uigridlayout
        CellSize={UDim2.fromScale(0.5, 0.5)}
        FillDirectionMaxCells={2}
        SortOrder="LayoutOrder"
        CellPadding={UDim2.fromOffset(0, px(10))}
        />
      <For each={questsOnPage}>
        {(quest, index) => {
          const goalIndex = character().activeQuests[quest];
          const info: Maybe<QuestInfo> = goalIndex !== undefined ? { questID: quest, goalIndex } : undefined;
          const selected = () => character().selectedQuest === quest;
          return <QuestSlot info={info} slot={index() as never} selected={selected} />
        }}
      </For>
    </BookPageContainer>
  );
}