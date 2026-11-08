import { Link, useParams } from "react-router-dom";
import { ArchTag, ProblemTile } from "../components/bits";
import { ARCHETYPES } from "../engine/archetype";
import { trajectory } from "../engine/trajectory";
import { rank } from "../engine/fit";
import { BY_ISO, DATA, sourceUrl, type MetricKey } from "../data/countries";
import { CLASS } from "../data/derived";
import { PROBLEMS } from "../content/load";
import { dollars, isStale, pct, people } from "../format";

const STATS: { key: MetricKey; label: string; fmt: (n: number) => string }[] = [
  { key: "population", label: "People", fmt: people },
  { key: "gdpPcPpp", label: "Income per person (PPP)", fmt: dollars },
  { key: "under15", label: "Under 15", fmt: pct },
  { key: "over65", label: "65 and over", fmt: pct },
  { key: "urban", label: "Live in cities", fmt: pct },
  { key: "internet", label: "Use the internet", fmt: pct },
  { key: "account", label: "Have a bank or mobile-money account", fmt: pct },
  { key: "agriEmp", label: "Jobs in farming", fmt: pct },
  { key: "vulnerableEmp", label: "Vulnerable work (own-account + family)", fmt: pct },
  { key: "remittances", label: "Remittances, % of GDP", fmt: pct },
  { key: "tourismShare", label: "Tourism, % of exports", fmt: pct },
  { key: "resourceRents", label: "Resource rents, % of GDP", fmt: pct },
];

export function CountryPage() {
  const { iso = "" } = useParams();
  const c = BY_ISO.get(iso.toUpperCase());
  if (!c) {
    return (
      <div className="wrap">
        <h1>No data for this place</h1>
        <p>
          The World Bank doesn't publish a profile for it. <Link to="/atlas">Back to the atlas</Link>
        </p>
      </div>
    );
  }
  const k = CLASS.get(c.iso3)!;
  const signals = trajectory(c);
  const m = c.metrics;
  const relevant = PROBLEMS.filter((p) => p.countries.includes(c.iso3) || k.matches.some((x) => p.archetypes.includes(x.id)) || p.archetypes.includes(k.primary.id));
  const ranked = rank(relevant, {
    skills: [],
    countries: [c.iso3],
    archetypes: k.matches.map((x) => x.id),
    runway: "years",
    capital: "high",
    lenses: { profit: 1, meaning: 1, purpose: 1 },
  });

  const shape = [
    { label: "Farming", v: m.agriShare?.[0], color: "var(--a-agrarian)" },
    { label: "Manufacturing", v: m.manufShare?.[0], color: "var(--a-manufacturing)" },
    { label: "Other industry", v: m.industryShare && m.manufShare ? m.industryShare[0] - m.manufShare[0] : m.industryShare?.[0], color: "var(--a-resource)" },
    { label: "Services", v: m.servicesShare?.[0], color: "var(--a-services)" },
  ].filter((s): s is { label: string; v: number; color: string } => s.v != null && s.v > 0);
  const shapeSum = shape.reduce((s, x) => s + x.v, 0);

  return (
    <div className="wrap">
      <div className="eyebrow">
        {c.region} · {c.incomeGroup}
      </div>
      <h1>{c.name}</h1>
      <div className="chips" style={{ margin: "12px 0 8px" }}>
        <ArchTag id={k.primary.id} to={`/problems?archetype=${k.primary.id}`} />
        {k.secondary && <ArchTag id={k.secondary.id} to={`/problems?archetype=${k.secondary.id}`} />}
      </div>
      <p className="small muted">Why: {k.matches.length ? k.matches.map((x) => x.reason).join("; ") : k.primary.reason}.</p>
      <p className="lede">{ARCHETYPES[k.primary.id].builds}</p>

      <section>
        <h2>Shape of the economy</h2>
        {shape.length ? (
          <>
            <div className="shape" role="img" aria-label={shape.map((s) => `${s.label} ${pct(s.v)}`).join(", ")}>
              {shape.map((s) => (
                <div key={s.label} style={{ width: `${(s.v / shapeSum) * 100}%`, background: s.color }} title={`${s.label} ${pct(s.v)}`}>
                  {s.v / shapeSum > 0.12 ? `${s.label} ${pct(s.v)}` : ""}
                </div>
              ))}
            </div>
            <p className="small muted" style={{ marginTop: 8 }}>
              Value added as % of GDP ({m.servicesShare?.[1] ?? m.agriShare?.[1]}). Shares don't sum to 100 because of taxes and subsidies.{" "}
              <a href={sourceUrl("servicesShare", c.iso3)} target="_blank" rel="noreferrer">
                Source ↗
              </a>
            </p>
          </>
        ) : (
          <p className="muted">No sector data published.</p>
        )}
      </section>

      <section>
        <h2>The people</h2>
        <div className="stats">
          {STATS.map(({ key, label, fmt }) => {
            const o = m[key];
            return (
              <div className="stat" key={key}>
                <div className="v">{o ? fmt(o[0]) : "—"}</div>
                <div className="l">{label}</div>
                <div className="s">
                  {o ? (
                    <>
                      <span className={isStale(o) ? "stale" : ""}>{o[1]}</span>
                      {isStale(o) && " · old figure, not used to classify"}
                      {key === "tourismShare" && o[1] <= 2021 && m.tourismShare2019 && ` · pandemic year; ${pct(m.tourismShare2019[0])} in 2019`} ·{" "}
                      <a href={sourceUrl(key, c.iso3)} target="_blank" rel="noreferrer">
                        source ↗
                      </a>
                    </>
                  ) : (
                    "no data published"
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid-2">
        <div className="panel">
          <h2>Where it's heading</h2>
          {signals.length ? (
            signals.map((s) => (
              <div className="signal" key={s.id}>
                <b>{s.label}</b>
                <span className="muted small">
                  {s.detail}
                  {s.kind === "projection" && " · projection"}
                </span>
              </div>
            ))
          ) : (
            <p className="muted">No strong shifts on the signals tracked here.</p>
          )}
          <p className="small muted" style={{ marginTop: 10 }}>
            Trends compare {DATA.baselineYear} with the latest year. Projections:{" "}
            <a href={sourceUrl("over65_2050", c.iso3)} target="_blank" rel="noreferrer">
              World Bank population projections ↗
            </a>
          </p>
        </div>
        <div className="panel">
          <h2>What people here care about</h2>
          <p className="muted">
            Not sourced yet. The plan is published survey data (World Values Survey, Ipsos "What Worries the World"), which covers fewer than a third of countries. We'd
            rather leave this blank than guess.
          </p>
        </div>
      </section>

      <section>
        <h2>Problems that apply here</h2>
        <p className="muted">
          {ranked.length} cards match {c.name} or its economy type, ranked with even lens weights.{" "}
          <Link to={`/fit?c=${c.iso3}`}>Rank them for you →</Link>
        </p>
        <div className="cards" style={{ marginTop: 16 }}>
          {ranked.map((r) => (
            <ProblemTile key={r.card.id} card={r.card} />
          ))}
        </div>
      </section>
    </div>
  );
}
