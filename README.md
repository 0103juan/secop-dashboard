# secop-dashboard

**Contratos a la vista**: a web dashboard that shows how much a Colombian state entity contracts, with whom, how and when, and says what those figures mean. Search an entity, pick a year, and read it: the totals against the previous year, how concentrated the suppliers are, how much was awarded without competition, and every contract with a link to its file in SECOP II.

Live at <https://0103juan.github.io/secop-dashboard/>. The API behind it runs on a free plan and sleeps when idle, so the first search after a pause can take about a minute.

Angular 22 on top of [secop-api](../secop-api). The interface is in Spanish; this README is in English.

## What it shows

The page answers four questions about one entity in one year, and explains each figure instead of leaving it to the reader.

- **The year in one sentence**, then four figures, each with a line of context: the change against the previous year, contracts per supplier, the share of the largest contract.
- **What the figures say.** Up to four readings, each a figure, the sentences behind it and how it was calculated: the change against the previous year, how much of the value the largest suppliers hold, how the money was awarded, and when it was signed. Hovering a panel opens its explanation.
- **Who**: the top suppliers as ranked bars.
- **How**: the year's value split by the way the contractor was chosen (directly, by competition, under a special regime), with what each one means in plain words. Below it, the modalities as the register names them.
- **When**: the value signed per month, with the peak marked.
- **What**: the contracts, largest first, paginated, each linking back to SECOP. On a phone each contract is a block instead of a table row.
- **A modality is a filter.** Clicking "Licitación pública" narrows the table to those contracts. The filter lives in the URL, so the filtered view is a link, and changing year drops it, because the next year may not have that modality.
- **A year selector that is also a chart**: each year is a bar as tall as its number of contracts.

The readings describe what is registered; none of them rates an entity. Three rules keep them honest:

- **A total that one contract explains is not presented as spending.** Contract values are typed by hand at the source. When one contract is half or more of a year, the page says so, shows the total without it, and drops the peso figure from the headline. With real data: Medellín's 2019 total is 100% one contract recorded at about 7.7 × 10²⁰ pesos.
- **Such a year is not compared with another.** The reading says the totals cannot be compared and falls back to the number of contracts.
- **The current year is marked as unfinished** when it is compared with a full one.

Amounts are written the way Colombians say them (`$4,3 billones`, where a *billón* is 10¹²).

## How it is built

```
src/app/
  core/secop-api.ts     the contract with the API and the only place that knows its URLs
  core/format.ts        pesos, shares and counts as people read them
  entity/insights.ts    what a year's figures say, as pure functions: one rule per reading
  entity/entity-page    reads the URL, asks the API, lays the page out
  entity/*.ts           one component per block: year picker, figures, readings, ranking,
                        award methods, month chart, contract table
  ui/                   animated components ported from Skiper UI
  app, home             the frame with the search, and the landing page
```

- **One reason to change per file.** The page component only orchestrates. What the numbers mean lives in `insights.ts`, which imports nothing from Angular, so every sentence the page can say is unit-tested without rendering anything.
- **Open to a new reading without touching the others.** A reading is a function from the year to a figure and its explanation, or to nothing when it does not apply; the page shows whatever the list returns.
- **Components know as little as they can.** `Ranking` draws rows with a label, a value and a caption, and serves both suppliers and modalities. No block receives the whole API response when three fields are enough.
- **The page depends on an abstraction, not on a URL.** Components inject `SecopApi`; its base URL is an injection token, which is how the tests point it somewhere else.
- **Signals and `httpResource`** for all state and data: each request is derived from the route's signals, so changing the year in the URL refetches the right things and nothing else. `linkedSignal` resets the contract page to 1 whenever the entity, the year or the modality changes.
- The route is the state: `#/entidad/890905211?year=2024` is a shareable link, bound to the component with `withComponentInputBinding()`. Hash URLs keep deep links working on static hosting.
- **Which modality awards how is decided by the API**, not here, so the mobile app and this dashboard cannot disagree.
- No chart library: the bars are CSS. One dark theme, shared with the portfolio site and the mobile app: near-black, one accent, condensed headlines, no rounded corners. The two fonts are self-hosted.

### Components ported from Skiper UI

[Skiper UI](https://skiper-ui.com) is a React library, so its components cannot be installed in Angular. Five of them are rewritten in `src/app/ui/` as standalone Angular components, with CSS transitions and signals in place of framer-motion: the hover-expand panels that hold the readings, the text that rolls on hover, the blur under the sticky header, the scroll-progress ring and the line that draws itself on the landing page. Each file credits the original, as the free licence asks, and all of them stand still when the reader prefers reduced motion.

## Run it

```bash
# first, in ../secop-api:  npm install && npm start
npm install
npm start            # http://localhost:4200
npm test             # 12 unit tests (Vitest, no browser needed)
npm run e2e          # 6 end-to-end tests (Playwright); first run: npx playwright install chromium
npm run build
```

## End-to-end tests

`npm run e2e` drives a real browser against this dashboard and the **real secop-api**, taken from the repository next to this one (or `SECOP_API_DIR`). The only fake is the government portal: `e2e/api.mts` starts the API with a `fetch` that answers each query from five contracts. So the tests cross the same code that is deployed on both sides: routing, validation, CORS and the modality lookup in the API, and the search, the URL state and the rendering here.

They cover the journey (search without accents, open the latest year, filter by modality, remove the filter), the readings of a year (the figures, the panel that opens on hover, the award methods as the API classified them, the peak month), the shareable filtered link, the warning for a year that one mistyped contract explains, a made-up modality (`x' OR '1'='1`) being refused by the API with a 400 instead of answered with every contract, and contract links pointing only to SECOP.

On `localhost` the dashboard calls a local API; anywhere else it calls the deployed one. Both come from `API_BASE_URL`, an injection token in `src/app/core/secop-api.ts`.

## Continuous deployment

`.github/workflows/deploy.yml` runs the unit tests, checks out secop-api and runs the end-to-end tests, then builds and publishes to GitHub Pages on every push to `main`. A failing test of either kind stops the deployment.

## Limits

- It is a client of `secop-api` and shows nothing without it.
- Only SECOP II: totals are a floor, not all of an entity's contracting.
- The end-to-end tests run on Chromium only and against a fake portal with five contracts; they say nothing about how the real portal behaves or how fast it is.
- No table sorting, and no filtering beyond year, modality and page.
- The readings are arithmetic on one year of one entity. They do not compare entities with each other, adjust for inflation or know why a figure moved.
- Supplier concentration is measured on the ten largest suppliers the API returns, not on all of them.
- The award method comes from the modality's name. A contract registered under the wrong modality is counted where the register put it.
