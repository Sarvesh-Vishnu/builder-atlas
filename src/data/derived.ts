import { classify, type Classification } from "../engine/archetype";
import { COUNTRIES } from "./countries";

export const CLASS = new Map<string, Classification>(COUNTRIES.map((c) => [c.iso3, classify(c)]));

/** ISO-3s whose primary or secondary archetype is the given one. */
export function countriesOf(id: string): string[] {
  return COUNTRIES.filter((c) => {
    const k = CLASS.get(c.iso3)!;
    return k.primary.id === id || k.secondary?.id === id;
  }).map((c) => c.iso3);
}
