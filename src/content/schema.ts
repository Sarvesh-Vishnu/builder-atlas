// The problem-card contract. The validator (scripts/validate-content.mjs) and
// the app both parse every card through this, so a card without sources
// can't be rendered.
import { z } from "zod";

export const ARCHETYPE_IDS = [
  "agrarian",
  "manufacturing",
  "services",
  "tourism",
  "resource",
  "remittance",
  "aging",
  "mixed",
] as const;

export const SKILLS = [
  "software",
  "design",
  "data",
  "hardware",
  "health",
  "agriculture",
  "finance",
  "operations",
  "policy",
  "community",
  "languages",
] as const;

export const BLOCKERS = [
  "distribution",
  "trust",
  "regulation",
  "payer",
  "unit-economics",
  "data",
  "infrastructure",
  "behaviour",
] as const;

const isoDate = z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "asOf must be YYYY, YYYY-MM or YYYY-MM-DD");
const url = z.string().url().startsWith("https://");

export const Source = z.object({
  title: z.string().min(3),
  publisher: z.string().min(2),
  url,
  asOf: isoDate,
});

const Claim = z.object({
  claim: z.string().min(10),
  source: Source,
});

const Lens = z.object({
  score: z.number().int().min(1).max(5),
  why: z.string().min(10),
});

export const ProblemCard = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(5),
    oneLine: z.string().min(10).max(220),
    who: z.object({
      text: z.string().min(10),
      population: z.object({ value: z.number().positive(), label: z.string(), source: Source }).optional(),
    }),
    evidence: z.array(Claim).min(2),
    archetypes: z.array(z.enum(ARCHETYPE_IDS)).min(1),
    countries: z.array(z.string().regex(/^[A-Z]{3}$/)).default([]),
    supply: z
      .array(
        z.object({
          name: z.string(),
          kind: z.enum(["government", "ngo", "company", "multilateral", "cooperative", "research"]),
          what: z.string().min(5),
          url,
        }),
      )
      .default([]),
    supplyNote: z.string().optional(),
    payers: z
      .array(
        z.object({
          who: z.string(),
          type: z.enum(["user", "state", "employer", "insurer", "diaspora", "buyer", "donor", "platform"]),
          why: z.string().min(10),
        }),
      )
      .min(1),
    graveyard: z
      .array(z.object({ name: z.string(), what: z.string(), blocker: z.enum(BLOCKERS), lesson: z.string(), url }))
      .default([]),
    graveyardNote: z.string().optional(),
    blockers: z.array(z.enum(BLOCKERS)).min(1),
    lenses: z.object({ profit: Lens, meaning: Lens, purpose: Lens }),
    skills: z.array(z.enum(SKILLS)).min(1),
    timeToFirstValue: z.enum(["weeks", "months", "years"]),
    capital: z.enum(["low", "medium", "high"]),
    crowding: z.object({ level: z.enum(["sparse", "some", "crowded"]), note: z.string().min(10) }),
    buildAngles: z.array(z.string().min(10)).min(2).max(4),
    firstConversations: z.array(z.string().min(10)).min(2),
  })
  // "None found" is allowed, but it has to be said, not left blank.
  .refine((c) => c.supply.length > 0 || !!c.supplyNote, { message: "supply is empty and supplyNote is missing", path: ["supply"] })
  .refine((c) => c.graveyard.length > 0 || !!c.graveyardNote, { message: "graveyard is empty and graveyardNote is missing", path: ["graveyard"] });

export type ProblemCard = z.infer<typeof ProblemCard>;
export type ArchetypeId = (typeof ARCHETYPE_IDS)[number];
export type Skill = (typeof SKILLS)[number];
export type Blocker = (typeof BLOCKERS)[number];
