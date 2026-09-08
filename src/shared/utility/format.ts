const { sub } = string;
const { floor } = math;

export function commaFormat(n: number): string {
  let s = tostring(floor(n));
  let sign = "";

  if (sub(s, 1, 1) === "-") {
    sign = "-";
    s = sub(s, 2);
  }

  const length = s.size();
  let first = length % 3;
  if (first === 0)
    first = 3;

  const result: string[] = [sign, sub(s, 1, first)];
  for (const i of $range(1 + first, length, 3)) {
    result.push(",");
    result.push(sub(s, i, 2 + i));
  }

  return result.join("");
}