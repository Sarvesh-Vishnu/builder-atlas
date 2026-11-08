import { describe, expect, it } from "vitest";
import { classify } from "./archetype";
import { trajectory } from "./trajectory";
import { BY_ISO, type Country } from "../data/countries";

const fake = (over: Partial<Country>): Country => ({
  iso3: "XXX",
  name: "Test",
  region: "Test",
  incomeGroup: "Lower middle income",
  metrics: {},
  projections: {},
  trends: {},
  ...over,
});

describe("classify", () => {
  it("is mixed when no threshold is cleared", () => {
    expect(classify(fake({ metrics: { servicesShare: [50, 2024] } })).primary.id).toBe("mixed");
  });

  it("picks the strongest match as primary and says why", () => {
    const c = classify(fake({ metrics: { manufShare: [27, 2024], remittances: [13, 2024] } }));
    expect(c.primary.id).toBe("manufacturing");
    expect(c.secondary?.id).toBe("remittance");
    expect(c.primary.reason).toContain("27");
  });

  it("leads with agrarian when most jobs are on the land", () => {
    const c = classify(fake({ metrics: { agriEmp: [45, 2024], tourismShare: [70, 2024] } }));
    expect(c.primary.id).toBe("agrarian");
    expect(c.secondary?.id).toBe("tourism");
  });

  it("ignores stale values", () => {
    expect(classify(fake({ metrics: { remittances: [30, 2004] } })).primary.id).toBe("mixed");
  });

  it("only calls high-income countries aging", () => {
    expect(classify(fake({ metrics: { over65: [20, 2024] } })).primary.id).toBe("mixed");
    expect(classify(fake({ incomeGroup: "High income", metrics: { over65: [20, 2024] } })).primary.id).toBe("aging");
  });

  it("uses pre-pandemic tourism when the latest figure is from 2020-21", () => {
    const c = classify(fake({ metrics: { tourismShare: [8, 2021], tourismShare2019: [60, 2019] } }));
    expect(c.primary.id).toBe("tourism");
    expect(c.primary.reason).toContain("2019");
  });

  // Real-data sanity: these should hold for any recent World Bank snapshot.
  it.each([
    ["JPN", "aging"],
    ["MDV", "tourism"],
    ["TJK", "remittance"],
  ])("%s includes %s", (iso, id) => {
    const c = BY_ISO.get(iso)!;
    expect(classify(c).matches.map((m) => m.id)).toContain(id);
  });
});

describe("trajectory", () => {
  it("flags fast aging from the 2050 projection", () => {
    const s = trajectory(fake({ metrics: { over65: [15, 2024] }, projections: { over65_2050: [30, 2050] } }));
    expect(s.map((x) => x.id)).toContain("aging-fast");
  });

  it("flags a falling manufacturing share", () => {
    const s = trajectory(fake({ metrics: { manufShare: [12, 2024] }, trends: { manufShare: [20, 2004] } }));
    expect(s.map((x) => x.id)).toContain("manufShare-down");
  });

  it("stays quiet without data", () => {
    expect(trajectory(fake({}))).toEqual([]);
  });
});
