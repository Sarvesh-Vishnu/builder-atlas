# Builder Atlas (working name)

Who are you actually building for? A sourced atlas of the world's people, economies and unmet needs, for individual builders.

What it does that asking a chatbot doesn't:
- **Every number has a source and a date.** Missing data shows as missing.
- **Need next to supply.** Each problem lists who is already working on it.
- **A graveyard.** Past attempts and the blocker that stopped them.
- **Who suffers ≠ who pays.** Each problem names its likely payers.
- **Economy shape matters.** Countries are sorted by how people earn (agrarian, manufacturing, services, tourism, resource, remittance, aging high-income, mixed) and where they're heading.
- **Transparent fit.** A deterministic ranking with every reason shown. No LLM in the core path.

## Run

```bash
npm install
npm run dev          # http://localhost:5189
npm test             # engines + content gates
npm run validate     # problem cards against the schema
npm run check:links  # fetch every source URL in the cards
npm run fetch:data   # refresh the World Bank snapshot + map
```

## Layout

- `scripts/fetch-countries.mjs` → `src/data/countries.json`: World Bank WDI + population projections, values stored as `[value, year]`; nothing estimated.
- `scripts/fetch-map.mjs` → `src/data/world-110m.json`: Natural Earth 110m with ISO-3 codes.
- `src/engine/archetype.ts`: threshold rules → economy type, with the reason. Values older than 2018 never classify.
- `src/engine/trajectory.ts`: 20-year trends + 2050 projections as named signals.
- `src/engine/fit.ts`: builder × problem score (50% lens, 25% skills, 25% reach; runway/capital penalties; crowding nudge).
- `content/problems/*.yaml`: problem cards. Format and rules in `content/FORMAT.md`; schema in `src/content/schema.ts`.

## Not yet

- "What people care about" per country (World Values Survey / Ipsos), left blank rather than guessed.
- Phase 2: builder claims, progress logs, live crowding, community graveyard entries (needs a backend).
