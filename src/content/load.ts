import { parse } from "yaml";
import { ProblemCard } from "./schema";

const files = import.meta.glob("../../content/problems/*.yaml", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

// Cards are validated in CI; parsing again here means a bad card never renders.
export const PROBLEMS: ProblemCard[] = Object.values(files)
  .map((raw) => ProblemCard.safeParse(parse(raw)))
  .flatMap((r) => (r.success ? [r.data] : []))
  .sort((a, b) => a.title.localeCompare(b.title));

export const PROBLEM_BY_ID = new Map(PROBLEMS.map((p) => [p.id, p]));
