import { describe, expect, it } from "vitest";
import { render } from "./entry-server";
import { allRoutes, metaFor } from "./site";
import { COUNTRIES } from "./data/countries";
import { PROBLEMS } from "./content/load";
import { RULES } from "./engine/archetype";
import { W } from "./engine/fit";

const routes = allRoutes();

describe("pre-rendered pages", () => {
  it("covers every page, problem and country", () => {
    expect(routes.length).toBe(7 + PROBLEMS.length + COUNTRIES.length);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it.each(routes)("%s renders one non-empty h1 and its own title", (route) => {
    const html = render(route);
    const h1s = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) ?? [];
    expect(h1s).toHaveLength(1);
    expect((h1s[0] ?? "").replace(/<[^>]+>/g, "").trim().length).toBeGreaterThan(2);
    expect(html).not.toContain("No such");
    expect(metaFor(route).title).not.toMatch(/^Not found/);
  });

  it("unknown routes render the not-found page", () => {
    expect(render("/country/QQQ").replace(/<!-- -->/g, "")).toContain("No such country profile");
    expect(metaFor("/nope").title).toMatch(/^Not found/);
  });

  it("the method page states the thresholds and weights the engines use", () => {
    const html = render("/method").replace(/<!-- -->/g, "");
    for (const r of RULES) expect(html).toContain(`≥ ${r.threshold} ${r.unit}`);
    expect(html).toContain(`${Math.round(W.lens * 100)}% how well the problem matches`);
  });
});
