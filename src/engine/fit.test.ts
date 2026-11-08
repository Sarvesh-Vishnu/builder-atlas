import { describe, expect, it } from "vitest";
import { rank, scoreCard, type Builder } from "./fit";
import type { ProblemCard } from "../content/schema";

const card = (id: string, over: Partial<ProblemCard> = {}): ProblemCard =>
  ({
    id,
    title: id,
    oneLine: "x",
    who: { text: "x" },
    evidence: [],
    archetypes: ["aging"],
    countries: ["JPN"],
    supply: [],
    payers: [],
    graveyard: [],
    blockers: ["payer"],
    lenses: { profit: { score: 3, why: "" }, meaning: { score: 3, why: "" }, purpose: { score: 3, why: "" } },
    skills: ["software"],
    timeToFirstValue: "months",
    capital: "low",
    crowding: { level: "some", note: "" },
    buildAngles: [],
    firstConversations: [],
    ...over,
  }) as ProblemCard;

const builder = (over: Partial<Builder> = {}): Builder => ({
  skills: [],
  countries: [],
  archetypes: [],
  runway: "years",
  capital: "high",
  lenses: { profit: 1, meaning: 1, purpose: 1 },
  ...over,
});

const lucrative = card("lucrative", { lenses: { profit: { score: 5, why: "" }, meaning: { score: 1, why: "" }, purpose: { score: 1, why: "" } } });
const worthy = card("worthy", { lenses: { profit: { score: 1, why: "" }, meaning: { score: 3, why: "" }, purpose: { score: 5, why: "" } } });

describe("fit", () => {
  it("lens weights reorder the same cards", () => {
    expect(rank([lucrative, worthy], builder({ lenses: { profit: 1, meaning: 0, purpose: 0 } }))[0].card.id).toBe("lucrative");
    expect(rank([lucrative, worthy], builder({ lenses: { profit: 0, meaning: 0, purpose: 1 } }))[0].card.id).toBe("worthy");
  });

  it("unknown skills and places score neutral, not as a match", () => {
    const blank = scoreCard(card("a"), builder());
    const matched = scoreCard(card("a"), builder({ skills: ["software"], countries: ["JPN"] }));
    const missed = scoreCard(card("a"), builder({ skills: ["hardware"], countries: ["BRA"] }));
    expect(matched.score).toBeGreaterThan(blank.score);
    expect(missed.score).toBeLessThan(blank.score);
  });

  it("knowing the kind of economy counts, less than being there", () => {
    const there = scoreCard(card("a"), builder({ countries: ["JPN"] }));
    const kin = scoreCard(card("a"), builder({ archetypes: ["aging"] }));
    expect(there.score).toBeGreaterThan(kin.score);
    expect(kin.parts.access).toBe(0.7);
  });

  it("penalises a long road on a short runway, and says so", () => {
    const slow = card("slow", { timeToFirstValue: "years" });
    const r = scoreCard(slow, builder({ runway: "weekends" }));
    expect(r.parts.fitPenalty).toBe(0.6);
    expect(r.reasons.join(" ")).toContain("years");
  });

  it("penalises capital the builder doesn't have", () => {
    expect(scoreCard(card("a", { capital: "high" }), builder({ capital: "low" })).parts.fitPenalty).toBe(0.75);
  });

  it("all-zero lens weights fall back to equal", () => {
    const r = scoreCard(card("a"), builder({ lenses: { profit: 0, meaning: 0, purpose: 0 } }));
    expect(r.parts.lens).toBeCloseTo(0.6);
  });
});

describe("fit reasons", () => {
  it("doesn't claim a favourite lens when weights are even", () => {
    expect(scoreCard(card("a"), builder()).reasons[0]).toContain("lenses even");
    expect(scoreCard(card("a"), builder({ lenses: { profit: 9, meaning: 1, purpose: 1 } })).reasons[0]).toContain("weighted most");
  });
});
