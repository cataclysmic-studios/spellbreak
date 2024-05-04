import { slice } from "@rbxts/string-utils";

/**
 * Takes a slug-string and converts it into PascalCase
 */
export function slugToPascal(slug: string): string {
  return slug.split("-")
    .map(word => word.sub(1, 1).upper() + slice(word, 1))
    .join("");
}

/**
 * Takes a camelCase string and converts it into spaced text
 */
export function camelCaseToSpaced(camelCased: string): string {
  return camelCased.gsub("%u", " %1")[0];
}

/**
 * Takes a PascalCase and converts it into paced text
 */
export function pascalCaseToSpaced(pascalCased: string): string {
  return camelCaseToSpaced(pascalCased).sub(2);
}

/**
 * Capitalizes the first letter of `text`
 */
export function capitalize(text: string): string {
  return text.gsub("^%1", s => s.upper())[0];
}

/**
 * Removes all whitespace characters from `text`
 */
export function removeWhitespace(text: string): string {
  return text.gsub("%s+", "")[0];
}

/**
 * Trims all leading & trailing whitespace characters from `text`
 */
export function trim(text: string): string {
  return text.gsub("^%s*(.-)%s*$", "%1")[0];
}

const VALID_UUID_FORMAT = [8, 4, 4, 4, 12];
export function isValidUUID(id: string, hasBraces = true): boolean {
  const length = 36 + (hasBraces ? 2 : 0);
  const firstChar = id.sub(1, 1);
  const lastChar = id.sub(length, length);
  const sections = id.sub(1 + (hasBraces ? 1 : 0), length - (hasBraces ? 1 : 0)).split("-");

  return id.size() === length
    && firstChar === "{"
    && lastChar === "}"
    && id.match("[-][0-9A-Z]")[0] !== undefined
    && sections.size() === VALID_UUID_FORMAT.size()
    && sections.reduce((valid, section) => valid && VALID_UUID_FORMAT[sections.indexOf(section)] === section.size(), true);
}