# Multi-regime return model release

## Release decision

**Rejected.** The Ridge next-day log-return candidate beat the zero-return
baseline in **0 of 7** declared market regimes. The release policy required at
least **5 of 7** wins and positive mean RMSE improvement.

Across the seven regimes, the candidate's mean RMSE improvement was **-14.88%**
and mean direction accuracy was **50.63%**. The baseline therefore remains the
approved reference.

## Evaluated regimes

- 2018 bear market, beginning after sufficient source history was available;
- 2020 shock and recovery;
- 2021 bull market;
- 2022 deleveraging;
- 2023 recovery;
- 2024 institutional cycle;
- 2025 recent market.

Each fold trains on all feature rows strictly before its declared start date.
No observations from the evaluated regime participate in model fitting.

## Feature ablation

| Feature group | Features | Regimes won | Mean RMSE improvement |
| --- | ---: | ---: | ---: |
| Price history | 28 | 1/7 | -7.60% |
| Price + OHLCV | 35 | 0/7 | -14.88% |
| All available | 36 | 0/7 | -14.95% |

Adding contemporaneous OHLCV fields did not create stable incremental signal.
This is evidence against promoting the current candidate, not evidence that
Bitcoin returns are impossible to forecast under every horizon or dataset.

## Audit artifacts

- `outputs/platform/platform_summary.json`
- `outputs/platform/regime_metrics.csv`
- `outputs/platform/ablation.csv`
- `outputs/platform/figures/regime_comparison.png`
- `outputs/platform/figures/feature_ablation.png`

The governing rules are versioned in
`governance/return_model_release_policy.json`.
