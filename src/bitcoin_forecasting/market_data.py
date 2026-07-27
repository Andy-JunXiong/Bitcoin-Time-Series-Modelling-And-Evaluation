"""Download, validate, and version daily Binance spot market data."""

from __future__ import annotations

import hashlib
import json
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Callable
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import pandas as pd


BINANCE_MARKET_DATA_URL = "https://data-api.binance.vision/api/v3/klines"
MARKET_COLUMNS = [
    "date",
    "open",
    "high",
    "low",
    "close",
    "volume",
    "quote_volume",
    "trade_count",
]
DAY_MS = 86_400_000


def _utc_date(value: str | date | datetime) -> date:
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc).date() if value.tzinfo else value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(value)


def last_complete_utc_date(now: datetime | None = None) -> date:
    """Return the most recent fully closed UTC trading day."""
    current = now or datetime.now(timezone.utc)
    if current.tzinfo is None:
        current = current.replace(tzinfo=timezone.utc)
    return current.astimezone(timezone.utc).date() - timedelta(days=1)


def _date_to_ms(value: date) -> int:
    instant = datetime.combine(value, datetime.min.time(), tzinfo=timezone.utc)
    return int(instant.timestamp() * 1000)


def _request_json(url: str, timeout: float = 30.0) -> list[list[object]]:
    request = Request(url, headers={"User-Agent": "bitcoin-forecasting/2.0"})
    try:
        with urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Market-data request failed: {exc}") from exc


def download_daily_klines(
    start: str | date,
    end: str | date,
    *,
    symbol: str = "BTCUSDT",
    base_url: str = BINANCE_MARKET_DATA_URL,
    request_json: Callable[[str], list[list[object]]] = _request_json,
) -> pd.DataFrame:
    """Download inclusive, closed UTC daily candles using paginated requests."""
    start_date, end_date = _utc_date(start), _utc_date(end)
    if end_date < start_date:
        raise ValueError("End date must not be earlier than start date")

    rows: list[list[object]] = []
    cursor = _date_to_ms(start_date)
    final_ms = _date_to_ms(end_date) + DAY_MS - 1
    while cursor <= final_ms:
        query = urlencode(
            {
                "symbol": symbol.upper(),
                "interval": "1d",
                "startTime": cursor,
                "endTime": final_ms,
                "limit": 1000,
                "timeZone": "0",
            }
        )
        page = request_json(f"{base_url}?{query}")
        if not page:
            break
        rows.extend(page)
        next_cursor = int(page[-1][0]) + DAY_MS
        if next_cursor <= cursor:
            raise RuntimeError("Market-data API did not advance pagination")
        cursor = next_cursor

    records = [
        {
            "date": pd.to_datetime(int(row[0]), unit="ms", utc=True).date(),
            "open": float(row[1]),
            "high": float(row[2]),
            "low": float(row[3]),
            "close": float(row[4]),
            "volume": float(row[5]),
            "quote_volume": float(row[7]),
            "trade_count": int(row[8]),
        }
        for row in rows
    ]
    frame = pd.DataFrame.from_records(records, columns=MARKET_COLUMNS)
    if not frame.empty:
        frame = frame.loc[
            (frame["date"] >= start_date) & (frame["date"] <= end_date)
        ].drop_duplicates("date", keep="last")
    return frame.reset_index(drop=True)


def load_market_data(path: str | Path) -> pd.DataFrame:
    frame = pd.read_csv(path, parse_dates=["date"])
    frame["date"] = frame["date"].dt.date
    return frame


def validate_market_data(
    frame: pd.DataFrame, *, missing_dates_allowed: int = 0
) -> dict[str, object]:
    """Validate OHLC invariants, uniqueness, numeric values, and daily continuity."""
    missing_columns = set(MARKET_COLUMNS).difference(frame.columns)
    if missing_columns:
        raise ValueError(f"Missing market columns: {sorted(missing_columns)}")
    if frame.empty:
        raise ValueError("Market dataset is empty")
    data = frame.copy().sort_values("date")
    if data["date"].duplicated().any():
        raise ValueError("Market dataset contains duplicate dates")
    numeric = MARKET_COLUMNS[1:]
    if data[numeric].isna().any().any():
        raise ValueError("Market dataset contains missing numeric values")
    if (data[["open", "high", "low", "close"]] <= 0).any().any():
        raise ValueError("OHLC prices must be positive")
    if (data[["volume", "quote_volume", "trade_count"]] < 0).any().any():
        raise ValueError("Volume and trade counts must be non-negative")
    if (data["high"] < data[["open", "close", "low"]].max(axis=1)).any():
        raise ValueError("High price violates OHLC invariants")
    if (data["low"] > data[["open", "close", "high"]].min(axis=1)).any():
        raise ValueError("Low price violates OHLC invariants")

    dates = pd.DatetimeIndex(pd.to_datetime(data["date"]))
    expected = pd.date_range(dates.min(), dates.max(), freq="D")
    missing = expected.difference(dates)
    if len(missing) > missing_dates_allowed:
        preview = [value.date().isoformat() for value in missing[:5]]
        raise ValueError(f"Market dataset has {len(missing)} missing dates: {preview}")
    return {
        "row_count": len(data),
        "start_date": dates.min().date().isoformat(),
        "end_date": dates.max().date().isoformat(),
        "missing_date_count": len(missing),
    }


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def update_market_dataset(
    output: str | Path,
    *,
    start: str | date = "2017-01-01",
    end: str | date | None = None,
    symbol: str = "BTCUSDT",
    full_refresh: bool = False,
    write_parquet: bool = False,
) -> tuple[pd.DataFrame, Path]:
    """Create or incrementally update a validated market-data cache and manifest."""
    output_path = Path(output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    requested_end = _utc_date(end) if end else last_complete_utc_date()
    existing: pd.DataFrame | None = None
    download_start = _utc_date(start)
    if output_path.exists() and not full_refresh:
        existing = load_market_data(output_path)
        validate_market_data(existing)
        download_start = max(download_start, max(existing["date"]) + timedelta(days=1))

    if download_start <= requested_end:
        fresh = download_daily_klines(download_start, requested_end, symbol=symbol)
        combined = pd.concat([existing, fresh], ignore_index=True) if existing is not None else fresh
    elif existing is not None:
        combined = existing
    else:
        raise ValueError("Requested date range contains no complete UTC days")

    combined = combined.sort_values("date").drop_duplicates("date", keep="last")
    combined = combined.loc[
        (combined["date"] >= _utc_date(start)) & (combined["date"] <= requested_end)
    ].reset_index(drop=True)
    summary = validate_market_data(combined)
    combined.to_csv(output_path, index=False, date_format="%Y-%m-%d")
    if write_parquet:
        combined.assign(date=pd.to_datetime(combined["date"])).to_parquet(
            output_path.with_suffix(".parquet"), index=False
        )

    manifest_path = output_path.parent / "dataset_manifest.json"
    manifest = {
        "schema_version": 1,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "source": "Binance Spot Market Data REST API",
        "source_url": BINANCE_MARKET_DATA_URL,
        "symbol": symbol.upper(),
        "interval": "1d",
        "timezone": "UTC",
        "complete_days_only": True,
        **summary,
        "csv_path": str(output_path.as_posix()),
        "csv_sha256": _sha256(output_path),
    }
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return combined, manifest_path

