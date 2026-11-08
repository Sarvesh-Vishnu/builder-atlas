import raw from "./countries.json";

export type Obs = [value: number, year: number];

export type MetricKey =
  | "gdpPcPpp"
  | "agriShare"
  | "industryShare"
  | "manufShare"
  | "servicesShare"
  | "tourismShare"
  | "tourismShare2019"
  | "resourceRents"
  | "remittances"
  | "population"
  | "under15"
  | "over65"
  | "urban"
  | "internet"
  | "vulnerableEmp"
  | "agriEmp"
  | "account";

export type ProjectionKey = "over65_2050" | "under15_2050" | "population_2050";
export type TrendKey = "manufShare" | "servicesShare" | "agriShare";

export interface Country {
  iso3: string;
  name: string;
  region: string;
  incomeGroup: string;
  metrics: Partial<Record<MetricKey, Obs>>;
  projections: Partial<Record<ProjectionKey, Obs>>;
  trends: Partial<Record<TrendKey, Obs>>;
}

export interface IndicatorMeta {
  indicator: string;
  label: string;
  source: string;
  projection?: boolean;
  year?: number;
}

export interface Dataset {
  fetchedAt: string;
  baselineYear: number;
  indicators: Record<MetricKey | ProjectionKey, IndicatorMeta>;
  countries: Country[];
}

export const DATA = raw as unknown as Dataset;
export const COUNTRIES = DATA.countries;
export const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso3, c]));

export function sourceUrl(key: MetricKey | ProjectionKey, iso3: string): string {
  const meta = DATA.indicators[key];
  if (meta.projection) return "https://databank.worldbank.org/source/population-estimates-and-projections";
  return `https://data.worldbank.org/indicator/${meta.indicator}?locations=${iso3}`;
}

/** Values older than this are shown (with their year) but never used to classify. */
export const STALE_BEFORE = 2018;

export function fresh(o: Obs | undefined): number | undefined {
  return o && o[1] >= STALE_BEFORE ? o[0] : undefined;
}
