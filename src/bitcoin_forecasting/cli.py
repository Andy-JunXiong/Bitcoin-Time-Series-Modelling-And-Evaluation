"""Command-line entry point for the complete benchmark."""

from __future__ import annotations

import argparse
from pathlib import Path

from .data import chronological_split, load_dataset
from .evaluation import evaluate_naive, expanding_window_evaluate, tune_model
from .features import build_features, feature_columns
from .models import model_registry
from .reporting import write_outputs


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", default="Data/Data_after_EDA.csv")
    parser.add_argument("--split-date", default="2019-01-01")
    parser.add_argument("--output-dir", default="outputs")
    parser.add_argument(
        "--models",
        nargs="+",
        default=["ridge", "elastic_net", "random_forest", "hist_gradient_boosting"],
    )
    parser.add_argument(
        "--quick",
        action="store_true",
        help="Evaluate only the naive baseline and Ridge model.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data = build_features(load_dataset(Path(args.data)))
    train, test = chronological_split(data, args.split_date)
    features = feature_columns(data)
    registry = model_registry()
    requested = ["ridge"] if args.quick else args.models
    unknown = sorted(set(requested).difference(registry))
    if unknown:
        raise SystemExit(f"Unknown models: {unknown}. Available: {sorted(registry)}")

    results = [evaluate_naive(test)]
    for name in requested:
        estimator, grid = registry[name]
        tuned, best_params = tune_model(
            estimator, grid, train[features], train["target_close"]
        )
        result = expanding_window_evaluate(name, tuned, train, test, features)
        result.best_params.update(best_params)
        results.append(result)

    metrics = write_outputs(results, args.output_dir)
    print(metrics.to_string(index=False))


if __name__ == "__main__":
    main()
