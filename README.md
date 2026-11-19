# Builder Atlas

**Who are you actually building for?** A sourced atlas of the world's people, economies and unmet needs, for anyone deciding what to build.

Live: https://sarvesh-vishnu.github.io/builder-atlas/

- **The atlas.** 217 economies sorted by how their people earn a living (farming, manufacturing, services, tourism, resources, remittances, aging high-income, mixed), each with the rule that put it there.
- **The people.** The world's population regrouped by economy type, income, age and connection.
- **Country pages.** The shape of the economy, the people, where it's heading to 2050, and the problems that apply.
- **16 problem cards.** Who has the problem, sourced evidence, who's already working on it, who might pay, what has been tried and failed, and where to find the first people to talk to.
- **Find your fit.** A transparent ranking of the problems for your skills, reach, runway and what you're optimising for. Every point of the score shows its reason. No AI model is involved.

How the numbers work, and what isn't covered, is on the site's [How this works](https://sarvesh-vishnu.github.io/builder-atlas/method/) page.

## Found a mistake?

Every country and problem page has a "Report it on GitHub" link that opens a prefilled form. You can also [open an issue](https://github.com/Sarvesh-Vishnu/builder-atlas/issues/new/choose) to correct a figure, add an organisation or a documented failure, or suggest a problem. A correction needs a link to the page that states the right figure.

## Run it

```bash
npm install
npm run dev          # http://localhost:5189/builder-atlas/
npm test             # engines, card schema, every pre-rendered page
npm run build        # typecheck, build, pre-render all routes into dist/
npm run check:links  # fetch every source URL in the cards (manual; some sites block scripts)
npm run fetch:data   # refresh the World Bank snapshot and the map
```

Every push to `main` runs the tests and, if they pass, deploys to GitHub Pages.

## How it's put together

- `scripts/fetch-countries.mjs` → `src/data/countries.json`: World Bank indicators and population projections, stored as `[value, year]`. Nothing is estimated.
- `src/engine/`: the economy-type rules, trajectory signals and fit score, all pure functions with tests.
- `content/problems/*.yaml`: the problem cards. Format and rules in `content/FORMAT.md`; the schema in `src/content/schema.ts` rejects any figure without a source and date.
- `scripts/prerender.mjs`: renders every route to static HTML, so the site reads with JavaScript off.
- `design.md`: the design contract.

## Data and credits

- Country data: [World Bank Open Data](https://data.worldbank.org/), CC BY 4.0.
- Map: [Natural Earth](https://www.naturalearthdata.com/) via [world-atlas](https://github.com/topojson/world-atlas), public domain.
- Problem cards cite their own sources, linked beside every figure.
- Fonts: Instrument Sans and JetBrains Mono, SIL Open Font License, self-hosted.

## Licence

- Code: [MIT](LICENSE).
- Written content (problem cards, economy-type descriptions, site text): [CC BY 4.0](LICENSE-CONTENT.md). Reuse it with credit to Builder Atlas.
- Figures quoted on the cards belong to their linked publishers; country data is the World Bank's (CC BY 4.0).

