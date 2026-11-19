import { useState } from "react";
import { Link } from "react-router-dom";
import { archColor } from "../components/bits";
import { ARCHETYPES } from "../engine/archetype";
import { COUNTRIES, type Country } from "../data/countries";
import { CLASS } from "../data/derived";
import { pct, people } from "../format";

// tells-ok: em-dashes the dash marks a missing value in a table cell, not prose
type Col = "name" | "type" | "income" | "population" | "internet";
const INCOME_ORDER = ["Low income", "Lower middle income", "Upper middle income", "High income"];

const value = (c: Country, col: Col): string | number => {
  switch (col) {
    case "name":
      return c.name;
    case "type":
      return ARCHETYPES[CLASS.get(c.iso3)!.primary.id].name;
    case "income":
      return INCOME_ORDER.indexOf(c.incomeGroup);
    case "population":
      return c.metrics.population?.[0] ?? -1;
    case "internet":
      return c.metrics.internet?.[0] ?? -1;
  }
};

const COLS: { col: Col; label: string; num?: boolean }[] = [
  { col: "name", label: "Country" },
  { col: "type", label: "Economy type" },
  { col: "income", label: "Income group" },
  { col: "population", label: "People", num: true },
  { col: "internet", label: "Online", num: true },
];

export function Countries() {
  const [sort, setSort] = useState<{ col: Col; dir: 1 | -1 }>({ col: "name", dir: 1 });
  const rows = [...COUNTRIES].sort((a, b) => {
    const x = value(a, sort.col);
    const y = value(b, sort.col);
    const d = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
    return d * sort.dir || a.name.localeCompare(b.name);
  });
  const by = (col: Col) => setSort((s) => ({ col, dir: s.col === col ? (-s.dir as 1 | -1) : col === "population" || col === "internet" ? -1 : 1 }));

  return (
    <div className="wrap">
      <div className="eyebrow">Index</div>
      <h1>All {COUNTRIES.length} economies</h1>
      <p className="lede">Every economy the World Bank profiles, with the type of economy the atlas sorts it into. Select a column heading to sort.</p>
      <div className="table-wrap">
        <table>
          <caption className="sr">Economies, sortable by column</caption>
          <thead>
            <tr>
              {COLS.map(({ col, label, num }) => (
                <th key={col} className={num ? "num" : undefined} aria-sort={sort.col === col ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
                  <button type="button" onClick={() => by(col)}>
                    {label}
                    {sort.col === col ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const k = CLASS.get(c.iso3)!;
              return (
                <tr key={c.iso3}>
                  <td>
                    <Link to={`/country/${c.iso3}`}>{c.name}</Link>
                  </td>
                  <td>
                    <span className="tag">
                      <i className="dot" style={{ background: archColor(k.primary.id) }} />
                      {ARCHETYPES[k.primary.id].name}
                    </span>
                  </td>
                  <td>{c.incomeGroup || "Not classified"}</td>
                  <td className="num">{c.metrics.population ? people(c.metrics.population[0]) : "—"}</td>
                  <td className="num">{c.metrics.internet ? pct(c.metrics.internet[0]) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
