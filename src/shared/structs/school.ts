export type PlayableSchool = Exclude<School, School.Shadow | School.Stellar | School.Lunar | School.Solar>;
export enum School {
  Fire,
  Ice,
  Storm,
  Life,
  Death,
  Myth,
  Balance,
  Stellar,
  Solar,
  Lunar,
  Shadow
}