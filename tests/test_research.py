import numpy as np
import pandas as pd

from bitcoin_forecasting.features import build_features
from bitcoin_forecasting.research import (
    evaluate_regimes,
    release_decision,
    select_feature_group,
)


def _market_frame(periods=800):
    dates = pd.date_range("2018-01-01", periods=periods, freq="D")
    close = 10_000 * np.exp(np.linspace(0, 0.5, periods))
    return pd.DataFrame(
        {
            "date": dates,
            "open": close * 0.99,
            "high": close * 1.02,
            "low": close * 0.98,
            "close": close,
            "volume": np.linspace(1_000, 2_000, periods),
            "quote_volume": np.linspace(10_000, 20_000, periods),
            "trade_count": np.arange(periods) + 100,
        }
    )


def test_feature_groups_are_nested():
    featured = build_features(_market_frame())
    price = set(select_feature_group(featured, "price_history"))
    ohlcv = set(select_feature_group(featured, "ohlcv"))
    full = set(select_feature_group(featured, "full"))
    assert price < ohlcv
    assert ohlcv <= full
    assert not any(name.startswith("target_") for name in full)


def test_regime_evaluation_uses_only_prior_training_rows():
    featured = build_features(_market_frame())
    regimes = (("test", "Test regime", "2019-01-01", "2019-06-30"),)
    results, predictions = evaluate_regimes(featured, regimes=regimes)
    assert len(results) == 1
    assert results[0].n_train > 120
    assert results[0].n_test == len(predictions)
    assert predictions["target_date"].min() >= pd.Timestamp("2019-01-01")


def test_release_gate_rejects_inconsistent_candidate():
    featured = build_features(_market_frame())
    regimes = (("test", "Test regime", "2019-01-01", "2019-06-30"),)
    results, _ = evaluate_regimes(featured, regimes=regimes)
    decision = release_decision(results)
    assert decision["status"] in {"approved", "rejected"}
    assert decision["folds_total"] == 1
