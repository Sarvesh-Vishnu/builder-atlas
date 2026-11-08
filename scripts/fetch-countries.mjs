// Snapshot open World Bank data into src/data/countries.json.
// Every value keeps its year, indicator id and a URL a reader can open.
// Missing values stay null; nothing is estimated or filled in.
import { writeFile, mkdir } from "node:fs/promises";

const API = "https://api.worldbank.org/v2";
const SRC_WDI = "World Bank, World Development Indicators";
const SRC_POP = "World Bank, Population Estimates and Projections";

// key → [indicator, label]
const LATEST = {
  gdpPcPpp: ["NY.GDP.PCAP.PP.CD", "GDP per capita, PPP (current intl $)"],
  agriShare: ["NV.AGR.TOTL.ZS", "Agriculture, value added (% of GDP)"],
  industryShare: ["NV.IND.TOTL.ZS", "Industry, value added (% of GDP)"],
  manufShare: ["NV.IND.MANF.ZS", "Manufacturing, value added (% of GDP)"],
  servicesShare: ["NV.SRV.TOTL.ZS", "Services, value added (% of GDP)"],
  tourismShare: ["ST.INT.RCPT.XP.ZS", "International tourism receipts (% of exports)"],
  resourceRents: ["NY.GDP.TOTL.RT.ZS", "Total natural resources rents (% of GDP)"],
  remittances: ["BX.TRF.PWKR.DT.GD.ZS", "Personal remittances received (% of GDP)"],
  population: ["SP.POP.TOTL", "Population, total"],
  under15: ["SP.POP.0014.TO.ZS", "Population ages 0-14 (% of total)"],
  over65: ["SP.POP.65UP.TO.ZS", "Population ages 65 and above (% of total)"],
  urban: ["SP.URB.TOTL.IN.ZS", "Urban population (% of total)"],
  internet: ["IT.NET.USER.ZS", "Individuals using the Internet (% of population)"],
  vulnerableEmp: ["SL.EMP.VULN.ZS", "Vulnerable employment (% of total employment, modeled ILO)"],
  agriEmp: ["SL.AGR.EMPL.ZS", "Employment in agriculture (% of total employment, modeled ILO)"],
  account: ["FX.OWN.TOTL.ZS", "Account ownership at a financial institution or mobile-money provider (% age 15+)"],
};

// Projections from the population dataset (source 40), for "where it's heading".
const PROJECTED = {
  over65_2050: ["SP.POP.65UP.TO.ZS", 2050, "Population ages 65+ (% of total), 2050 projection"],
  under15_2050: ["SP.POP.0014.TO.ZS", 2050, "Population ages 0-14 (% of total), 2050 projection"],
  population_2050: ["SP.POP.TOTL", 2050, "Population, total, 2050 projection"],
};

// Observed at a fixed year. Tourism's latest value is often 2020-21, when the
// pandemic emptied it, so 2019 is kept as the pre-pandemic reference.
const AT_YEAR = {
  tourismShare2019: ["ST.INT.RCPT.XP.ZS", 2019, "International tourism receipts (% of exports), 2019"],
};

// Twenty-year baselines for trend arrows (observed, not forecast).
const BASELINE_YEAR = 2004;
const TREND = { manufShare: "NV.IND.MANF.ZS", servicesShare: "NV.SRV.TOTL.ZS", agriShare: "NV.AGR.TOTL.ZS" };

// Values are stored compactly as [value, year]; the indicator table below says
// what each key is and where it comes from, and the app builds per-country URLs.
const round = (v) => Math.round(v * 100) / 100;

async function getJson(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return await r.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
    }
  }
}

async function allRows(path) {
  const rows = [];
  let page = 1, pages = 1;
  do {
    const [meta, data] = await getJson(`${API}/${path}${path.includes("?") ? "&" : "?"}format=json&per_page=20000&page=${page}`);
    pages = meta.pages ?? 1;
    rows.push(...(data ?? []));
    page++;
  } while (page <= pages);
  return rows;
}

const countries = (await allRows("country")).filter((c) => c.region?.id && c.region.id !== "NA");
const byIso = new Map(
  countries.map((c) => [
    c.id,
    {
      iso3: c.id,
      name: c.name,
      region: c.region.value.trim(),
      incomeGroup: c.incomeLevel.value.trim(),
      metrics: {},
      projections: {},
      trends: {},
    },
  ]),
);

for (const [key, [ind, label]] of Object.entries(LATEST)) {
  // mrnev=1: most recent non-empty value per country.
  const rows = await allRows(`country/all/indicator/${ind}?mrnev=1`);
  for (const r of rows) {
    const c = byIso.get(r.countryiso3code);
    if (!c || r.value == null) continue;
    c.metrics[key] = [round(r.value), Number(r.date)];
  }
  console.log(`✓ ${key}`);
}

for (const [key, [ind, year, label]] of Object.entries(PROJECTED)) {
  const rows = await allRows(`country/all/indicator/${ind}?source=40&date=${year}`);
  for (const r of rows) {
    const c = byIso.get(r.countryiso3code);
    if (!c || r.value == null) continue;
    c.projections[key] = [round(r.value), year];
  }
  console.log(`✓ ${key}`);
}

for (const [key, [ind, year]] of Object.entries(AT_YEAR)) {
  const rows = await allRows(`country/all/indicator/${ind}?date=${year}`);
  for (const r of rows) {
    const c = byIso.get(r.countryiso3code);
    if (!c || r.value == null) continue;
    c.metrics[key] = [round(r.value), year];
  }
  console.log(`✓ ${key}`);
}

for (const [key, ind] of Object.entries(TREND)) {
  const rows = await allRows(`country/all/indicator/${ind}?date=${BASELINE_YEAR}`);
  for (const r of rows) {
    const c = byIso.get(r.countryiso3code);
    if (!c || r.value == null || !c.metrics[key]) continue;
    c.trends[key] = [round(r.value), BASELINE_YEAR];
  }
  console.log(`✓ trend ${key}`);
}

await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
const indicators = {};
for (const [key, [ind, label]] of Object.entries(LATEST)) indicators[key] = { indicator: ind, label, source: SRC_WDI };
for (const [key, [ind, , label]] of Object.entries(AT_YEAR)) indicators[key] = { indicator: ind, label, source: SRC_WDI };
for (const [key, [ind, year, label]] of Object.entries(PROJECTED))
  indicators[key] = { indicator: ind, label, source: SRC_POP, projection: true, year };
const out = { fetchedAt: new Date().toISOString().slice(0, 10), baselineYear: BASELINE_YEAR, indicators, countries: [...byIso.values()] };
await writeFile(new URL("../src/data/countries.json", import.meta.url), JSON.stringify(out));
console.log(`wrote ${out.countries.length} countries`);
