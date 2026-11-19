// Where a country is heading, read from observed 20-year trends and UN/World
// Bank population projections. Signals, not forecasts: each one names the two
// numbers it compares.
import { fresh, type Country } from "../data/countries";

export interface Signal {
  id: string;
  label: string;
  detail: string;
  kind: "projection" | "trend";
}

/** Thresholds for each signal; the method page renders these. */
export const SIGNAL_RULES = {
  agingFastPts: 8,
  agingPts: 4,
  young2050Pct: 28,
  popGrowthPct: 30,
  popShrinkPct: -10,
  sectorShiftPts: 3,
  offlineBelowPct: 50,
} as const;
const T = SIGNAL_RULES;

const pts = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)} pts`;

export function trajectory(c: Country): Signal[] {
  const out: Signal[] = [];
  const { metrics: m, projections: p, trends: t } = c;

  const o65 = fresh(m.over65);
  if (o65 !== undefined && p.over65_2050) {
    const d = p.over65_2050[0] - o65;
    if (d >= T.agingFastPts) out.push({ id: "aging-fast", kind: "projection", label: "Aging fast", detail: `65+ share ${o65.toFixed(1)}% → ${p.over65_2050[0].toFixed(1)}% by 2050 (${pts(d)})` });
    else if (d >= T.agingPts) out.push({ id: "aging", kind: "projection", label: "Aging", detail: `65+ share ${o65.toFixed(1)}% → ${p.over65_2050[0].toFixed(1)}% by 2050 (${pts(d)})` });
  }

  if (p.under15_2050 && p.under15_2050[0] >= T.young2050Pct) {
    out.push({ id: "young", kind: "projection", label: "Still young in 2050", detail: `${p.under15_2050[0].toFixed(1)}% of people projected under 15 in 2050` });
  }

  const pop = fresh(m.population);
  if (pop && p.population_2050) {
    const g = (p.population_2050[0] / pop - 1) * 100;
    if (g >= T.popGrowthPct) out.push({ id: "pop-growth", kind: "projection", label: "Population growing fast", detail: `${g.toFixed(0)}% more people by 2050` });
    else if (g <= T.popShrinkPct) out.push({ id: "pop-shrink", kind: "projection", label: "Population shrinking", detail: `${Math.abs(g).toFixed(0)}% fewer people by 2050` });
  }

  const trend = (key: "manufShare" | "servicesShare" | "agriShare", up: string, down: string) => {
    const now = m[key];
    const then = t[key];
    if (!now || !then || fresh(now) === undefined) return;
    const d = now[0] - then[0];
    const detail = `${then[0].toFixed(1)}% (${then[1]}) → ${now[0].toFixed(1)}% (${now[1]}) of GDP`;
    if (d >= T.sectorShiftPts) out.push({ id: `${key}-up`, kind: "trend", label: up, detail });
    else if (d <= -T.sectorShiftPts) out.push({ id: `${key}-down`, kind: "trend", label: down, detail });
  };
  trend("manufShare", "Manufacturing rising", "Manufacturing shrinking");
  trend("servicesShare", "Services rising", "Services shrinking");
  trend("agriShare", "Farming's share rising", "Moving off the farm");

  const net = fresh(m.internet);
  if (net !== undefined && net < T.offlineBelowPct) {
    out.push({ id: "offline", kind: "trend", label: "Mostly offline", detail: `${net.toFixed(0)}% use the internet (${m.internet![1]})` });
  }
  return out;
}
