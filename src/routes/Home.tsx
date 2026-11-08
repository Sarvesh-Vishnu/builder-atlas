import { Link } from "react-router-dom";
import { COUNTRIES, DATA } from "../data/countries";
import { PROBLEMS } from "../content/load";
import { people } from "../format";

const total = COUNTRIES.reduce((s, c) => s + (c.metrics.population?.[0] ?? 0), 0);

const STANCES = [
  {
    t: "Every number has a source and a date",
    p: "Click any figure and land on the page that states it. Missing data shows as missing, never estimated. A chatbot can sound sure about a number it made up; this can't.",
  },
  {
    t: "Need, next to who's already on it",
    p: "Each problem lists the governments, NGOs and companies already working on it. Need minus supply is the gap, and the gap is where a new builder adds something.",
  },
  {
    t: "What was tried, and why it stopped",
    p: "A graveyard of past attempts and the real blocker: distribution, trust, regulation, who pays. Most good ideas have been tried; the useful question is what killed them.",
  },
  {
    t: "Who suffers is often not who pays",
    p: "The people with the problem often can't pay. A state scheme, an employer, an insurer, family abroad, a buyer down the supply chain might. Each card names its likely payers.",
  },
  {
    t: "The shape of the economy changes the answer",
    p: "Building for a farming economy, a factory economy, a tourist island or an aging rich country are different jobs. The atlas sorts the world by how people actually earn.",
  },
  {
    t: "Ranked for you, with the reasons shown",
    p: "Tell it your skills, where you have reach, your runway and what you're optimising for. Every point of the score traces to a line you can read and disagree with.",
  },
];

export function Home() {
  return (
    <div className="wrap">
      <div className="hero">
        <div className="eyebrow">A sourced atlas for builders</div>
        <h1>Who are you actually building for?</h1>
        <p className="lede">
          Everyone is being told to build. Before you ask a chatbot for an idea, look at who the world is: {people(total)} people across{" "}
          {COUNTRIES.length} economies, what they need, who is already working on it, and who would pay.
        </p>
        <div className="actions">
          <Link className="btn primary" to="/fit">
            Find your fit →
          </Link>
          <Link className="btn" to="/atlas">
            Explore the atlas
          </Link>
          <Link className="btn" to="/people">
            See the people
          </Link>
        </div>
      </div>

      <section>
        <h2>What this gives you that a chat window doesn't</h2>
        <div className="stances">
          {STANCES.map((s, i) => (
            <div className="stance" key={s.t}>
              <div className="n">0{i + 1}</div>
              <h3>{s.t}</h3>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Profit, meaning, purpose</h2>
        <p className="lede">Not three lists. Three ways of ranking the same problems. Where they overlap is usually where a third party will pay for people who can't.</p>
        <div className="lenses-explain" style={{ marginTop: 20 }}>
          <div>
            <h3>Profit</h3>
            <p className="muted">Someone will pay, at a margin that can keep a team alive.</p>
          </div>
          <div>
            <h3>Meaning</h3>
            <p className="muted">The day-to-day work keeps you close to the people it helps.</p>
          </div>
          <div>
            <h3>Purpose</h3>
            <p className="muted">How much human good if it were solved at scale.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Start anywhere</h2>
        <div className="grid-3">
          <Link className="card" to="/atlas">
            <h3>The atlas</h3>
            <p>Every economy by how its people earn, how old they are, and where it's heading.</p>
          </Link>
          <Link className="card" to="/problems">
            <h3>{PROBLEMS.length} problems</h3>
            <p>Sourced cards: who, how many, who's on it, who pays, what failed.</p>
          </Link>
          <Link className="card" to="/people">
            <h3>The people</h3>
            <p>The world's population regrouped by economy, income, age and connection.</p>
          </Link>
        </div>
      </section>

      <p className="small muted" style={{ marginTop: 40 }}>
        Country data: World Bank open data, snapshot {DATA.fetchedAt}. Problem cards are researched and every figure is checked against its source page.
      </p>
    </div>
  );
}
