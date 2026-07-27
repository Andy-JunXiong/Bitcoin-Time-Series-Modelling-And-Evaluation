"""Command-line tools for refreshing and validating the V2 market dataset."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from .market_data import load_market_data, update_market_dataset, validate_market_data


DEFAULT_OUTPUT = "data/raw/market/btcusdt_1d.csv"


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    update = subparsers.add_parser("update", help="Download or incrementally update daily candles")
    update.add_argument("--start", default="2017-01-01")
    update.add_argument("--end", help="Inclusive UTC date; defaults to the last complete UTC day")
    update.add_argument("--symbol", default="BTCUSDT")
    update.add_argument("--output", default=DEFAULT_OUTPUT)
    update.add_argument("--full-refresh", action="store_true")
    update.add_argument("--parquet", action="store_true", help="Also write Parquet (requires pyarrow)")

    validate = subparsers.add_parser("validate", help="Validate an existing market CSV")
    validate.add_argument("--data", default=DEFAULT_OUTPUT)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    if args.command == "update":
        frame, manifest = update_market_dataset(
            args.output,
            start=args.start,
            end=args.end,
            symbol=args.symbol,
            full_refresh=args.full_refresh,
            write_parquet=args.parquet,
        )
        print(f"Updated {len(frame)} complete daily candles; manifest: {manifest}")
    else:
        summary = validate_market_data(load_market_data(Path(args.data)))
        print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()

