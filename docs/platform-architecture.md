# Bitcoin Forecast Intelligence Platform

## Decision boundary

The platform evaluates whether declared daily-market features improve next-day
Bitcoin forecasts over simple, auditable baselines. It supports research review
and model-selection decisions. It does not publish trading advice, assign
positions, or claim profitability.

## Evidence flow

```text
Binance complete UTC candles
        ↓
Raw CSV + SHA-256 manifest
        ↓
Validated daily market contract
        ↓
Leakage-safe feature snapshot
        ↓
Declared cross-regime backtests
        ↓
Feature ablation + release gate
        ↓
Approved candidate or preserved baseline
```

### Raw

`bitcoin-data update` downloads complete UTC daily candles incrementally. The
cache remains reproducible through a source manifest, bounded coverage dates,
row count, and SHA-256 checksum.

### Validated

The market-data contract requires continuity, uniqueness, numeric values, and
OHLC invariants. Invalid inputs fail before feature generation.

### Feature snapshot

Day `t` inputs predict day `t+1`. Lag and rolling transformations use only
information available by the end of day `t`. Price-history, OHLCV, and complete
feature groups are declared separately for ablation.

### Model evidence

`bitcoin-research` fits the candidate on all observations before each declared
market regime and evaluates next-day log returns within that regime. The
zero-return forecast is the minimum baseline.

### Release gate

Promotion requires the candidate to beat baseline RMSE in at least 60% of
regimes and deliver positive mean RMSE improvement. Failure is a valid outcome:
the candidate is rejected and the baseline remains the reference.

## Reproduce

```bash
python -m bitcoin_forecasting.data_cli validate
python -m bitcoin_forecasting.research
python -m pytest -q
```

Committed platform evidence is stored in `outputs/platform/`.
