# Bitcoin Forecast Intelligence case study

Interactive portfolio presentation for the governed Bitcoin forecasting
platform in the repository root.

The site turns the committed research evidence into an interview-ready story:
seven market regimes, feature ablation, a failed candidate, and a release gate
that preserves the baseline when promotion criteria are not met.

## Run locally

Node.js 22.13 or newer is required.

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
```

The test command creates a production build and verifies that the rendered page
contains the governed platform evidence, release decision, charts, and social
metadata.

## Evidence inputs

The presentation is generated from versioned artifacts copied from the main
research workflow:

- `public/platform-summary.json`
- `public/regime-metrics.csv`
- `public/ablation.csv`
- `public/figures/regime-comparison.png`
- `public/figures/feature-ablation.png`

The canonical research outputs live in `../outputs/platform/`. When those
results change, update the public copies and the page narrative together.

## Deployment

GitHub Actions exports the production build and publishes it to GitHub Pages.
The workflow is defined in
`../.github/workflows/deploy-showcase-pages.yml`.
