import { useSearchParams } from "react-router-dom";
import { ProblemRow, archColor } from "../components/bits";
import { ARCHETYPE_IDS, BLOCKERS, SKILLS } from "../content/schema";
import { ARCHETYPES } from "../engine/archetype";
import { PROBLEMS } from "../content/load";

const SORTS = ["profit", "meaning", "purpose"] as const;

export function Problems() {
  const [params, setParams] = useSearchParams();
  const archetype = params.get("archetype");
  const blocker = params.get("blocker");
  const skill = params.get("skill");
  const sort = (params.get("sort") as (typeof SORTS)[number]) || null;

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v == null || params.get(k) === v) next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };

  let list = PROBLEMS.filter(
    (p) => (!archetype || p.archetypes.includes(archetype as never)) && (!blocker || p.blockers.includes(blocker as never)) && (!skill || p.skills.includes(skill as never)),
  );
  if (sort) list = [...list].sort((a, b) => b.lenses[sort].score - a.lenses[sort].score);

  return (
    <div className="wrap">
      <div className="eyebrow">Problems</div>
      <h1>{PROBLEMS.length} problems worth a builder's attention</h1>
      <p className="lede">Each card: who has it, how many, who is already on it, who might pay, and what has been tried. Every figure links to the page that states it.</p>

      <div className="filters">
        <div className="row">
          <span>Economy</span>
          <div className="chips">
            {ARCHETYPE_IDS.filter((id) => id !== "mixed").map((id) => (
              <button key={id} className="chip" aria-pressed={archetype === id} onClick={() => set("archetype", id)}>
                <i className="dot" style={{ background: archColor(id) }} />
                {ARCHETYPES[id].name}
              </button>
            ))}
          </div>
        </div>
        <div className="row">
          <span>Sort by</span>
          <div className="chips">
            {SORTS.map((s) => (
              <button key={s} className="chip" aria-pressed={sort === s} onClick={() => set("sort", s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="row">
          <span>Blocker</span>
          <div className="chips">
            {BLOCKERS.map((b) => (
              <button key={b} className="chip" aria-pressed={blocker === b} onClick={() => set("blocker", b)}>
                {b}
              </button>
            ))}
          </div>
        </div>
        <div className="row">
          <span>Skill</span>
          <div className="chips">
            {SKILLS.map((s) => (
              <button key={s} className="chip" aria-pressed={skill === s} onClick={() => set("skill", s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h2 className="sr">
        {list.length} {list.length === 1 ? "card" : "cards"}
      </h2>
      {list.length ? (
        <div className="rows">
          {list.map((p) => (
            <ProblemRow key={p.id} card={p} />
          ))}
        </div>
      ) : (
        <p className="muted">No cards match these filters yet.</p>
      )}
    </div>
  );
}
