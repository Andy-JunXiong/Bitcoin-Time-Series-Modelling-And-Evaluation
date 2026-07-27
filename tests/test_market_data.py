from datetime import datetime, timezone
from urllib.parse import parse_qs, urlparse

import pandas as pd
import pytest

from bitcoin_forecasting.market_data import (
    download_daily_klines,
    last_complete_utc_date,
    validate_market_data,
)


def _kline(day_ms: int, close: float = 101.0) -> list[object]:
    return [day_ms, "100", "105", "95", str(close), "10", day_ms + 86_399_999, "1000", 20]


def test_last_complete_utc_date_excludes_current_day():
    now = datetime(2026, 7, 23, 23, 59, tzinfo=timezone.utc)
    assert last_complete_utc_date(now).isoformat() == "2026-07-22"


def test_download_parses_and_paginates_daily_klines():
    first = int(pd.Timestamp("2020-01-01", tz="UTC").timestamp() * 1000)
    calls = []

    def fake_request(url):
        calls.append(url)
        start = int(parse_qs(urlparse(url).query)["startTime"][0])
        if start == first:
            return [_kline(first), _kline(first + 86_400_000, 102)]
        return [_kline(first + 2 * 86_400_000, 103)]

    frame = download_daily_klines("2020-01-01", "2020-01-03", request_json=fake_request)
    assert len(calls) == 2
    assert frame["date"].astype(str).tolist() == ["2020-01-01", "2020-01-02", "2020-01-03"]
    assert frame["close"].tolist() == [101.0, 102.0, 103.0]


def test_market_validation_detects_missing_day():
    frame = pd.DataFrame(
        {
            "date": [pd.Timestamp("2020-01-01").date(), pd.Timestamp("2020-01-03").date()],
            "open": [100.0, 100.0],
            "high": [105.0, 105.0],
            "low": [95.0, 95.0],
            "close": [101.0, 101.0],
            "volume": [10.0, 10.0],
            "quote_volume": [1000.0, 1000.0],
            "trade_count": [20, 20],
        }
    )
    with pytest.raises(ValueError, match="missing dates"):
        validate_market_data(frame)

