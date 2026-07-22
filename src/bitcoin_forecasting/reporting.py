"""Persist machine-readable metrics, predictions, and portfolio-ready charts."""

from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

from .evaluation import EvaluationResult


DISPLAY_NAMES = {
    "naive": "Naive persistence",
    "ridge": "Ridge",
    "elastic_net": "Elastic Net",
    "random_forest": "Random Forest",
    "hist_gradient_boosting": "Hist. Gradient Boosting",
}


def _display_name(name: object) -> str:
    value = str(name)
    return DISPLAY_NAMES.get(value, value.replace("_", " ").title())


def write_outputs(results: list[EvaluationResult], output_dir: str | Path) -> pd.DataFrame:
    root = Path(output_dir)
    metrics_dir = root / "metrics"
    predictions_dir = root / "predictions"
    figures_dir = root / "figures"
    for directory in (metrics_dir, predictions_dir, figures_dir):
        directory.mkdir(parents=True, exist_ok=True)

    records = [
        {**result.metrics, "best_params": result.best_params} for result in results
    ]
    metrics = pd.DataFrame(records).sort_values("rmse")
    (metrics_dir / "benchmark.json").write_text(
        json.dumps(metrics.to_dict(orient="records"), indent=2), encoding="utf-8"
    )

    for result in results:
        name = str(result.metrics["model"])
        result.predictions.to_csv(predictions_dir / f"{name}.csv", index=False)

    _plot_metrics(metrics, figures_dir / "model_comparison.png")
    _plot_predictions(results, figures_dir / "predictions.png")
    return metrics


def _plot_metrics(metrics: pd.DataFrame, path: Path) -> None:
    ordered = metrics.sort_values("rmse", ascending=True)
    fig, ax = plt.subplots(figsize=(9, 5))
    bars = ax.barh(
        ordered["model"].map(_display_name), ordered["rmse"], color="#f7931a"
    )
    ax.bar_label(bars, fmt="%.1f", padding=4)
    ax.set(title="Next-day Bitcoin forecast error", xlabel="RMSE (USD)", ylabel="")
    ax.set_xlim(0, float(ordered["rmse"].max()) * 1.1)
    ax.grid(axis="x", alpha=0.25)
    fig.tight_layout()
    fig.savefig(path, dpi=160)
    plt.close(fig)


def _plot_predictions(results: list[EvaluationResult], path: Path) -> None:
    fig, ax = plt.subplots(figsize=(12, 6))
    reference = results[0].predictions
    ax.plot(reference["target_date"], reference["target_close"], label="Actual", color="black", linewidth=2)
    for result in results:
        ax.plot(
            result.predictions["target_date"],
            result.predictions["prediction"],
            label=_display_name(result.metrics["model"]),
            alpha=0.75,
        )
    ax.set(title="Walk-forward next-day forecasts", xlabel="Date", ylabel="Bitcoin close (USD)")
    ax.grid(alpha=0.2)
    ax.legend(ncol=2)
    fig.tight_layout()
    fig.savefig(path, dpi=160)
    plt.close(fig)
