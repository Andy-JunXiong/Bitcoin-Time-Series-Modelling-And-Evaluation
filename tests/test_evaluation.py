import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

from bitcoin_forecasting.evaluation import evaluate_naive, expanding_window_evaluate


def _sample() -> tuple[pd.DataFrame, pd.DataFrame]:
    frame = pd.DataFrame(
        {
            "target_date": pd.date_range("2020-01-02", periods=8),
            "current_close": np.arange(1.0, 9.0),
            "feature": np.arange(1.0, 9.0),
            "target_close": np.arange(2.0, 10.0),
        }
    )
    return frame.iloc[:5].copy(), frame.iloc[5:].copy()


def test_naive_baseline_uses_current_close():
    _, test = _sample()
    result = evaluate_naive(test)
    assert result.predictions["prediction"].equals(test["current_close"])
    assert result.metrics["rmse"] == 1.0


def test_expanding_window_predicts_each_holdout_row():
    train, test = _sample()
    result = expanding_window_evaluate(
        "linear", LinearRegression(), train, test, ["feature"]
    )
    assert len(result.predictions) == len(test)
    assert result.metrics["rmse"] < 1e-10
