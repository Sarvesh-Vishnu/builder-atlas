import { useSearchParams } from "react-router-dom";
import { ARCHETYPES } from "../engine/archetype";
import { ARCHETYPE_IDS } from "../content/schema";
import { COUNTRIES, type Country } from "../data/countries";
import { CLASS } from "../data/derived";
import { archColor } from "../components/bits";
import { people } from "../format";

const BLOCK = 10_000_000;

interface Group {
  key: string;
  label: string;
  color: string;
  people: number;
  note?: string;
}

type Split = (c: Country, pop: number) => { key: string; n: number }[];

const LENSES: Record<string, { label: string; note: string; groups: { key: string; label: string; color: string }[]; split: Split }> = {
  economy: {
    label: "Economy type",
    note: "Everyone, grouped by the primary economy type of the country they live in.",
    groups: ARCHETYPE_IDS.map((id) => ({ key: id, label: ARCHETYPES[id].name, color: archColor(id) })),
    split: (c, pop) => [{ key: CLASS.get(c.iso3)!.primary.id, n: pop }],
  },
  income: {
    label: "Country income",
    note: "World Bank income group of the country each person lives in. A rich country still has poor people; this is the country's level, not the person's.",
    groups: [
      { key: "Low income", label: "Low income", color: "var(--seq-4)" },
      { key: "Lower middle income", label: "Lower middle income", color: "var(--seq-3)" },
      { key: "Upper middle income", label: "Upper middle income", color: "var(--seq-2)" },
      { key: "High income", label: "High income", color: "var(--seq-1)" },
    ],
    split: (c, pop) => [{ key: c.incomeGroup, n: pop }],
  },
  age: {
    label: "Age",
    note: "Each country's population split by its share under 15 and 65+.",
    groups: [
      { key: "child", label: "Under 15", color: "var(--a-tourism)" },
      { key: "working", label: "15 to 64", color: "var(--a-services)" },
      { key: "older", label: "65 and over", color: "var(--a-aging)" },
    ],
    split: (c, pop) => {
      const u = c.metrics.under15?.[0];
      const o = c.metrics.over65?.[0];
      if (u == null || o == null) return [{ key: "unknown", n: pop }];
      return [
        { key: "child", n: (pop * u) / 100 },
        { key: "older", n: (pop * o) / 100 },
        { key: "working", n: (pop * (100 - u - o)) / 100 },
      ];
    },
  },
  online: {
    label: "Online",
    note: "Each country's population split by the share using the internet (ITU, via the World Bank). Includes children, so read it as a rough count of people a web or app product cannot yet reach.",
    groups: [
      { key: "online", label: "Online", color: "var(--a-services)" },
      { key: "offline", label: "Offline", color: "var(--a-manufacturing)" },
    ],
    split: (c, pop) => {
      const i = c.metrics.internet?.[0];
      if (i == null) return [{ key: "unknown", n: pop }];
      return [
        { key: "online", n: (pop * i) / 100 },
        { key: "offline", n: (pop * (100 - i)) / 100 },
      ];
    },
  },
};

export function People() {
  const [params, setParams] = useSearchParams();
  const lensKey = params.get("by") ?? "economy";
  const lens = LENSES[lensKey] ?? LENSES.economy;

  const totals = new Map<string, number>();
  let world = 0;
  for (const c of COUNTRIES) {
    const pop = c.metrics.population?.[0];
    if (!pop) continue;
    world += pop;
    for (const { key, n } of lens.split(c, pop)) totals.set(key, (totals.get(key) ?? 0) + n);
  }
  const groups: Group[] = [
    ...lens.groups.map((g) => ({ ...g, people: totals.get(g.key) ?? 0 })),
    ...(totals.get("unknown") ? [{ key: "unknown", label: "No data", color: "var(--nodata)", people: totals.get("unknown")! }] : []),
  ].filter((g) => g.people > 0);

  return (
    <div className="wrap">
      <div className="eyebrow">The people</div>
      <h1>{people(world)} people, regrouped</h1>
      <p className="lede">Each square is ten million people. Pick a way to group them and see who the world actually is before deciding who to build for.</p>

      <div className="chips" role="group" aria-label="Group people by" style={{ margin: "22px 0 10px" }}>
        {Object.entries(LENSES).map(([k, l]) => (
          <button key={k} className="chip" aria-pressed={k === lensKey} onClick={() => setParams({ by: k })}>
            {l.label}
          </button>
        ))}
      </div>
      <p className="small muted">{lens.note}</p>

      <div className="groups" style={{ marginTop: 22 }}>
        {groups.map((g) => (
          <div key={g.key}>
            <div className="group-head">
              <b>{g.label}</b>
              <span className="muted small">
                {people(g.people)} · {g.people / world < 0.001 ? "<0.1" : ((g.people / world) * 100).toFixed(1)}% of the world
              </span>
            </div>
            <div className="waffle" aria-hidden>
              {Array.from({ length: Math.max(1, Math.round(g.people / BLOCK)) }, (_, i) => (
                <i key={i} style={{ background: g.color }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 30 }}>
        Population and shares: World Bank World Development Indicators, latest year per country. Countries without population data are left out.
      </p>
    </div>
  );
}
