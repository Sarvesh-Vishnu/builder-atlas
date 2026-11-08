import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { ProblemCard } from "./schema";

const DIR = join(__dirname, "../../content/problems");
const files = readdirSync(DIR).filter((f) => f.endsWith(".yaml"));

describe("problem cards", () => {
  it("has cards", () => expect(files.length).toBeGreaterThan(0));

  for (const f of files) {
    it(`${f} fits the schema`, () => {
      const res = ProblemCard.safeParse(parse(readFileSync(join(DIR, f), "utf8")));
      if (!res.success) throw new Error(res.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n"));
      expect(res.data.id + ".yaml").toBe(f);
    });
  }

  it("ids are unique", () => {
    const ids = files.map((f) => parse(readFileSync(join(DIR, f), "utf8")).id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("schema gates", () => {
  const base = parse(`
id: x
title: A test card
oneLine: A sentence long enough.
who: { text: Somebody somewhere. }
evidence:
  - { claim: "A claim with a figure 10%.", source: { title: Report, publisher: Org, url: "https://example.org/r", asOf: "2024" } }
  - { claim: "Another claim with a figure.", source: { title: Report, publisher: Org, url: "https://example.org/r", asOf: "2024" } }
archetypes: [aging]
supply: [{ name: A, kind: ngo, what: Does a thing, url: "https://example.org" }]
payers: [{ who: Gov, type: state, why: Because it pays. }]
graveyardNote: None documented.
blockers: [payer]
lenses:
  profit: { score: 2, why: Some reason here. }
  meaning: { score: 3, why: Some reason here. }
  purpose: { score: 4, why: Some reason here. }
skills: [software]
timeToFirstValue: months
capital: low
crowding: { level: some, note: A few players. }
buildAngles: [Build the first thing, Build the second thing]
firstConversations: [Talk to the first group, Talk to the second group]
`);

  it("accepts a well-formed card", () => expect(ProblemCard.safeParse(base).success).toBe(true));
  it("rejects a claim without a source url", () => {
    const c = structuredClone(base);
    delete c.evidence[0].source.url;
    expect(ProblemCard.safeParse(c).success).toBe(false);
  });
  it("rejects plain http sources", () => {
    const c = structuredClone(base);
    c.evidence[0].source.url = "http://example.org";
    expect(ProblemCard.safeParse(c).success).toBe(false);
  });
  it("rejects an empty supply with no note", () => {
    const c = structuredClone(base);
    c.supply = [];
    expect(ProblemCard.safeParse(c).success).toBe(false);
  });
  it("rejects an empty graveyard with no note", () => {
    const c = structuredClone(base);
    delete c.graveyardNote;
    expect(ProblemCard.safeParse(c).success).toBe(false);
  });
  it("rejects a single piece of evidence", () => {
    const c = structuredClone(base);
    c.evidence = c.evidence.slice(0, 1);
    expect(ProblemCard.safeParse(c).success).toBe(false);
  });
});
