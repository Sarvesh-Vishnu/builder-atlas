import { Link, useParams } from "react-router-dom";
import { ArchTag, Pips } from "../components/bits";
import { PROBLEM_BY_ID } from "../content/load";
import { BY_ISO } from "../data/countries";
import type { ProblemCard } from "../content/schema";
import { people } from "../format";

function Src({ s }: { s: ProblemCard["evidence"][number]["source"] }) {
  return (
    <span className="src">
      <a href={s.url} target="_blank" rel="noreferrer">
        {s.title} ↗
      </a>{" "}
      · {s.publisher} · {s.asOf}
    </span>
  );
}

export function ProblemPage() {
  const { id = "" } = useParams();
  const p = PROBLEM_BY_ID.get(id);
  if (!p) {
    return (
      <div className="wrap">
        <h1>No such problem card</h1>
        <Link to="/problems">All problems</Link>
      </div>
    );
  }
  return (
    <div className="wrap">
      <div className="eyebrow">
        <Link to="/problems">Problems</Link> / {p.id}
      </div>
      <h1>{p.title}</h1>
      <p className="lede">{p.oneLine}</p>
      <div className="chips" style={{ margin: "14px 0" }}>
        {p.archetypes.map((a) => (
          <ArchTag key={a} id={a} to={`/problems?archetype=${a}`} />
        ))}
        {p.countries.map((iso) => (
          <Link key={iso} className="tag" to={`/country/${iso}`}>
            {BY_ISO.get(iso)?.name ?? iso}
          </Link>
        ))}
      </div>

      <section className="grid-2">
        <div className="panel">
          <h2>Who</h2>
          <p>{p.who.text}</p>
          {p.who.population && (
            <p>
              <span style={{ fontFamily: "var(--serif)", fontSize: "1.8rem" }}>{people(p.who.population.value)}</span> {p.who.population.label}
              <Src s={p.who.population.source} />
            </p>
          )}
        </div>
        <div className="panel">
          <h2>The lenses</h2>
          <dl className="kv">
            {(["profit", "meaning", "purpose"] as const).map((l) => (
              <div key={l} style={{ display: "contents" }}>
                <dt>
                  {l} <Pips n={p.lenses[l].score} />
                </dt>
                <dd>{p.lenses[l].why}</dd>
              </div>
            ))}
          </dl>
          <p className="small muted" style={{ marginTop: 12 }}>
            Lens scores are editorial judgments, argued in the open. The figures elsewhere on this page are not.
          </p>
        </div>
      </section>

      <section>
        <h2>The evidence</h2>
        <ul className="claims">
          {p.evidence.map((e, i) => (
            <li key={i}>
              {e.claim}
              <Src s={e.source} />
            </li>
          ))}
        </ul>
      </section>

      <section className="grid-2">
        <div>
          <h2>Who's already on it</h2>
          {p.supply.length ? (
            <ul className="claims">
              {p.supply.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    <b>{s.name}</b> ↗
                  </a>{" "}
                  <span className="tag">{s.kind}</span>
                  <span className="src">{s.what}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {p.supplyNote && <p className="note">{p.supplyNote}</p>}
          <p className="small muted">
            Crowding: <b>{p.crowding.level}</b>. {p.crowding.note}
          </p>
        </div>
        <div>
          <h2>Who might pay</h2>
          <ul className="claims">
            {p.payers.map((x) => (
              <li key={x.who}>
                <b>{x.who}</b> <span className="tag">{x.type}</span>
                <span className="src">{x.why}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2>The graveyard</h2>
        {p.graveyard.length ? (
          <ul className="claims">
            {p.graveyard.map((g) => (
              <li key={g.name}>
                <a href={g.url} target="_blank" rel="noreferrer">
                  <b>{g.name}</b> ↗
                </a>{" "}
                <span className="tag">blocker: {g.blocker}</span>
                <span className="src">
                  {g.what} Lesson: {g.lesson}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {p.graveyardNote && <p className="note">{p.graveyardNote}</p>}
        <p className="small muted">Why it's still unsolved: {p.blockers.join(", ")}.</p>
      </section>

      <section className="grid-2">
        <div className="panel">
          <h2>What a small team could build</h2>
          <ul className="plain">
            {p.buildAngles.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <dl className="kv" style={{ marginTop: 14 }}>
            <dt>Skills</dt>
            <dd>{p.skills.join(", ")}</dd>
            <dt>First value</dt>
            <dd>{p.timeToFirstValue}</dd>
            <dt>Capital</dt>
            <dd>{p.capital}</dd>
          </dl>
        </div>
        <div className="panel">
          <h2>Your first ten conversations</h2>
          <p className="muted small">Before you write code, find the people. Places to start:</p>
          <ul className="plain">
            {p.firstConversations.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
