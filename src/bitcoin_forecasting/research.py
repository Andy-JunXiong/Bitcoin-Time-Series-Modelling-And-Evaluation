"""Cross-regime return forecasting, feature ablation, and release gating."""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from .data import load_dataset
from .features import build_features, feature_columns


REGIMES = (
    ("2018_bear", "2018 bear market", "2018-03-01", "2018-12-31"),
    ("2020_shock", "2020 shock & recovery", "2020-01-01", "2020-12-31"),
    ("2021_bull", "2021 bull market", "2021-01-01", "2021-12-31"),
    ("2022_bear", "2022 deleveraging", "2022-01-01", "2022-12-31"),
    ("2023_recovery", "2023 recovery", "2023-01-01", "2023-12-31"),
    ("2024_institutional", "2024 institutional cycle", "2024-01-01", "2024-12-31"),
    ("2025_recent", "2025 recent market", "2025-01-01", "2025-12-31"),
)


@dataclass
class RegimeResult:
    regime: str
    label: str
    start_date: str
    end_date: str
    n_train: int
    n_test: int
    baseline_rmse_bps: float
    candidate_rmse_bps: float
    rmse_improvement_percent: float
    baseline_mae_bps: float
    candidate_mae_bps: float
    direction_accuracy_percent: float
    candidate_won: bool


def research_model() -> Pipeline:
    """Stable, interpretable candidate for the platform-level benchmark."""
    return Pipeline(
        [("scale", StandardScaler()), ("model", Ridge(alpha=10.0))]
    )


def select_feature_group(frame: pd.DataFrame, group: str) -> list[str]:
    """Return an auditable feature group for ablation experiments."""
    available = feature_columns(frame)
    price_prefixes = (
        "current_close",
        "log_return_",
        "close_lag_",
        "return_lag_",
        "close_ma_",
        "close_std_",
        "return_std_",
        "day_of_week",
        "month",
    )
    price = [name for name in available if name.startswith(price_prefixes)]
    if group == "price_history":
        return price
    if group == "ohlcv":
        market_names = {
            "open",
            "high",
            "low",
            "volume",
            "quote_volume",
            "trade_count",
            "volume_change_1d",
        }
        return list(dict.fromkeys(price + [name for name in available if name in market_names]))
    if group == "full":
        return available
    raise ValueError(f"Unknown feature group: {group}")


def _return_metrics(actual: np.ndarray, predicted: np.ndarray) -> dict[str, float]:
    error = actual - predicted
    return {
        "rmse_bps": float(np.sqrt(np.mean(error**2)) * 10_000),
        "mae_bps": float(np.mean(np.abs(error)) * 10_000),
        "direction_accuracy_percent": float(
            np.mean(np.sign(actual) == np.sign(predicted)) * 100
        ),
    }


def evaluate_regimes(
    featured: pd.DataFrame,
    *,
    feature_group: str = "ohlcv",
    regimes: tuple[tuple[str, str, str, str], ...] = REGIMES,
) -> tuple[list[RegimeResult], pd.DataFrame]:
    """Fit on all prior history and score each declared market regime."""
    features = select_feature_group(featured, feature_group)
    results: list[RegimeResult] = []
    predictions: list[pd.DataFrame] = []

    for key, label, start, end in regimes:
        start_date, end_date = pd.Timestamp(start), pd.Timestamp(end)
        train = featured.loc[featured["target_date"] < start_date].copy()
        test = featured.loc[
            featured["target_date"].between(start_date, end_date)
        ].copy()
        if len(train) < 120 or len(test) < 30:
            continue

        model = research_model()
        model.fit(train[features], train["target_log_return"])
        actual = test["target_log_return"].to_numpy(dtype=float)
        candidate = model.predict(test[features])
        baseline = np.zeros_like(actual)
        baseline_metrics = _return_metrics(actual, baseline)
        candidate_metrics = _return_metrics(actual, candidate)
        improvement = (
            1 - candidate_metrics["rmse_bps"] / baseline_metrics["rmse_bps"]
        ) * 100

        results.append(
            RegimeResult(
                regime=key,
                label=label,
                start_date=start,
                end_date=end,
                n_train=len(train),
                n_test=len(test),
                baseline_rmse_bps=baseline_metrics["rmse_bps"],
                candidate_rmse_bps=candidate_metrics["rmse_bps"],
                rmse_improvement_percent=float(improvement),
                baseline_mae_bps=baseline_metrics["mae_bps"],
                candidate_mae_bps=candidate_metrics["mae_bps"],
                direction_accuracy_percent=candidate_metrics[
                    "direction_accuracy_percent"
                ],
                candidate_won=bool(
                    candidate_metrics["rmse_bps"] < baseline_metrics["rmse_bps"]
                ),
            )
        )
        fold = test[["target_date", "current_close", "target_close"]].copy()
        fold["regime"] = key
        fold["actual_return"] = actual
        fold["baseline_return"] = baseline
        fold["candidate_return"] = candidate
        predictions.append(fold)

    if not results:
        raise ValueError("No regime has enough training and test observations")
    return results, pd.concat(predictions, ignore_index=True)


def release_decision(results: list[RegimeResult]) -> dict[str, object]:
    """Apply a strict, explicit promotion gate to cross-regime evidence."""
    wins = sum(result.candidate_won for result in results)
    required_wins = max(1, int(np.ceil(len(results) * 0.6)))
    mean_improvement = float(
        np.mean([result.rmse_improvement_percent for result in results])
    )
    mean_direction = float(
        np.mean([result.direction_accuracy_percent for result in results])
    )
    passed = wins >= required_wins and mean_improvement > 0
    return {
        "status": "approved" if passed else "rejected",
        "candidate": "ridge_log_return",
        "baseline": "zero_return",
        "folds_won": wins,
        "folds_total": len(results),
        "required_folds_won": required_wins,
        "mean_rmse_improvement_percent": mean_improvement,
        "mean_direction_accuracy_percent": mean_direction,
        "rules": [
            "Candidate must beat zero-return RMSE in at least 60% of regimes.",
            "Mean RMSE improvement across regimes must be positive.",
        ],
    }


def run_ablation(featured: pd.DataFrame) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for group in ("price_history", "ohlcv", "full"):
        results, _ = evaluate_regimes(featured, feature_group=group)
        rows.append(
            {
                "feature_group": group,
                "feature_count": len(select_feature_group(featured, group)),
                "folds_won": sum(item.candidate_won for item in results),
                "folds_total": len(results),
                "mean_candidate_rmse_bps": float(
                    np.mean([item.candidate_rmse_bps for item in results])
                ),
                "mean_rmse_improvement_percent": float(
                    np.mean([item.rmse_improvement_percent for item in results])
                ),
                "mean_direction_accuracy_percent": float(
                    np.mean([item.direction_accuracy_percent for item in results])
                ),
            }
        )
    return rows


def _plot_regimes(results: list[RegimeResult], path: Path) -> None:
    labels = [item.label for item in results]
    y = np.arange(len(results))
    fig, ax = plt.subplots(figsize=(11, 6))
    ax.barh(y + 0.18, [item.baseline_rmse_bps for item in results], 0.34, label="Zero-return baseline", color="#777777")
    ax.barh(y - 0.18, [item.candidate_rmse_bps for item in results], 0.34, label="Ridge candidate", color="#f7931a")
    ax.set(yticks=y, yticklabels=labels, xlabel="Return RMSE (basis points)", title="Cross-regime next-day return benchmark")
    ax.grid(axis="x", alpha=0.2)
    ax.legend()
    fig.tight_layout()
    fig.savefig(path, dpi=160)
    plt.close(fig)


def _plot_ablation(rows: list[dict[str, object]], path: Path) -> None:
    labels = [str(row["feature_group"]).replace("_", " ").title() for row in rows]
    values = [float(row["mean_candidate_rmse_bps"]) for row in rows]
    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(labels, values, color=["#222222", "#f7931a", "#9c5f17"])
    ax.bar_label(bars, fmt="%.1f", padding=4)
    ax.set(ylabel="Mean RMSE (basis points)", title="Feature-group ablation")
    ax.grid(axis="y", alpha=0.2)
    fig.tight_layout()
    fig.savefig(path, dpi=160)
    plt.close(fig)


def write_research_outputs(
    data_path: str | Path, output_dir: str | Path
) -> dict[str, object]:
    raw = load_dataset(data_path)
    featured = build_features(raw)
    results, predictions = evaluate_regimes(featured)
    ablation = run_ablation(featured)
    gate = release_decision(results)

    root = Path(output_dir)
    figures = root / "figures"
    root.mkdir(parents=True, exist_ok=True)
    figures.mkdir(parents=True, exist_ok=True)
    regime_rows = [asdict(result) for result in results]
    pd.DataFrame(regime_rows).to_csv(root / "regime_metrics.csv", index=False)
    pd.DataFrame(ablation).to_csv(root / "ablation.csv", index=False)
    predictions.to_csv(root / "regime_predictions.csv", index=False)
    _plot_regimes(results, figures / "regime_comparison.png")
    _plot_ablation(ablation, figures / "feature_ablation.png")

    summary = {
        "schema_version": 1,
        "dataset": {
            "row_count": len(raw),
            "start_date": raw["date"].min().date().isoformat(),
            "end_date": raw["date"].max().date().isoformat(),
            "feature_row_count": len(featured),
        },
        "experiment": {
            "target": "next_day_log_return",
            "candidate": "ridge_alpha_10",
            "baseline": "zero_return",
            "validation": "declared expanding-history market regimes",
            "feature_group": "ohlcv",
        },
        "regimes": regime_rows,
        "ablation": ablation,
        "release_gate": gate,
    }
    (root / "platform_summary.json").write_text(
        json.dumps(summary, indent=2), encoding="utf-8"
    )
    return summary


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", default="Data/raw/market/btcusdt_1d.csv")
    parser.add_argument("--output-dir", default="outputs/platform")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    summary = write_research_outputs(args.data, args.output_dir)
    gate = summary["release_gate"]
    print(
        f"Evaluated {gate['folds_total']} regimes; "
        f"candidate {gate['status']} ({gate['folds_won']} folds won)."
    )


if __name__ == "__main__":
    main()
