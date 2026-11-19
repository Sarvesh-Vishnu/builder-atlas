import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { WorldMap } from "../components/WorldMap";
import { archColor } from "../components/bits";
import { ARCHETYPES } from "../engine/archetype";
import { ARCHETYPE_IDS } from "../content/schema";
import { BY_ISO, COUNTRIES, DATA, type MetricKey } from "../data/countries";
import { CLASS } from "../data/derived";
import { dollars, pct } from "../format";

const METRICS: { key: MetricKey; label: string; fmt: (n: number) => string }[] = [
  { key: "gdpPcPpp", label: "Income per person", fmt: dollars },
  { key: "agriEmp", label: "Jobs in farming", fmt: pct },
  { key: "manufShare", label: "Manufacturing share", fmt: pct },
  { key: "servicesShare", label: "Services share", fmt: pct },
  { key: "under15", label: "Under 15", fmt: pct },
  { key: "over65", label: "65 and over", fmt: pct },
  { key: "internet", label: "Online", fmt: pct },
  { key: "vulnerableEmp", label: "Vulnerable work", fmt: pct },
  { key: "account", label: "Has an account", fmt: pct },
];

const SORTED = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

/** Five quantile bins over the countries that have the metric. */
function bins(key: MetricKey): number[] {
  const vs = COUNTRIES.map((c) => c.metrics[key]?.[0]).filter((v): v is number => v != null).sort((a, b) => a - b);
  return [0.2, 0.4, 0.6, 0.8].map((q) => vs[Math.floor(q * (vs.length - 1))]);
}

export function Atlas() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const view = params.get("view") ?? "archetype";
  const metric = METRICS.find((m) => m.key === view);
  const breaks = useMemo(() => (metric ? bins(metric.key) : []), [metric]);

  const fill = (iso: string | null) => {
    const c = iso ? BY_ISO.get(iso) : undefined;
    if (!c) return "var(--nodata)";
    if (!metric) return archColor(CLASS.get(c.iso3)!.primary.id);
    const v = c.metrics[metric.key]?.[0];
    if (v == null) return "var(--nodata)";
    const i = breaks.findIndex((b) => v <= b);
    return `var(--seq-${i === -1 ? 4 : i})`;
  };

  const tooltip = (iso: string | null, name: string) => {
    const c = iso ? BY_ISO.get(iso) : undefined;
    if (!c) return <><strong>{name}</strong><span className="muted">No World Bank data</span></>;
    const k = CLASS.get(c.iso3)!;
    const v = metric && c.metrics[metric.key];
    return (
      <>
        <strong>{c.name}</strong>
        {metric ? (
          <div>{v ? `${metric.label}: ${metric.fmt(v[0])} (${v[1]})` : `${metric.label}: no data`}</div>
        ) : (
          <div>
            {ARCHETYPES[k.primary.id].name}
            {k.secondary && ` · ${ARCHETYPES[k.secondary.id].name}`}
          </div>
        )}
        <div className="muted small">{c.incomeGroup} · click for profile</div>
      </>
    );
  };

  const counts = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, COUNTRIES.filter((c) => CLASS.get(c.iso3)!.primary.id === id).length]));

  return (
    <div className="wrap">
      <div className="eyebrow">The atlas</div>
      <h1>How the world earns a living</h1>
      <p className="lede">
        Each economy, sorted by how its people actually make money. What you'd build for a farming economy, a factory economy or an aging rich one are different
        jobs.
      </p>

      <div className="chips" role="group" aria-label="Map view" style={{ margin: "22px 0 16px" }}>
        <button className="chip" aria-pressed={view === "archetype"} onClick={() => setParams({})}>
          Economy type
        </button>
        {METRICS.map((m) => (
          <button key={m.key} className="chip" aria-pressed={view === m.key} onClick={() => setParams({ view: m.key })}>
            {m.label}
          </button>
        ))}
      </div>

      <WorldMap fill={fill} tooltip={tooltip} onSelect={(iso) => nav(`/country/${iso}`)} label={metric ? `World map of ${metric.label}` : "World map of economy types"} />

      {metric ? (
        <div className="legend">
          <span className="ramp">
            {[0, 1, 2, 3, 4].map((i) => (
              <i key={i} style={{ background: `var(--seq-${i})` }} />
            ))}
          </span>
          <span>
            {metric.fmt(breaks[0])} → {metric.fmt(breaks[3])}+ (quintiles)
          </span>
          <span>
            <i className="dot" style={{ background: "var(--nodata)" }} /> no data
          </span>
          <span className="muted">
            {DATA.indicators[metric.key].label} · {DATA.indicators[metric.key].source}
          </span>
        </div>
      ) : (
        <div className="legend">
          {ARCHETYPE_IDS.map((id) => (
            <span key={id}>
              <i className="dot" style={{ background: archColor(id) }} /> {ARCHETYPES[id].name} ({counts[id]})
            </span>
          ))}
        </div>
      )}

      <div className="jump">
        <label htmlFor="jump">Jump to a country</label>
        <select id="jump" value="" onChange={(e) => e.target.value && nav(`/country/${e.target.value}`)}>
          <option value="">Choose…</option>
          {SORTED.map((c) => (
            <option key={c.iso3} value={c.iso3}>
              {c.name}
            </option>
          ))}
        </select>
        <Link to="/countries" className="small">
          or see all {COUNTRIES.length} as a table
        </Link>
      </div>

      <section style={{ marginTop: 40 }}>
        <h2>The economy types</h2>
        <p className="muted">
          Plain threshold rules on World Bank data, so every label shows its reason on the country page. Values older than 2018 are shown but never used to classify.
        </p>
        <div className="rows">
          {ARCHETYPE_IDS.map((id) => (
            <div className="row-item" key={id}>
              <div>
                <h3>
                  <i className="dot" style={{ background: archColor(id), marginRight: 9 }} />
                  {ARCHETYPES[id].name}
                </h3>
                <p>{ARCHETYPES[id].short}</p>
              </div>
              <p>
                <b>Building here tends to mean:</b> {ARCHETYPES[id].builds}
              </p>
              <div className="meta">
                <span>{counts[id]} economies</span>
                {id !== "mixed" && <Link to={`/problems?archetype=${id}`}>problems →</Link>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
