from pathlib import Path

import pandas as pd
import pytest

from bitcoin_forecasting.data import chronological_split, load_dataset
from bitcoin_forecasting.features import build_features


DATASET = Path("Data/Data_after_EDA.csv")


def test_repository_dataset_is_clean_and_chronological():
    frame = load_dataset(DATASET)
    assert len(frame) == 546
    assert frame["date"].is_monotonic_increasing
    assert frame["date"].is_unique
    assert not frame.isna().any().any()


def test_target_is_exactly_next_observation():
    raw = load_dataset(DATASET)
    featured = build_features(raw)
    raw_by_date = raw.set_index("date")

    first = featured.iloc[0]
    assert first["target_date"] > first["date"]
    assert first["target_close"] == raw_by_date.loc[first["target_date"], "close"]
    assert first["current_close"] == raw_by_date.loc[first["date"], "close"]


def test_split_has_no_temporal_overlap():
    train, test = chronological_split(build_features(load_dataset(DATASET)))
    assert train["target_date"].max() < test["target_date"].min()
    assert test["target_date"].min() == pd.Timestamp("2019-01-01")


def test_invalid_split_is_rejected():
    featured = build_features(load_dataset(DATASET))
    with pytest.raises(ValueError):
        chronological_split(featured, "2010-01-01")


def test_v2_ohlcv_schema_builds_features(tmp_path):
    dates = pd.date_range("2020-01-01", periods=45, freq="D")
    path = tmp_path / "market.csv"
    pd.DataFrame(
        {
            "date": dates.strftime("%Y-%m-%d"),
            "open": range(100, 145),
            "high": range(105, 150),
            "low": range(95, 140),
            "close": range(101, 146),
            "volume": range(1000, 1045),
        }
    ).to_csv(path, index=False)
    featured = build_features(load_dataset(path))
    assert not featured.empty
    assert {"open", "high", "low", "target_log_return"}.issubset(featured.columns)
