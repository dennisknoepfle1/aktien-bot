"""
Der tägliche Bot-Lauf. Wird von GitHub Actions automatisch gestartet
(.github/workflows/bot.yml), kann aber auch lokal laufen.

    python bot/bot.py            Probelauf: rechnet alles, sendet keine Orders
    python bot/bot.py --handeln  Orders an das Alpaca-PAPER-Konto senden
    python bot/bot.py --demo     Zufallsdaten, ohne Internet/Alpaca (zum Testen)

Ergebnisse landen als JSON in docs/data/ – daraus liest das Dashboard.

SICHERHEIT
  - paper=True ist fest verdrahtet. Echtes Geld ist absichtlich nicht vorgesehen.
  - Not-Aus bei Tages- oder Gesamtverlust (config.yaml -> risk)
  - Orders nur bei geöffneter US-Börse
  - Ohne API-Schlüssel läuft der Bot im Modus "nur Signale"
"""
import argparse
import json
import os
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (STATE_FILE, demo_prices, load_config, load_prices,  # noqa: E402
                    now_iso, read_json, write_json)
from strategy import target_weights  # noqa: E402

RUN_LOG = []


def say(msg: str, level: str = "info"):
    print(f"[{level.upper():5}] {msg}", flush=True)
    RUN_LOG.append({"level": level, "msg": msg})


# ------------------------------------------------------------------ Broker
class AlpacaPaperBroker:
    """Dünne Hülle um Alpaca. paper=True ist fest verdrahtet."""

    def __init__(self, key: str, secret: str):
        from alpaca.trading.client import TradingClient
        self.client = TradingClient(key, secret, paper=True)

    def market_open(self) -> bool:
        return bool(self.client.get_clock().is_open)

    def account(self) -> dict:
        a = self.client.get_account()
        return {"equity": float(a.equity), "last_equity": float(a.last_equity),
                "cash": float(a.cash), "blocked": bool(a.trading_blocked)}

    def positions(self) -> dict:
        return {p.symbol: {"qty": float(p.qty), "value": float(p.market_value),
                           "avg_price": float(p.avg_entry_price),
                           "pl": float(p.unrealized_pl), "pl_pct": float(p.unrealized_plpc) * 100}
                for p in self.client.get_all_positions()}

    def _order(self, symbol, usd, side):
        from alpaca.trading.enums import OrderSide, TimeInForce
        from alpaca.trading.requests import MarketOrderRequest
        return self.client.submit_order(MarketOrderRequest(
            symbol=symbol, notional=round(usd, 2),
            side=OrderSide.BUY if side == "buy" else OrderSide.SELL,
            time_in_force=TimeInForce.DAY))

    def buy_usd(self, symbol, usd):
        return self._order(symbol, usd, "buy")

    def sell_usd(self, symbol, usd):
        return self._order(symbol, usd, "sell")

    def close(self, symbol):
        return self.client.close_position(symbol)


# ------------------------------------------------------------------ Zustand
def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    return {"peak_equity": None, "halted": False, "halt_reason": ""}


def save_state(state: dict):
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")


# ------------------------------------------------------------------ Logik
def risk_check(acct: dict, state: dict, risk: dict) -> str:
    """Grund, warum NICHT gehandelt werden darf – oder ''."""
    if state.get("halted"):
        return f"Bot ist gestoppt: {state['halt_reason']} (bot/state.json löschen zum Freigeben)"
    if acct["blocked"]:
        return "Alpaca hat das Konto für den Handel gesperrt."
    eq = acct["equity"]
    if acct["last_equity"] > 0:
        day = (eq / acct["last_equity"] - 1) * 100
        if day < -risk["max_daily_loss_pct"]:
            return f"Tagesverlust {day:.1f} % größer als Limit {risk['max_daily_loss_pct']} % – heute keine Trades."
    peak = max(state.get("peak_equity") or eq, eq)
    state["peak_equity"] = peak
    dd = (eq / peak - 1) * 100
    if dd < -risk["max_drawdown_pct"]:
        state["halted"] = True
        state["halt_reason"] = (f"Verlust {dd:.1f} % vom Höchststand {peak:,.0f} $ "
                                f"(Limit {risk['max_drawdown_pct']} %)")
        return state["halt_reason"]
    return ""


def plan_orders(target_w, equity: float, positions: dict, min_trade: float):
    """Was muss gekauft/verkauft werden? Verkäufe zuerst."""
    sells, buys = [], []
    for sym in sorted(set(target_w.index) | set(positions)):
        target = float(target_w.get(sym, 0.0)) * equity
        current = positions.get(sym, {}).get("value", 0.0)
        diff = target - current
        if target == 0 and current > 0:
            sells.append(("SCHLIESSEN", sym, current))
        elif diff <= -min_trade:
            sells.append(("VERKAUF", sym, -diff))
        elif diff >= min_trade:
            buys.append(("KAUF", sym, diff))
    return sells + buys


def build_signals(prices, cfg):
    """Pro Symbol alles, was das Dashboard zum Erklären braucht."""
    s = cfg["strategy"]
    sma = prices.rolling(s["sma_days"], min_periods=s["sma_days"]).mean()
    weights = target_weights(prices, s["sma_days"], s["max_weight_per_symbol"], s["max_invested"])
    out = []
    for sym in cfg["symbols"]:
        px, avg, w = prices[sym], sma[sym], weights[sym]
        state = (px > avg)
        # Wie viele Handelstage ist der aktuelle Zustand schon so?
        cur = bool(state.iloc[-1])
        streak = 0
        for v in reversed(state.values):
            if bool(v) != cur:
                break
            streak += 1
        hist = prices[sym].iloc[-260:]
        out.append({
            "symbol": sym,
            "name": cfg["names"].get(sym, sym),
            "close": px.iloc[-1],
            "sma": avg.iloc[-1],
            "distance_pct": (px.iloc[-1] / avg.iloc[-1] - 1) * 100,
            "in_trend": cur,
            "days_in_state": streak,
            "target_weight": w.iloc[-1],
            "change_1d_pct": (px.iloc[-1] / px.iloc[-2] - 1) * 100,
            "change_1y_pct": (px.iloc[-1] / hist.iloc[0] - 1) * 100,
            # Kurs- und Durchschnittsverlauf für kleine Diagramme (letztes Jahr)
            "chart": [{"d": d.strftime("%Y-%m-%d"), "p": p, "a": a}
                      for d, p, a in zip(hist.index, hist.values, avg.iloc[-260:].values)],
        })
    return out, weights.iloc[-1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--handeln", action="store_true", help="Orders wirklich senden (Paper)")
    ap.add_argument("--demo", action="store_true", help="Zufallsdaten, kein Alpaca")
    args = ap.parse_args()

    cfg = load_config()
    s, risk = cfg["strategy"], cfg["risk"]
    key, secret = os.getenv("ALPACA_API_KEY"), os.getenv("ALPACA_SECRET_KEY")
    has_keys = bool(key and secret) and not args.demo
    live = args.handeln and has_keys

    mode = "handeln" if live else ("probelauf" if has_keys else "nur_signale")
    say({"handeln": "Start – handelt im Alpaca-Paper-Konto",
         "probelauf": "Start – Probelauf, es werden keine Orders gesendet",
         "nur_signale": "Start – keine Alpaca-Schlüssel hinterlegt, berechne nur Signale"}[mode])

    # ---------------- Kurse (nur vollständige Handelstage)
    start = (datetime.now() - timedelta(days=int(s["sma_days"] * 1.6) + 400)).date()
    if args.demo:
        prices, source = demo_prices(cfg["symbols"], start=str(start)), "Demo-Zufallsdaten"
    else:
        prices, source = load_prices(cfg["symbols"], start, key, secret)
    prices = prices[prices.index.date < datetime.now(timezone.utc).date()]
    say(f"Kurse bis {prices.index[-1].date()} geladen ({source})")

    signals, weights = build_signals(prices, cfg)
    for sig in signals:
        say(f"{sig['symbol']:5} Kurs {sig['close']:.2f} | 200-Tage-Linie {sig['sma']:.2f} | "
            f"{'im Trend -> halten' if sig['in_trend'] else 'unter der Linie -> Cash'}")

    status = {
        "updated": now_iso(), "mode": mode, "data_source": source,
        "prices_as_of": prices.index[-1].strftime("%Y-%m-%d"),
        "benchmark": cfg["benchmark"], "strategy": s, "risk": risk,
        "signals": signals, "account": None, "positions": [], "orders": [],
        "market_open": None, "halted": False, "halt_reason": "",
    }
    orders_done = []

    # ---------------- Konto & Orders
    if has_keys:
        broker = AlpacaPaperBroker(key, secret)
        acct = broker.account()
        positions = broker.positions()
        state = load_state()
        reason = risk_check(acct, state, risk)
        save_state(state)
        status["market_open"] = broker.market_open()
        status["halted"] = bool(state.get("halted"))
        status["halt_reason"] = reason
        say(f"Depotwert {acct['equity']:,.2f} $ | Cash {acct['cash']:,.2f} $")

        if reason:
            say(f"NOT-AUS: {reason}", "warn")
        elif not status["market_open"]:
            say("US-Börse geschlossen – keine Orders.")
        else:
            plan = plan_orders(weights, acct["equity"], positions, risk["min_trade_usd"])
            if not plan:
                say("Alles passt – keine Umschichtung nötig.")
            for action, sym, usd in plan:
                entry = {"time": now_iso(), "action": action, "symbol": sym,
                         "usd": usd, "sent": live, "error": ""}
                if live:
                    try:
                        if action == "SCHLIESSEN":
                            broker.close(sym)
                        elif action == "VERKAUF":
                            broker.sell_usd(sym, usd)
                        else:
                            broker.buy_usd(sym, min(usd, broker.account()["cash"] * 0.99))
                    except Exception as e:
                        entry["error"] = str(e)
                        say(f"Order {action} {sym} fehlgeschlagen: {e}", "error")
                say(f"{action} {sym} {usd:,.2f} $ {'gesendet' if live else '(nur geplant)'}")
                orders_done.append(entry)
            if live and plan:
                acct, positions = broker.account(), broker.positions()

        status["account"] = acct
        status["positions"] = [
            {"symbol": k, **v, "weight": v["value"] / acct["equity"] if acct["equity"] else 0}
            for k, v in sorted(positions.items())]
        status["orders"] = orders_done

    # ---------------- Dateien fürs Dashboard
    write_json("status.json", status)

    today = prices.index[-1].strftime("%Y-%m-%d")
    hist = [h for h in read_json("history.json", []) if h.get("date") != today]
    hist.append({"date": today,
                 "equity": status["account"]["equity"] if status["account"] else None,
                 "benchmark": prices[cfg["benchmark"]].iloc[-1],
                 "invested": float(weights.sum())})
    write_json("history.json", hist[-2000:])

    if orders_done:
        write_json("orders.json", (orders_done + read_json("orders.json", []))[:500])

    runs = read_json("runs.json", [])
    runs.insert(0, {"time": now_iso(), "mode": mode, "log": RUN_LOG})
    write_json("runs.json", runs[:60])
    say("Fertig.")


if __name__ == "__main__":
    main()
