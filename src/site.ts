// Page titles and descriptions, shared by the pre-renderer (HTML <head>) and the
// client (document.title on navigation), plus the public addresses.
import { BY_ISO, COUNTRIES } from "./data/countries";
import { CLASS } from "./data/derived";
import { ARCHETYPES } from "./engine/archetype";
import { PROBLEMS, PROBLEM_BY_ID } from "./content/load";

export const SITE_URL = "https://sarvesh-vishnu.github.io/builder-atlas";
export const REPO_URL = "https://github.com/Sarvesh-Vishnu/builder-atlas";
export const NAME = "Builder Atlas";

const DEFAULT_DESC = "Who are you actually building for? A sourced atlas of the world's people, economies and unmet needs, for people deciding what to build.";

export interface Meta {
  title: string;
  description: string;
}

export function metaFor(pathname: string): Meta {
  const path = pathname.replace(/\/+$/, "") || "/";
  const page = (title: string, description = DEFAULT_DESC): Meta => ({ title: `${title} · ${NAME}`, description });

  if (path === "/") return { title: `${NAME}: who are you actually building for?`, description: DEFAULT_DESC };
  if (path === "/atlas") return page("How the world earns a living", "Every economy sorted by how its people earn: farming, factories, services, tourism, resources, remittances or an aging rich population.");
  if (path === "/people") return page("The people", "The world's population regrouped by economy, income, age and connection, ten million people to a square.");
  if (path === "/countries") return page("All countries", `${COUNTRIES.length} economies with their economy type, income group and population.`);
  if (path === "/problems") return page("Problems", `${PROBLEMS.length} problems with sourced evidence, who's already on them, who might pay and what has failed.`);
  if (path === "/fit") return page("Find your fit", "Rank the problems for your skills, reach, runway and what you're optimising for. Every score shows its reasons.");
  if (path === "/method") return page("How this works", "Where the data comes from, the rules that sort economies, how fit is scored, and what isn't covered yet.");

  const country = path.match(/^\/country\/([A-Za-z]{3})$/);
  if (country) {
    const c = BY_ISO.get(country[1].toUpperCase());
    if (c) {
      const k = CLASS.get(c.iso3)!;
      return page(c.name, `${c.name}: ${ARCHETYPES[k.primary.id].name.toLowerCase()} economy, ${c.incomeGroup.toLowerCase()}. Its people, where it's heading, and the problems that apply, every figure sourced.`);
    }
  }
  const problem = path.match(/^\/problems\/([a-z0-9-]+)$/);
  if (problem) {
    const p = PROBLEM_BY_ID.get(problem[1]);
    if (p) return page(p.title, p.oneLine);
  }
  return page("Not found");
}

/** Every route the pre-renderer writes. */
export function allRoutes(): string[] {
  return [
    "/",
    "/atlas",
    "/people",
    "/countries",
    "/problems",
    "/fit",
    "/method",
    ...PROBLEMS.map((p) => `/problems/${p.id}`),
    ...COUNTRIES.map((c) => `/country/${c.iso3}`),
  ];
}

/** A prefilled GitHub issue for reporting a wrong figure on a page. */
export function reportUrl(pathname: string, what: string): string {
  const q = new URLSearchParams({ template: "wrong-figure.yml", title: `Wrong figure: ${what}`, page: `${SITE_URL}${pathname}` });
  return `${REPO_URL}/issues/new?${q}`;
}
