# Problem card format

One YAML file per card in `content/problems/<id>.yaml`. Parsed by `src/content/schema.ts`; `npm run validate` fails on anything that doesn't fit.

Rules:
- **No number without a source.** Every figure in `oneLine`, `who`, or `evidence` is in a claim whose `source.url` is the specific report/page that contains it (not a homepage), and whose `asOf` is the date of the figure.
- Quote numbers the way the source states them. No rounding up, no combining two sources into one figure.
- `supply` lists who is *already* working on it. If you searched and found nobody, leave it empty and say what you searched in `supplyNote`.
- `graveyard` lists attempts that stopped or failed, each with a URL. If none is documented, leave it empty and say so in `graveyardNote`. Never invent one.
- `lenses` are judgments, not data. Score 1–5 and argue it in one or two sentences:
  - **profit**: someone will pay, at a margin that can sustain a team.
  - **meaning**: the day-to-day work keeps you close to the people it helps.
  - **purpose**: how much human good if it were solved at scale.
- `crowding.level` is an editorial read (sparse / some / crowded), backed by the supply list.

```yaml
id: example-problem
title: Short name of the problem
oneLine: One sentence a builder can repeat.
who:
  text: Who has this problem, where.
  population:            # optional
    value: 1000000
    label: people affected
    source: { title: "...", publisher: "...", url: "https://...", asOf: "2024" }
evidence:                # at least 2
  - claim: "Sentence stating the figure as the source states it."
    source: { title: "...", publisher: "...", url: "https://...", asOf: "2024-06" }
archetypes: [aging, services]   # agrarian manufacturing services tourism resource remittance aging mixed
countries: [JPN, DEU]           # ISO-3, places where it is acute (optional)
supply:
  - { name: "...", kind: government, what: "...", url: "https://..." }  # government ngo company multilateral cooperative research
supplyNote: "..."               # required only if supply is empty
payers:
  - { who: "...", type: state, why: "..." }  # user state employer insurer diaspora buyer donor platform
graveyard:
  - { name: "...", what: "...", blocker: payer, lesson: "...", url: "https://..." }
graveyardNote: "..."            # required only if graveyard is empty
blockers: [payer, distribution] # distribution trust regulation payer unit-economics data infrastructure behaviour
lenses:
  profit:  { score: 3, why: "..." }
  meaning: { score: 4, why: "..." }
  purpose: { score: 5, why: "..." }
skills: [software, health]      # software design data hardware health agriculture finance operations policy community languages
timeToFirstValue: months        # weeks months years
capital: low                    # low medium high
crowding: { level: some, note: "..." }
buildAngles:                    # 2–4 concrete things a small team could build
  - "..."
firstConversations:             # where to actually find these people
  - "..."
```
