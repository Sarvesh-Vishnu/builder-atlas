// Economy archetypes from plain threshold rules, so every label can say why.
// A country matches every rule it clears; the strongest match (value ÷
// threshold) is its primary archetype, the next is secondary. One exception:
// the agrarian rule counts people's jobs, not output, so when it matches it
// leads (a small export base can make tourism look dominant where most people farm).
import type { ArchetypeId } from "../content/schema";
import { fresh, type Country, type Obs } from "../data/countries";

export interface ArchetypeInfo {
  id: ArchetypeId;
  name: string;
  short: string;
  /** What building for this kind of economy tends to mean. */
  builds: string;
}

export const ARCHETYPES: Record<ArchetypeId, ArchetypeInfo> = {
  agrarian: {
    id: "agrarian",
    name: "Agrarian",
    short: "A large share of people work the land.",
    builds: "Tools that reach people on basic phones, in their own language, and fit the farm calendar: prices, credit, storage, inputs, weather.",
  },
  manufacturing: {
    id: "manufacturing",
    name: "Manufacturing-led",
    short: "Factories carry a big part of the economy.",
    builds: "Worker safety and pay, supplier compliance, small-factory finance and software, skills for the next rung of the value chain.",
  },
  services: {
    id: "services",
    name: "Services-led",
    short: "Most output comes from services.",
    builds: "Productivity for small service firms, care and health access, trust and verification, the gaps between public services.",
  },
  tourism: {
    id: "tourism",
    name: "Tourism-dependent",
    short: "Visitors bring in a large share of export earnings.",
    builds: "Income smoothing through the off-season, direct booking over platform commissions, climate and coastal resilience.",
  },
  resource: {
    id: "resource",
    name: "Resource exporter",
    short: "Oil, gas, minerals or timber are a large share of GDP.",
    builds: "Transparency of resource revenue, safety and pollution monitoring, local jobs and suppliers beyond extraction.",
  },
  remittance: {
    id: "remittance",
    name: "Remittance economy",
    short: "Money sent home by workers abroad is a large share of GDP.",
    builds: "Cheaper transfers, turning remittances into savings and assets, services for migrant workers and the families left behind.",
  },
  aging: {
    id: "aging",
    name: "Aging, high income",
    short: "A rich economy with a large and growing older population.",
    builds: "Care at home, labour shortages, chronic disease, loneliness, keeping older people independent and working if they want to.",
  },
  mixed: {
    id: "mixed",
    name: "Mixed / in transition",
    short: "No single sector dominates on the thresholds used here.",
    builds: "Read the country's own trajectory: which sector is rising, how fast it is aging, who is still offline.",
  },
};

interface Rule {
  id: Exclude<ArchetypeId, "mixed">;
  threshold: number;
  /** What the rule measures, in words, for the method page. */
  measure: string;
  read: (c: Country) => { value: number; label: string; year: number } | undefined;
  unit: string;
}

const obs = (o: Obs | undefined, label: string) => {
  const v = fresh(o);
  return v === undefined || !o ? undefined : { value: v, label, year: o[1] };
};

export const RULES: Rule[] = [
  { id: "agrarian", threshold: 40, measure: "Employment in agriculture", unit: "% of jobs", read: (c) => obs(c.metrics.agriEmp, "employment in agriculture") },
  { id: "manufacturing", threshold: 18, measure: "Manufacturing value added", unit: "% of GDP", read: (c) => obs(c.metrics.manufShare, "manufacturing value added") },
  { id: "services", threshold: 60, measure: "Services value added", unit: "% of GDP", read: (c) => obs(c.metrics.servicesShare, "services value added") },
  {
    id: "tourism",
    threshold: 25,
    measure: "International tourism receipts (the 2019 figure when the latest is from 2020–21)",
    unit: "% of exports",
    // 2020–21 tourism figures were emptied by the pandemic; fall back to 2019.
    read: (c) => {
      const latest = c.metrics.tourismShare;
      if (latest && latest[1] >= 2022) return obs(latest, "tourism receipts");
      return obs(c.metrics.tourismShare2019, "tourism receipts (2019, pre-pandemic)") ?? obs(latest, "tourism receipts");
    },
  },
  { id: "resource", threshold: 12, measure: "Natural resource rents", unit: "% of GDP", read: (c) => obs(c.metrics.resourceRents, "natural resource rents") },
  { id: "remittance", threshold: 12, measure: "Personal remittances received", unit: "% of GDP", read: (c) => obs(c.metrics.remittances, "remittances received") },
  {
    id: "aging",
    threshold: 17,
    measure: "People aged 65 and over, in high-income countries only",
    unit: "% of population",
    read: (c) => (c.incomeGroup === "High income" ? obs(c.metrics.over65, "people aged 65+") : undefined),
  },
];

export interface ArchetypeMatch {
  id: ArchetypeId;
  strength: number;
  reason: string;
}

export interface Classification {
  primary: ArchetypeMatch;
  secondary?: ArchetypeMatch;
  matches: ArchetypeMatch[];
}

const fmt = (n: number) => (n >= 10 ? Math.round(n).toString() : n.toFixed(1));

export function classify(c: Country): Classification {
  const matches: ArchetypeMatch[] = [];
  for (const r of RULES) {
    const m = r.read(c);
    if (!m || m.value < r.threshold) continue;
    matches.push({
      id: r.id,
      strength: m.value / r.threshold,
      reason: `${m.label} ${fmt(m.value)}${r.unit.startsWith("%") ? "" : " "}${r.unit} (${m.year}) ≥ ${r.threshold}`,
    });
  }
  matches.sort((a, b) => (a.id === "agrarian" ? -1 : b.id === "agrarian" ? 1 : b.strength - a.strength));
  if (matches.length === 0) {
    return { primary: { id: "mixed", strength: 0, reason: "clears none of the sector thresholds" }, matches: [] };
  }
  return { primary: matches[0], secondary: matches[1], matches };
}

export function development(c: Country): "low" | "lower-middle" | "upper-middle" | "high" | "unknown" {
  switch (c.incomeGroup) {
    case "Low income":
      return "low";
    case "Lower middle income":
      return "lower-middle";
    case "Upper middle income":
      return "upper-middle";
    case "High income":
      return "high";
    default:
      return "unknown";
  }
}
