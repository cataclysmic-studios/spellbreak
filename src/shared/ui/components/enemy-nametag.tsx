import Vide, { type Derivable, For, read } from "@rbxts/vide";
import { startsWith } from "@rbxts/string-utils";

import { nametagColors } from "shared/constants";
import type { EnemyDescriptor } from "shared/structs/enemy/descriptor";

import { Nametag } from "./nametag";
import { SchoolIcon } from "./school-icon";

interface EnemyNametagProps {
  readonly descriptor: Pick<EnemyDescriptor, "name" | "rank" | "kind" | "schools">;
  readonly containerSize: Derivable<Vector2>;
}

export function EnemyNametag({ descriptor: { name, rank, kind, schools }, containerSize }: EnemyNametagProps): Vide.Node {
  return (
    <Nametag name={name}
      description={`Rank ${rank}${startsWith(read(kind), "Regular") ? "" : " " + read(kind).upper()}`}
      color={nametagColors.enemy[read(kind)]}
      containerSize={containerSize}
    >
      <For each={() => schools}>
        {(school, index) => <SchoolIcon school={school} layoutOrder={-schools.size() + read(index)} />}
      </For>
    </Nametag>
  );
}