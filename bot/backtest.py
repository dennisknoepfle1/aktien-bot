"""
Backtest: Wie hätte die Regel in der Vergangenheit abgeschnitten?

    python bot/backtest.py          echte Kurse (Yahoo Finance)
    python bot/backtest.py --demo   Zufallsdaten, nur zum Testen

Schreibt docs/data/backtest.json fürs Dashboard.

Ehrlichkeits-Regeln:
  - Gehandelt wird erst am Tag NACH dem Signal (kein Blick in die Zukunft)
  - Jede Umschichtung kostet Gebühren (cost_bps)
  - Vergleich mit "einfach kaufen und liegen lassen"
  - Getrennte Auswertung: erste 70 % / letzte 30 % der Zeit
  - Nicht enthalten: Steuern, Wechselkurs EUR/USD
"""
import argparse
import os
import sys

import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import demo_prices, load_config, load_prices, now_iso, write_json  # noqa: E402
from strategy import target_weights  # noqa: E402

TRADING_DAYS = 252


def run_backtest(prices: pd.DataFrame, bench: pd.Series, cfg: dict) -> pd.DataFrame:
    s, b = cfg["strategy"], cfg["backtest"]
    weights = target_weights(prices, s["sma_days"], s["max_weight_per_symbol"], s["max_invested"])
    held = weights.shift(1).fillna(0.0)          # Signal heute -> Handel morgen
    returns = prices.pct_change().fillna(0.0)
    turnover = held.diff().abs().sum(axis=1).fillna(held.abs().sum(axis=1))
    net = (held * returns).sum(axis=1) - turnover * b["cost_bps"] / 10_000

    ready = prices.rolling(s["sma_days"]).count().min(axis=1) >= s["sma_days"]
    if not ready.any():
        raise RuntimeError("Zu wenig Kursdaten für den gleitenden Durchschnitt.")
    return pd.DataFrame({
        "strategie": net,
        "benchmark": bench.pct_change().reindex(net.index).fillna(0.0),
        "investiert": held.sum(axis=1),
        "umschlag": turnover,
    }).loc[ready.idxmax():]


def stats(r: pd.Series) -> dict:
    eq = (1 + r).cumprod()
    years = len(r) / TRADING_DAYS
    vol = r.std() * np.sqrt(TRADING_DAYS)
    return {
        "cagr": eq.iloc[-1] ** (1 / years) - 1 if years > 0 else None,
        "total": eq.iloc[-1] - 1,
        "volatility": vol,
        "max_drawdown": (eq / eq.cummax() - 1).min(),
        "sharpe": (r.mean() * TRADING_DAYS) / vol if vol > 0 else None,
        "best_year": r.groupby(r.index.year).apply(lambda x: (1 + x).prod() - 1).max(),
        "worst_year": r.groupby(r.index.year).apply(lambda x: (1 + x).prod() - 1).min(),
    }


def period(part: pd.DataFrame, label: str) -> dict:
    years = len(part) / TRADING_DAYS
    return {
        "label": label, "from": part.index[0].strftime("%Y-%m-%d"),
        "to": part.index[-1].strftime("%Y-%m-%d"),
        "strategy": {**stats(part["strategie"]),
                     "avg_invested": part["investiert"].mean(),
                     "trades_per_year": (part["umschlag"] > 0.001).sum() / years},
        "benchmark": stats(part["benchmark"]),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--demo", action="store_true")
    args = ap.parse_args()
    cfg = load_config()
    symbols = list(dict.fromkeys(cfg["symbols"] + [cfg["benchmark"]]))

    if args.demo:
        prices, source = demo_prices(symbols, start=cfg["backtest"]["start"]), "Demo-Zufallsdaten"
    else:
        prices, source = load_prices(symbols, cfg["backtest"]["start"],
                                     os.getenv("ALPACA_API_KEY"), os.getenv("ALPACA_SECRET_KEY"))

    res = run_backtest(prices[cfg["symbols"]], prices[cfg["benchmark"]], cfg)
    split = int(len(res) * 0.7)
    periods = [period(res, "Gesamt"), period(res.iloc[:split], "Erste 70 %"),
               period(res.iloc[split:], "Letzte 30 %")]

    cap = cfg["backtest"]["start_capital"]
    eq = cap * (1 + res[["strategie", "benchmark"]]).cumprod()
    dd = eq / eq.cummax() - 1
    weekly = eq.resample("W-FRI").last().dropna()
    dd_w = dd.resample("W-FRI").min().reindex(weekly.index)
    inv_w = res["investiert"].resample("W-FRI").mean().reindex(weekly.index)
    yearly = res[["strategie", "benchmark"]].groupby(res.index.year).apply(lambda x: (1 + x).prod() - 1)

    write_json("backtest.json", {
        "generated": now_iso(), "data_source": source, "demo": args.demo,
        "symbols": cfg["symbols"], "benchmark": cfg["benchmark"],
        "params": {**cfg["strategy"], "cost_bps": cfg["backtest"]["cost_bps"]},
        "start_capital": cap,
        "end_value": {"strategy": eq["strategie"].iloc[-1], "benchmark": eq["benchmark"].iloc[-1]},
        "periods": periods,
        "yearly": [{"year": int(y), "strategy": r["strategie"], "benchmark": r["benchmark"]}
                   for y, r in yearly.iterrows()],
        "curve": [{"d": d.strftime("%Y-%m-%d"), "s": r["strategie"], "b": r["benchmark"],
                   "dds": dd_w.loc[d, "strategie"], "ddb": dd_w.loc[d, "benchmark"],
                   "inv": inv_w.loc[d]} for d, r in weekly.iterrows()],
    })

    g = periods[0]
    print(f"Backtest {g['from']} bis {g['to']} ({source})")
    for lbl, k in [("Rendite p.a.", "cagr"), ("Max. Drawdown", "max_drawdown"), ("Sharpe", "sharpe")]:
        print(f"  {lbl:15} Strategie {g['strategy'][k]:8.2f}  |  {cfg['benchmark']} {g['benchmark'][k]:8.2f}")
    print(f"  Aus {cap} $ wurden: Strategie {eq['strategie'].iloc[-1]:,.0f} $ | "
          f"{cfg['benchmark']} {eq['benchmark'].iloc[-1]:,.0f} $")


if __name__ == "__main__":
    main()
