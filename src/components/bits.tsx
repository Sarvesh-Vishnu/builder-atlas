import { Link } from "react-router-dom";
import type { ArchetypeId, ProblemCard } from "../content/schema";
import { ARCHETYPES } from "../engine/archetype";

export const archColor = (id: ArchetypeId) => `var(--a-${id})`;

export function ArchTag({ id, to }: { id: ArchetypeId; to?: string }) {
  const body = (
    <>
      <i className="dot" style={{ background: archColor(id) }} />
      {ARCHETYPES[id].name}
    </>
  );
  return to ? (
    <Link className="tag" to={to}>
      {body}
    </Link>
  ) : (
    <span className="tag">{body}</span>
  );
}

export function Pips({ n }: { n: number }) {
  return (
    <span className="pips" aria-label={`${n} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= n ? "on" : ""} />
      ))}
    </span>
  );
}

export function LensBar({ card }: { card: ProblemCard }) {
  return (
    <div className="lensbar">
      {(["profit", "meaning", "purpose"] as const).map((l) => (
        <div key={l}>
          {l} <Pips n={card.lenses[l].score} />
        </div>
      ))}
    </div>
  );
}

export function ProblemTile({ card }: { card: ProblemCard }) {
  return (
    <Link className="card" to={`/problems/${card.id}`}>
      <h3>{card.title}</h3>
      <p>{card.oneLine}</p>
      <div className="chips">
        {card.archetypes.map((a) => (
          <ArchTag key={a} id={a} />
        ))}
      </div>
      <LensBar card={card} />
      <span className="small muted">
        {card.crowding.level} · first value in {card.timeToFirstValue} · {card.capital} capital
      </span>
    </Link>
  );
}

export function Chip<T extends string>({ value, on, onToggle, children }: { value: T; on: boolean; onToggle: (v: T) => void; children: React.ReactNode }) {
  return (
    <button type="button" className="chip" aria-pressed={on} onClick={() => onToggle(value)}>
      {children}
    </button>
  );
}
