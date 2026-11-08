import { STALE_BEFORE, type Obs } from "./data/countries";

export const pct = (n: number) => `${n >= 10 ? Math.round(n) : n.toFixed(1)}%`;

export function people(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e8 ? 0 : 1)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return Math.round(n).toString();
}

export const dollars = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export const isStale = (o: Obs | undefined) => !!o && o[1] < STALE_BEFORE;
