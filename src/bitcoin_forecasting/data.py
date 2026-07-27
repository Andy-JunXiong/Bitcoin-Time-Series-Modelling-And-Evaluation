"""Dataset loading and chronological splitting."""

from __future__ import annotations

from pathlib import Path

import pandas as pd


REQUIRED_COLUMNS = {"date", "close", "volume"}

LEGACY_BLOCKCHAIN_COLUMNS = {
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
    # The archived dataset uses DD/MM/YY; V2 market data uses ISO 8601.
    parsed_iso = pd.to_datetime(frame["date"], format="%Y-%m-%d", errors="coerce")
    parsed_legacy = pd.to_datetime(frame["date"], format="%d/%m/%y", errors="coerce")
    frame["date"] = parsed_iso.fillna(parsed_legacy)
    if frame["date"].isna().any():
        raise ValueError("Dataset contains invalid dates; expected YYYY-MM-DD or DD/MM/YY")
    frame = frame.sort_values("date").reset_index(drop=True)

    if frame["date"].duplicated().any():
        raise ValueError("Dataset contains duplicate dates")
    numeric_columns = frame.columns.difference(["date"])
    frame[numeric_columns] = frame[numeric_columns].apply(pd.to_numeric, errors="raise")
    if frame[numeric_columns].isna().any().any():
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
