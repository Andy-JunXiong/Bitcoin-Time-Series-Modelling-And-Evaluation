"""Model definitions and training-only hyperparameter search spaces."""

from __future__ import annotations

from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import ElasticNet, Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


RANDOM_STATE = 42


def model_registry() -> dict[str, tuple[object, dict[str, list[object]]]]:
    """Create fresh estimators and compact grids suitable for a small dataset."""
    return {
        "ridge": (
            Pipeline([("scale", StandardScaler()), ("model", Ridge())]),
            {"model__alpha": [0.1, 1.0, 10.0, 100.0]},
        ),
        "elastic_net": (
            Pipeline(
                [
                    ("scale", StandardScaler()),
                    (
                        "model",
                        ElasticNet(
                            max_iter=100_000,
                            tol=1e-3,
                            random_state=RANDOM_STATE,
                        ),
                    ),
                ]
            ),
            {
                "model__alpha": [0.01, 0.1, 1.0],
                "model__l1_ratio": [0.1, 0.5, 0.9],
            },
        ),
        "random_forest": (
            RandomForestRegressor(
                n_estimators=300,
                min_samples_leaf=3,
                n_jobs=-1,
                random_state=RANDOM_STATE,
            ),
            {"max_features": [0.5, 1.0], "max_depth": [4, 8, None]},
        ),
        "hist_gradient_boosting": (
            HistGradientBoostingRegressor(
                max_iter=300, l2_regularization=1.0, random_state=RANDOM_STATE
            ),
            {"learning_rate": [0.03, 0.1], "max_leaf_nodes": [7, 15, 31]},
        ),
    }
