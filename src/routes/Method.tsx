import { Link } from "react-router-dom";
import { ARCHETYPES, RULES } from "../engine/archetype";
import { SIGNAL_RULES } from "../engine/trajectory";
import { ACCESS, CROWDING, NEUTRAL, PENALTY, W } from "../engine/fit";
import { DATA, STALE_BEFORE } from "../data/countries";
import { PROBLEMS } from "../content/load";
import { REPO_URL } from "../site";

const pc = (n: number) => `${Math.round(n * 100)}%`;
const T = SIGNAL_RULES;

export function Method() {
  const indicators = Object.entries(DATA.indicators);
  return (
    <div className="wrap">
      <div className="eyebrow">How this works</div>
      <h1>Where the numbers come from, and what they can't tell you</h1>
      <p className="lede">
        Everything here is either published data with its year and source, a plain rule you can check, or an editorial judgment labelled as one. This page says which is which.
      </p>

      <section>
        <h2>Country data</h2>
        <p>
          World Bank open data, fetched on {DATA.fetchedAt}: {indicators.length} indicators for {DATA.countries.length} economies. Each figure is the most recent year the World
          Bank publishes for that country, and the year is shown beside it. Nothing is estimated or filled in; a missing value shows as missing. Figures from before {STALE_BEFORE}{" "}
          are shown in the accent colour with their year and are never used to sort an economy. Projections to 2050 come from the World Bank's population estimates and
          projections and are labelled as projections wherever they appear.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Code</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map(([key, m]) => (
                <tr key={key}>
                  <td>{m.label}</td>
                  <td className="mono small">{m.indicator}</td>
                  <td className="small">{m.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>
          World Bank data is licensed CC BY 4.0. Map shapes: Natural Earth (public domain) via world-atlas.
        </p>
      </section>

      <section>
        <h2>How economies are sorted</h2>
        <p>
          Each economy is checked against the rules below. It matches every rule it clears; the strongest match (its value divided by the threshold) becomes its main type and
          the next one its second. One exception: the farming rule counts people's jobs rather than output, so when it matches it leads. A country with a small export base can
          look tourism-led on paper while most of its people farm. An economy that clears no rule is "{ARCHETYPES.mixed.name}".
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Measure</th>
                <th className="num">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map((r) => (
                <tr key={r.id}>
                  <td>{ARCHETYPES[r.id].name}</td>
                  <td>{r.measure}</td>
                  <td className="num">
                    ≥ {r.threshold} {r.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>
          Thresholds are judgment calls, chosen so each type picks out economies where that sector shapes most people's lives. They are not an official classification.
        </p>
      </section>

      <section>
        <h2>Where a country is heading</h2>
        <ul className="plain">
          <li>
            <b>Aging fast / aging:</b> the share aged 65+ is projected to rise at least {T.agingFastPts} / {T.agingPts} percentage points by 2050.
          </li>
          <li>
            <b>Still young in 2050:</b> at least {T.young2050Pct}% projected under 15 in 2050.
          </li>
          <li>
            <b>Population growing fast / shrinking:</b> at least {T.popGrowthPct}% more people, or {Math.abs(T.popShrinkPct)}% fewer, by 2050.
          </li>
          <li>
            <b>Sector rising or shrinking:</b> farming, manufacturing or services moved at least {T.sectorShiftPts} points of GDP since {DATA.baselineYear}. Observed, not forecast.
          </li>
          <li>
            <b>Mostly offline:</b> fewer than {T.offlineBelowPct}% use the internet.
          </li>
        </ul>
      </section>

      <section>
        <h2>The problem cards</h2>
        <p>
          {PROBLEMS.length} cards, each researched from primary and institutional sources. Every figure sits in a sentence with a link to the specific page that states it and the
          date of the figure; a card without those cannot be published (a schema check runs on every build). Figures are quoted as the source states them, not rounded or
          combined. "Who's already on it" lists organisations found by searching; when nothing was found, the card says what was searched. The graveyard lists only failures
          that are documented somewhere you can read.
        </p>
        <p>
          <b>Editorial, not data:</b> the profit, meaning and purpose scores (1 to 5, each argued in a sentence on the card), the crowding level, the build ideas and the places to
          start conversations. Disagree with them; they are there to be argued with.
        </p>
      </section>

      <section>
        <h2>How fit is scored</h2>
        <p>
          The score out of 100 is {pc(W.lens)} how well the problem matches the lenses you weighted, {pc(W.skills)} how many of the skills it needs you bring, and {pc(W.access)}{" "}
          your reach: {pc(ACCESS.near)} if it is acute in a country you listed, {pc(ACCESS.kin)} if it is common in a type of economy you know, {pc(ACCESS.far)} otherwise. Anything you
          leave blank counts as {pc(NEUTRAL)}, never as a match.
        </p>
        <p>
          It is then multiplied by {PENALTY.runwayOneStep} if the problem takes one step longer to show value than your runway ({PENALTY.runwayTwoSteps} for two steps), and by{" "}
          {PENALTY.capital} if it needs more money than you have. Fields marked sparse get {CROWDING.sparse} points; crowded ones lose {Math.abs(CROWDING.crowded)}. No AI model
          is involved; the same answers always give the same list.
        </p>
      </section>

      <section>
        <h2>Not covered yet</h2>
        <ul className="plain">
          <li>What people in each country care about. Published surveys cover fewer than a third of countries, so this is left blank rather than guessed.</li>
          <li>Places below the country level. A country's averages hide its regions, cities and the people inside them.</li>
          <li>Live crowding: who else is building on each problem right now.</li>
        </ul>
      </section>

      <section>
        <h2>Found a mistake?</h2>
        <p>
          Every country and problem page has a "Report a wrong figure" link that opens a short form on GitHub. You can also <a href={`${REPO_URL}/issues/new/choose`}>suggest a problem or
          an organisation</a>. The site uses no analytics and sets no cookies. <Link to="/">Back to the start</Link>.
        </p>
      </section>
    </div>
  );
}
