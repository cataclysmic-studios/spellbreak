import Vide, { type Derivable, For, read } from "@rbxts/vide";
import { startsWith } from "@rbxts/string-utils";

import { School } from "shared/structs/school";
import { EnemyKind } from "shared/structs/enemy/kind";
import { nametagColors } from "shared/constants";

import { Nametag } from "../components/nametag";
import { SchoolIcon } from "../components/school-icon";

interface EnemyNametagProps {
  readonly name: Derivable<string>;
  readonly rank: Derivable<number>;
  readonly kind: Derivable<EnemyKind>;
  readonly schools: School[];
}

export function EnemyNametag({ name, rank, kind, schools }: EnemyNametagProps) {
  return (
    <Nametag
      name={name}
      description={`Rank ${rank}${startsWith(read(kind), "Regular") ? "" : " " + read(kind).upper()}`}
      color={nametagColors.enemy[read(kind)]}
    >
      <For each={() => schools}>
        {(school, index) => <SchoolIcon school={school} layoutOrder={-schools.size() + read(index)} />}
      </For>
    </Nametag>
  );
}