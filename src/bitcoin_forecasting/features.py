"""Causal feature engineering for next-day prediction."""

from __future__ import annotations

import numpy as np
import pandas as pd


LAG_WINDOWS = (1, 2, 3, 7, 14, 30)
ROLLING_WINDOWS = (3, 7, 14, 30)


def build_features(frame: pd.DataFrame) -> pd.DataFrame:
    """Build features known at day t and targets for day t+1.

    The resulting ``target_date`` is the day being forecast. No negative shift is
    used for a predictor, so every feature is available before its target.
    """
    data = frame.sort_values("date").copy()
    close = data["close"].astype(float)
    volume = data["volume"].astype(float)

    data["log_return_1d"] = np.log(close).diff()
    data["volume_change_1d"] = volume.pct_change(fill_method=None)

    for lag in LAG_WINDOWS:
        data[f"close_lag_{lag}"] = close.shift(lag)
        data[f"return_lag_{lag}"] = data["log_return_1d"].shift(lag)

    for window in ROLLING_WINDOWS:
        history = close.shift(1).rolling(window)
        data[f"close_ma_{window}"] = history.mean()
        data[f"close_std_{window}"] = history.std()
        data[f"return_std_{window}"] = (
            data["log_return_1d"].shift(1).rolling(window).std()
        )

    for column in (
        "volume",
        "BCHAIN-DIFF",
        "BCHAIN-AVBLS",
        "BCHAIN-MIREV",
        "BCHAIN-CPTRA",
        "BCHAIN-NTRAN",
        "BCHAIN-HRATE",
        "BCHAIN-CPT",
        "BCHAIN-NTRBL",
    ):
        numeric = data[column].astype(float)
        data[f"{column}_change_1d"] = numeric.pct_change(fill_method=None)

    # Calendar values for day t are known before predicting t+1.
    data["day_of_week"] = data["date"].dt.dayofweek
    data["month"] = data["date"].dt.month

    data["current_close"] = close
    data["target_close"] = close.shift(-1)
    data["target_log_return"] = np.log(data["target_close"] / close)
    data["target_date"] = data["date"].shift(-1)

    data = data.replace([np.inf, -np.inf], np.nan).dropna().reset_index(drop=True)
    return data


def feature_columns(frame: pd.DataFrame) -> list[str]:
    """Return predictors while explicitly excluding dates and targets."""
    excluded = {"date", "target_date", "target_close", "target_log_return"}
    return [column for column in frame.columns if column not in excluded]
