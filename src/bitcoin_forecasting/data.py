"""Dataset loading and chronological splitting."""

from __future__ import annotations

from pathlib import Path

import pandas as pd


REQUIRED_COLUMNS = {
    "date",
    "close",
    "volume",
    "BCHAIN-DIFF",
    "BCHAIN-AVBLS",
    "BCHAIN-MIREV",
    "BCHAIN-CPTRA",
    "BCHAIN-NTRAN",
    "BCHAIN-HRATE",
    "BCHAIN-CPT",
    "BCHAIN-NTRBL",
}


def load_dataset(path: str | Path) -> pd.DataFrame:
    """Load, validate, and chronologically order the modelling dataset."""
    frame = pd.read_csv(path)
    missing = REQUIRED_COLUMNS.difference(frame.columns)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {sorted(missing)}")

    frame = frame.copy()
    frame["date"] = pd.to_datetime(frame["date"], format="%d/%m/%y", errors="raise")
    frame = frame.sort_values("date").reset_index(drop=True)

    if frame["date"].duplicated().any():
        raise ValueError("Dataset contains duplicate dates")
    if frame[list(REQUIRED_COLUMNS - {"date"})].isna().any().any():
        raise ValueError("Dataset contains missing numeric values")
    if not frame["date"].is_monotonic_increasing:
        raise ValueError("Dates must be increasing")
    return frame


def chronological_split(
    frame: pd.DataFrame, split_date: str = "2019-01-01"
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Split by target date; no random split is permitted for this benchmark."""
    boundary = pd.Timestamp(split_date)
    train = frame.loc[frame["target_date"] < boundary].copy()
    test = frame.loc[frame["target_date"] >= boundary].copy()
    if train.empty or test.empty:
        raise ValueError("Split date must leave observations in both train and test")
    if train["target_date"].max() >= test["target_date"].min():
        raise ValueError("Training and test periods overlap")
    return train, test
