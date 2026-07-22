"""Training-only tuning and expanding-window holdout evaluation."""

from __future__ import annotations

from dataclasses import dataclass
from math import sqrt

import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import GridSearchCV, TimeSeriesSplit


@dataclass
class EvaluationResult:
    metrics: dict[str, float | int | str]
    predictions: pd.DataFrame
    best_params: dict[str, object]


def _metrics(actual: np.ndarray, predicted: np.ndarray, current: np.ndarray) -> dict[str, float]:
    errors = actual - predicted
    nonzero = actual != 0
    actual_direction = np.sign(actual - current)
    predicted_direction = np.sign(predicted - current)
    return {
        "mae": float(mean_absolute_error(actual, predicted)),
        "rmse": float(sqrt(mean_squared_error(actual, predicted))),
        "mape_percent": float(np.mean(np.abs(errors[nonzero] / actual[nonzero])) * 100),
        "direction_accuracy_percent": float(
            np.mean(actual_direction == predicted_direction) * 100
        ),
    }


def evaluate_naive(test: pd.DataFrame) -> EvaluationResult:
    """Persistence baseline: tomorrow's close equals today's close."""
    actual = test["target_close"].to_numpy(dtype=float)
    current = test["current_close"].to_numpy(dtype=float)
    predictions = test[["target_date", "current_close", "target_close"]].copy()
    predictions["prediction"] = current
    metrics = {"model": "naive", "n_test": len(test), **_metrics(actual, current, current)}
    return EvaluationResult(metrics, predictions, {})


def tune_model(
    estimator: object,
    param_grid: dict[str, list[object]],
    x_train: pd.DataFrame,
    y_train: pd.Series,
    n_splits: int = 5,
) -> tuple[object, dict[str, object]]:
    """Tune only on the training period using ordered folds."""
    folds = min(n_splits, max(2, len(x_train) // 30))
    search = GridSearchCV(
        estimator,
        param_grid,
        scoring="neg_root_mean_squared_error",
        cv=TimeSeriesSplit(n_splits=folds),
        n_jobs=-1,
    )
    search.fit(x_train, y_train)
    return search.best_estimator_, search.best_params_


def expanding_window_evaluate(
    name: str,
    estimator: object,
    train: pd.DataFrame,
    test: pd.DataFrame,
    features: list[str],
) -> EvaluationResult:
    """Refit on all information available before each holdout prediction."""
    history = train.copy()
    predictions: list[float] = []

    for _, observation in test.iterrows():
        fitted = clone(estimator)
        fitted.fit(history[features], history["target_close"])
        point = observation[features].to_frame().T
        predictions.append(float(fitted.predict(point)[0]))
        history = pd.concat([history, observation.to_frame().T], ignore_index=True)

    actual = test["target_close"].to_numpy(dtype=float)
    current = test["current_close"].to_numpy(dtype=float)
    predicted = np.asarray(predictions)
    output = test[["target_date", "current_close", "target_close"]].copy()
    output["prediction"] = predicted
    metrics = {"model": name, "n_test": len(test), **_metrics(actual, predicted, current)}
    return EvaluationResult(metrics, output, {})
