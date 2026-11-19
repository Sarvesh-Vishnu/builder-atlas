import type { ProblemCard } from "./schema";

// Turned into JSON at build time (vite.config.ts); validated against the
// schema by src/content/content.test.ts before any deploy.
const files = import.meta.glob("../../content/problems/*.yaml", { import: "default", eager: true }) as Record<string, ProblemCard>;

// The schema's defaults for optional lists, applied here since nothing parses at runtime.
export const PROBLEMS: ProblemCard[] = Object.values(files)
  .map((c) => ({ ...c, countries: c.countries ?? [], supply: c.supply ?? [], graveyard: c.graveyard ?? [] }))
  .sort((a, b) => a.title.localeCompare(b.title));

export const PROBLEM_BY_ID = new Map(PROBLEMS.map((p) => [p.id, p]));
