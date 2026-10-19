"""
Die Handelsregel. Wird vom Backtest UND vom Live-Bot benutzt,
damit beide garantiert exakt dasselbe tun.

Regel (Trendfolge mit gleitendem Durchschnitt):
  - Liegt der Schlusskurs über dem Durchschnitt der letzten N Tage -> halten
  - Liegt er darunter -> verkaufen, Geld bleibt in Cash
  - Jedes gehaltene Wertpapier bekommt den gleichen Anteil (gedeckelt)
"""
import pandas as pd


def target_weights(prices: pd.DataFrame, sma_days: int,
                   max_weight: float, max_invested: float) -> pd.DataFrame:
    """
    prices: Tabelle mit Schlusskursen, Zeilen = Tage, Spalten = Symbole.
    Gibt pro Tag die Zielgewichte zurück (0 = nicht halten).
    Die Gewichte für Tag t basieren nur auf Kursen bis einschließlich Tag t.
    """
    sma = prices.rolling(sma_days, min_periods=sma_days).mean()
    in_trend = (prices > sma) & sma.notna()

    n_symbols = prices.shape[1]
    per_symbol = min(max_weight, max_invested / n_symbols)
    weights = in_trend.astype(float) * per_symbol
    return weights


def latest_signal(prices: pd.DataFrame, sma_days: int,
                  max_weight: float, max_invested: float) -> pd.Series:
    """Zielgewichte für heute, berechnet aus dem letzten vollständigen Handelstag."""
    w = target_weights(prices, sma_days, max_weight, max_invested)
    return w.iloc[-1]
