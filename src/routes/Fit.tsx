import { Link, useSearchParams } from "react-router-dom";
import { SKILLS, type ArchetypeId, type Skill } from "../content/schema";
import { PROBLEMS } from "../content/load";
import { rank, type Builder, type Capital, type Runway } from "../engine/fit";
import { BY_ISO, COUNTRIES } from "../data/countries";
import { CLASS } from "../data/derived";
import { ArchTag } from "../components/bits";

const RUNWAYS: { v: Runway; label: string }[] = [
  { v: "weekends", label: "Weekends, for now" },
  { v: "months", label: "A few months" },
  { v: "years", label: "Years, if it works" },
];
const CAPITALS: { v: Capital; label: string }[] = [
  { v: "low", label: "Just me and a laptop" },
  { v: "medium", label: "Some savings or a grant" },
  { v: "high", label: "Can raise money" },
];
const SORTED = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

const list = (s: string | null) => (s ? s.split(",").filter(Boolean) : []);
const num = (s: string | null, d: number) => (s == null || Number.isNaN(Number(s)) ? d : Math.max(0, Math.min(10, Number(s))));

export function Fit() {
  const [params, setParams] = useSearchParams();
  const skills = list(params.get("s")).filter((x): x is Skill => (SKILLS as readonly string[]).includes(x));
  const countries = list(params.get("c")).filter((x) => BY_ISO.has(x));
  const runway = (RUNWAYS.find((r) => r.v === params.get("r"))?.v ?? "months") as Runway;
  const capital = (CAPITALS.find((r) => r.v === params.get("k"))?.v ?? "low") as Capital;
  const lenses = { profit: num(params.get("p"), 5), meaning: num(params.get("m"), 5), purpose: num(params.get("u"), 5) };

  const archetypes = [...new Set(countries.flatMap((iso) => CLASS.get(iso)!.matches.map((m) => m.id)))] as ArchetypeId[];

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };
  const toggle = (k: string, cur: string[], v: string) => set(k, (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(","));

  const builder: Builder = { skills, countries, archetypes, runway, capital, lenses };
  const results = rank(PROBLEMS, builder);

  return (
    <div className="wrap">
      <div className="eyebrow">Find your fit</div>
      <h1>What should you build?</h1>
      <p className="lede">
        Tell it what you bring and what you're after. The ranking is plain arithmetic over the problem cards, and every score shows its reasons. Anything you leave blank
        counts as neutral, not as a match.
      </p>

      <div className="fit" style={{ marginTop: 28 }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <span className="label">What you're optimising for</span>
            {(
              [
                ["p", "profit"],
                ["m", "meaning"],
                ["u", "purpose"],
              ] as const
            ).map(([k, l]) => (
              <div className="slider" key={k}>
                <label htmlFor={`l-${k}`}>{l}</label>
                <input id={`l-${k}`} type="range" min={0} max={10} value={lenses[l]} onChange={(e) => set(k, e.target.value)} />
                <span>{lenses[l]}</span>
              </div>
            ))}
          </div>

          <div className="field">
            <span className="label">Skills you bring</span>
            <div className="chips">
              {SKILLS.map((s) => (
                <button type="button" key={s} className="chip" aria-pressed={skills.includes(s)} onClick={() => toggle("s", skills, s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="country">Places you have reach</label>
            <select
              id="country"
              value=""
              onChange={(e) => {
                if (e.target.value) toggle("c", countries, e.target.value);
              }}
            >
              <option value="">Add a country you live in, come from, or know people in…</option>
              {SORTED.filter((c) => !countries.includes(c.iso3)).map((c) => (
                <option key={c.iso3} value={c.iso3}>
                  {c.name}
                </option>
              ))}
            </select>
            {countries.length > 0 && (
              <div className="chips" style={{ marginTop: 8 }}>
                {countries.map((iso) => (
                  <button type="button" key={iso} className="chip" aria-pressed onClick={() => toggle("c", countries, iso)} aria-label={`Remove ${BY_ISO.get(iso)!.name}`}>
                    {BY_ISO.get(iso)!.name} ×
                  </button>
                ))}
              </div>
            )}
            {archetypes.length > 0 && (
              <div className="chips" style={{ marginTop: 8 }}>
                <span className="small muted">You know:</span>
                {archetypes.map((a) => (
                  <ArchTag key={a} id={a} />
                ))}
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="runway">Your runway</label>
            <select id="runway" value={runway} onChange={(e) => set("r", e.target.value)}>
              {RUNWAYS.map((r) => (
                <option key={r.v} value={r.v}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="capital">Money</label>
            <select id="capital" value={capital} onChange={(e) => set("k", e.target.value)}>
              {CAPITALS.map((r) => (
                <option key={r.v} value={r.v}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <p className="small muted">The link in your address bar holds these answers. Share it, or come back to it.</p>
        </form>

        <div>
          <h2>Your shortlist</h2>
          {results.map((r, i) => (
            <div className="result" key={r.card.id}>
              <div className="score">
                {r.score}
                <small>#{i + 1}</small>
              </div>
              <div>
                <h3 style={{ margin: 0 }}>
                  <Link to={`/problems/${r.card.id}`}>{r.card.title}</Link>
                </h3>
                <p className="muted" style={{ margin: "4px 0 0" }}>
                  {r.card.oneLine}
                </p>
                <ul>
                  {r.reasons.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                {i < 3 && r.card.firstConversations[0] && (
                  <p className="small" style={{ margin: "8px 0 0" }}>
                    <b>Start by talking to:</b> {r.card.firstConversations[0]}
                  </p>
                )}
              </div>
            </div>
          ))}
          <p className="small muted" style={{ marginTop: 16 }}>
            Score = 50% lens fit + 25% skills + 25% reach, then reduced if the problem needs more time or money than you have, nudged up when the field is sparse and down
            when it's crowded. Read the reasons; disagree with them.
          </p>
        </div>
      </div>
    </div>
  );
}
