import { Fragment } from "react";
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
        <Fragment key={l}>
          <span>{l}</span>
          <Pips n={card.lenses[l].score} />
        </Fragment>
      ))}
    </div>
  );
}

export function ProblemRow({ card }: { card: ProblemCard }) {
  return (
    <Link className="row-item" to={`/problems/${card.id}`}>
      <div>
        <h3>{card.title}</h3>
        <div className="chips">
          {card.archetypes.map((a) => (
            <ArchTag key={a} id={a} />
          ))}
        </div>
      </div>
      <p>{card.oneLine}</p>
      <div className="meta">
        <LensBar card={card} />
        <span>
          {card.crowding.level} · {card.timeToFirstValue} · {card.capital} capital
        </span>
      </div>
    </Link>
  );
}
