// Ranks problem cards for one builder. Deterministic and explainable: every
// point of the score traces to a reason line. Anything the builder hasn't told
// us scores neutral, never as a match.
import type { ArchetypeId, ProblemCard, Skill } from "../content/schema";

export type Runway = "weekends" | "months" | "years";
export type Capital = "low" | "medium" | "high";

export interface Lenses {
  profit: number;
  meaning: number;
  purpose: number;
}

export interface Builder {
  skills: Skill[];
  /** Countries you live in, come from, or can reach people in. */
  countries: string[];
  /** Kinds of economy you know (derived from countries, or picked directly). */
  archetypes: ArchetypeId[];
  runway: Runway;
  capital: Capital;
  lenses: Lenses;
}

export interface FitResult {
  card: ProblemCard;
  score: number;
  parts: { lens: number; skills: number; access: number; fitPenalty: number; crowding: number };
  reasons: string[];
}

/** Score weights and adjustments; the method page renders these. */
export const W = { lens: 0.5, skills: 0.25, access: 0.25 };
export const NEUTRAL = 0.5;
export const ACCESS = { near: 1, kin: 0.7, far: 0.2 };
export const PENALTY = { runwayOneStep: 0.8, runwayTwoSteps: 0.6, capital: 0.75 };
export const CROWDING = { sparse: 3, crowded: -5 };
const RUNWAY_RANK: Record<Runway, number> = { weekends: 0, months: 1, years: 2 };
const TTV_RANK = { weeks: 0, months: 1, years: 2 } as const;
const CAPITAL_RANK: Record<Capital, number> = { low: 0, medium: 1, high: 2 };

export function normalise(l: Lenses): Lenses {
  const sum = l.profit + l.meaning + l.purpose;
  if (sum <= 0) return { profit: 1 / 3, meaning: 1 / 3, purpose: 1 / 3 };
  return { profit: l.profit / sum, meaning: l.meaning / sum, purpose: l.purpose / sum };
}

export function scoreCard(card: ProblemCard, b: Builder): FitResult {
  const reasons: string[] = [];
  const w = normalise(b.lenses);

  const lens = (w.profit * card.lenses.profit.score + w.meaning * card.lenses.meaning.score + w.purpose * card.lenses.purpose.score) / 5;
  const order = (Object.keys(w) as (keyof Lenses)[]).sort((a, z) => w[z] - w[a]);
  const top = order[0];
  if (w[top] - w[order[2]] < 0.01) reasons.push(`lenses even: profit ${card.lenses.profit.score}, meaning ${card.lenses.meaning.score}, purpose ${card.lenses.purpose.score} (of 5)`);
  else reasons.push(`${top} ${card.lenses[top].score}/5 on the lens you weighted most`);

  let skills = NEUTRAL;
  if (b.skills.length) {
    const have = card.skills.filter((s) => b.skills.includes(s));
    skills = have.length / card.skills.length;
    reasons.push(have.length ? `you bring ${have.join(", ")} (${have.length} of ${card.skills.length} skills it needs)` : `needs ${card.skills.join(", ")}, none of which you listed`);
  }

  let access = NEUTRAL;
  if (b.countries.length || b.archetypes.length) {
    const near = card.countries.filter((c) => b.countries.includes(c));
    const kin = card.archetypes.filter((a) => b.archetypes.includes(a));
    if (near.length) {
      access = ACCESS.near;
      reasons.push(`acute in ${near.join(", ")}, where you have reach`);
    } else if (kin.length) {
      access = ACCESS.kin;
      reasons.push(`common in ${kin.join("/")} economies, which you know`);
    } else {
      access = ACCESS.far;
      reasons.push("far from the places you listed — you'd need a local partner");
    }
  }

  let fitPenalty = 1;
  if (TTV_RANK[card.timeToFirstValue] > RUNWAY_RANK[b.runway]) {
    fitPenalty *= TTV_RANK[card.timeToFirstValue] - RUNWAY_RANK[b.runway] === 2 ? PENALTY.runwayTwoSteps : PENALTY.runwayOneStep;
    reasons.push(`first value takes ${card.timeToFirstValue}; you have ${b.runway}`);
  }
  if (CAPITAL_RANK[card.capital] > CAPITAL_RANK[b.capital]) {
    fitPenalty *= PENALTY.capital;
    reasons.push(`needs ${card.capital} capital; you have ${b.capital}`);
  }

  const crowding = card.crowding.level === "sparse" ? CROWDING.sparse : card.crowding.level === "crowded" ? CROWDING.crowded : 0;
  if (crowding) reasons.push(card.crowding.level === "sparse" ? "few others are building here" : "crowded — find the corner others miss");

  const base = (W.lens * lens + W.skills * skills + W.access * access) * 100;
  const score = Math.max(0, Math.min(100, Math.round(base * fitPenalty + crowding)));
  return { card, score, parts: { lens, skills, access, fitPenalty, crowding }, reasons };
}

export function rank(cards: ProblemCard[], b: Builder): FitResult[] {
  return cards.map((c) => scoreCard(c, b)).sort((a, z) => z.score - a.score || a.card.title.localeCompare(z.card.title));
}
