# Generated outputs

Running the benchmark creates:

- `metrics/benchmark.json` — comparable holdout metrics;
- `predictions/<model>.csv` — dated walk-forward predictions;
- `figures/model_comparison.png` — RMSE comparison;
- `figures/predictions.png` — actual versus predicted prices.

Detailed prediction CSV files are ignored by Git to avoid noisy diffs. The compact benchmark JSON and final figures are versioned so the headline result remains visible in the portfolio repository.
