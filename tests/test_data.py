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
