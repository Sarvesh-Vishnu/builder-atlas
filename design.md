# Builder Atlas — design contract

A sourced reference for people who want to build something and need to decide who for. It shows who the world's people are, how their economies earn a living, and 16 problems with evidence, existing players, payers and past failures, then ranks them for one builder. The one idea: **before you build, see who the world actually is.** The atlas is an instrument you read; the map and the sourced figures are the pictures, and nothing else decorates.

## 1. Theme and atmosphere
- **Survey sheet.** A cool off-white sheet with ink and hairline rules, like a printed field survey. Rules out: cream paper, boxed cards, shadows.
- **Evidential.** Every figure carries its year and source link where it is read. Rules out: numbers without provenance, count-up animations.
- **Quiet.** No looping motion, no hero animation, nothing that delays reading.
- **Plain-spoken.** Questions and nouns, not slogans.

## 2. Colour and roles
| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#f3f4f1` | `#12171c` | the sheet |
| `--ink` | `#17212b` | `#e6e9e6` | text, primary button fill, rules that matter |
| `--ink-2` | `#3f4b56` | `#b8c0bd` | secondary text |
| `--ink-3` | `#5c6873` | `#929b98` | labels, provenance lines (≥ 4.5:1 on `--bg`) |
| `--rule` | `#cfd4d0` | `#2c353c` | hairlines |
| `--tint` | `#e8eae6` | `#1a2127` | the one tonal band (form column, table header) |
| `--accent` | `#c8361e` | `#ff7257` | **the accent** |

The accent means "look here": focus rings, the current navigation item's underline, a stale-figure flag, the hovered country's outline, and the score of the top fit result. It is never a fill behind text and never decoration.

**Recorded exception: the map's 8 economy-type colours** (`--a-*`). They encode data, so they stay categorical; they are muted earth tones that sit under the ink, and every one is also named in text (legend, tags, country page). Outside the map and its tags, colour is ink plus the one accent. The sequential ramp (`--seq-0…4`) is one hue, used only for single-metric map views.

| Map token | Light | Dark |
|---|---|---|
| `--a-agrarian` | `#6d8f4e` | `#87a866` |
| `--a-manufacturing` | `#c98a3d` | `#d69c55` |
| `--a-services` | `#4f7aa6` | `#6e97c2` |
| `--a-tourism` | `#3f9a96` | `#5cb3ae` |
| `--a-resource` | `#7d6597` | `#9a83b4` |
| `--a-remittance` | `#b5a046` | `#c7b35c` |
| `--a-aging` | `#a0607e` | `#bc7b99` |
| `--a-mixed` | `#a3a8a6` | `#7d8482` |
| `--seq-0…4` | `#e4e6e1` `#bcc7cf` `#8ea3b4` `#5b7690` `#2c4660` | `#222a31` `#2f4a5f` `#47708f` `#6f9cbf` `#a9cbe4` |
| `--nodata` | `#dfe2de` | `#252d34` |

The table's missing-value cells use "—" (justified in the scanner: a data glyph, not prose).

## 3. Typography
- **Instrument Sans** (variable, self-hosted via `@fontsource-variable`) for display and body. Display 600, body 400, labels 500.
- **JetBrains Mono** (self-hosted) for figures, years, provenance lines, scores, eyebrow labels. Tabular numerals wherever numbers sit in columns.
- Scale: h1 `clamp(2.25rem, 5.5vw, 3.75rem)` / h2 `1.6rem` / h3 `1.1rem` / body `17px` (18px under 600px) / small `0.875rem` / label 12px mono uppercase. Nothing that carries information below 12px.
- Measure: running text max 64ch.

## 4. Components
- **Ruled row** (problem index, results, claims, supply, payers, graveyard): a top hairline, content, no box. Hover darkens the rule to ink. Never becomes a card.
- **Toggle** (filters, map views, skills): square, 1px rule border, `aria-pressed`; pressed = ink fill, bg text. Never a pill.
- **Button**: primary = ink fill; secondary = ink outline. Square corners.
- **Figure** (map, waffle, economy bar): a sentence beside it saying what it shows; source line under it in mono.
- **Stat**: mono figure, plain label, year + source link line. A missing value shows "no data published", never a guess.
- **Provenance line**: mono, `--ink-3`, `year · source ↗`; stale years in accent.

## 5. Layout
Max width 1180px, 20px gutters (16px under 600px). Headings get more space above than below. Two-column sections stack under 860px. Fit page: form column 340px + results; stacks under 900px. Page order everywhere: eyebrow label, h1, one lede line, then the figure or index.

## 6. Depth
Rules and one tonal band (`--tint`) only. No shadows except the map tooltip (a 1px rule border, no blur).

## 7. Do and don't
- Do: link every figure to the page that states it. Why: credibility is the product.
- Do: leave unknowns blank with a note ("What people here care about" ships blank). Why: a guess costs the rest.
- Don't: cream paper, Literata, rounded cards, pill chips (v0.1 look, rejected at release, see 10.1).
- Don't: Google Fonts or analytics requests. Why: privacy; the site makes no third-party calls.
- Don't: Inter, Roboto, Space Grotesk, or another project's locked faces.

## 8. Responsive behaviour
Nav labels stay; the wordmark drops to the icon under 640px. Toggles wrap. Stats grid collapses to two columns at 375px. Map stays full-width (it scales); tooltips are pointer-only, so every country is also reachable through `/countries` and the atlas "Jump to a country" select.

## 9. Notes for an agent
- Tokens: `src/styles.css` `:root`. Copy for the method page is built from `RULES` (`src/engine/archetype.ts`) and the weights in `src/engine/fit.ts`; never retype those numbers.
- Every route is pre-rendered (`scripts/prerender.mjs`); a new route must be added to its list.
- Checks: `npm test`, `npx tsc -b`, `npm run build`, `node ~/.claude/skills/munnetrum-design/scripts/tells.mjs .`, `npm run check:links` (manual).
- Base path `/builder-atlas/` (GitHub Pages).

## 10. Amendments

### 10.1 — Release look: Survey sheet
*Changes: all sections. Supersedes: v0.1 look.* (2026-11-19)

Replaced the v0.1 look (cream `#f6f3ec` ground, Literata + Public Sans from Google Fonts, rounded boxed cards, pill chips, 8 bright map colours) with the Survey sheet: cool off-white, hairline rules, square toggles, Instrument Sans + JetBrains Mono self-hosted, one vermilion accent, muted map palette.

**Why.** The owner dropped the warm-paper look across the workspace in Nov 2026, and boxed card grids make every problem look equally important. A public civic reference should read as an instrument, not a product page.

**Considered and rejected.** "Night atlas" (deep ink ground like the portfolio's Blueprint): moodier but makes long evidence lists harder to read and borrows the portfolio's identity. Keeping v0.1 with only the tells fixed: fastest, but the look the owner had already retired.

**Check.** See the release verification in the commit message: widths 320–1440, light and dark, JS off, tells scan.
