# secop-dashboard

**Contratos a la vista**: a web dashboard that shows how much a Colombian state entity contracts, with whom and how. Search an entity, pick a year, and see the total, the top suppliers, the contracting modalities, the months, and every contract with a link to its file in SECOP II.

Live at <https://0103juan.github.io/secop-dashboard/>. The API behind it runs on a free plan and sleeps when idle, so the first search after a pause can take about a minute.

Angular 22 on top of [secop-api](../secop-api). The interface is in Spanish; this README is in English.

## What it shows

- **A year selector that is also a chart**: each year is a bar as tall as its number of contracts.
- **Four indicators**: total contracted, contracts, distinct suppliers, largest contract.
- **Top suppliers and modalities** as ranked bars, and the value signed per month.
- **The contracts**, largest first, paginated, each linking back to SECOP.
- **A warning when the total cannot be trusted.** Contract values are typed by hand at the source. When one contract explains half or more of a year's total, the page says so and shows what the total would be without it. With real data: Medellín's 2019 total is 100% one contract recorded at about 7.7 × 10²⁰ pesos.

Amounts are written the way Colombians say them (`$4,3 billones`, where a *billón* is 10¹²).

## How it is built

- Standalone components, zoneless, with **signals** for all state.
- **`httpResource`** for data: each request is derived from the route's signals, so changing the year in the URL refetches the right things and nothing else.
- The route is the state: `#/entidad/890905211?year=2024` is a shareable link, bound to the component with `withComponentInputBinding()`. Hash URLs keep deep links working on static hosting.
- `linkedSignal` resets the contract page to 1 whenever the entity or the year changes.
- No UI or chart library: the bars are CSS. Light and dark themes follow the system.

## Run it

```bash
# first, in ../secop-api:  npm install && npm start
npm install
npm start            # http://localhost:4200
npm test             # 3 tests (Vitest, no browser needed)
npm run build
```

On `localhost` the dashboard calls a local API; anywhere else it calls `DEPLOYED_API`, a constant in `src/app/api.ts`.

## Continuous deployment

`.github/workflows/deploy.yml` runs the tests, builds, and publishes to GitHub Pages on every push to `main`. A failing test stops the deployment.

## Limits

- It is a client of `secop-api` and shows nothing without it.
- Only SECOP II: totals are a floor, not all of an entity's contracting.
- Tests cover the amount formatting and the entity page's two key behaviours (default year, dominant-contract warning); there are no end-to-end browser tests.
- No table sorting or filtering beyond year and page.
