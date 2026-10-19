"""Gemeinsame Helfer: Pfade, Konfiguration, Kursdaten, JSON fürs Dashboard."""
import json
import math
import os
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "docs" / "data"
STATE_FILE = ROOT / "bot" / "state.json"
DATA.mkdir(parents=True, exist_ok=True)


def load_config() -> dict:
    cfg = yaml.safe_load(open(ROOT / "config.yaml", encoding="utf-8"))
    syms = cfg["symbols"]
    if isinstance(syms, list):  # erlaubt auch eine einfache Liste
        syms = {s: s for s in syms}
    cfg["names"] = syms
    cfg["symbols"] = list(syms)
    return cfg


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _clean(o):
    if isinstance(o, dict):
        return {k: _clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [_clean(v) for v in o]
    if isinstance(o, (np.floating, float)):
        f = float(o)
        return None if math.isnan(f) or math.isinf(f) else round(f, 6)
    if isinstance(o, np.integer):
        return int(o)
    if isinstance(o, np.bool_):
        return bool(o)
    if isinstance(o, (pd.Timestamp, datetime)):
        return o.isoformat()
    return o


def write_json(name: str, obj):
    (DATA / name).write_text(json.dumps(_clean(obj), ensure_ascii=False, indent=1), encoding="utf-8")


def read_json(name: str, default):
    p = DATA / name
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            return default
    return default


# ---------------------------------------------------------------- Kursdaten
def prices_yahoo(symbols, start) -> pd.DataFrame:
    import yfinance as yf
    raw = yf.download(list(symbols), start=str(start), auto_adjust=True,
                      progress=False, threads=True)
    if raw is None or raw.empty:
        raise RuntimeError("Yahoo lieferte keine Daten")
    px = raw["Close"] if isinstance(raw.columns, pd.MultiIndex) else raw[["Close"]]
    if isinstance(px, pd.Series):
        px = px.to_frame(symbols[0])
    missing = [s for s in symbols if s not in px.columns or px[s].dropna().empty]
    if missing:
        raise RuntimeError(f"Yahoo: keine Daten für {missing}")
    px = px[list(symbols)].dropna(how="all").ffill()
    px.index = pd.to_datetime(px.index).tz_localize(None).normalize()
    return px


def prices_alpaca(symbols, start, key, secret) -> pd.DataFrame:
    from alpaca.data.enums import Adjustment, DataFeed
    from alpaca.data.historical import StockHistoricalDataClient
    from alpaca.data.requests import StockBarsRequest
    from alpaca.data.timeframe import TimeFrame
    client = StockHistoricalDataClient(key, secret)
    bars = client.get_stock_bars(StockBarsRequest(
        symbol_or_symbols=list(symbols), timeframe=TimeFrame.Day,
        start=pd.Timestamp(start).to_pydatetime(), feed=DataFeed.IEX,
        adjustment=Adjustment.ALL)).df
    px = bars["close"].unstack(level=0)
    px.index = pd.to_datetime(px.index).tz_convert(None).normalize()
    return px[list(symbols)].ffill()


def load_prices(symbols, start, key=None, secret=None):
    """Erst Yahoo (lange Historie), bei Problemen Alpaca als Ersatz."""
    try:
        return prices_yahoo(symbols, start), "Yahoo Finance"
    except Exception as e:
        if key and secret:
            print(f"Yahoo fehlgeschlagen ({e}) – nehme Alpaca-Daten")
            return prices_alpaca(symbols, start, key, secret), "Alpaca (IEX)"
        raise


def demo_prices(symbols, start="2005-01-01", end=None, seed=42) -> pd.DataFrame:
    """Künstliche Zufallskurse – nur zum Testen. Keine echten Daten!"""
    rng = np.random.default_rng(seed)
    days = pd.bdate_range(start, end or pd.Timestamp.today().normalize())
    market = rng.normal(0.0003, 0.011, len(days))
    return pd.DataFrame({s: 100 * np.exp(np.cumsum(market + rng.normal(0.0001, 0.008, len(days))))
                         for s in symbols}, index=days)
