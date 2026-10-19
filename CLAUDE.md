# CLAUDE.md – Aktien-Bot

Diese Datei liest Claude Code bei jedem Start. Sie beschreibt Ziel, Regeln, Aufbau und die nächsten Schritte.

## Für wen und wofür

- Besitzer: **Dennis** (GitHub: `dennisknoepfle1`). Arbeitet im Autohandel, **keine Trading-Erfahrung**, kein Programmierer. Nutzt ein MacBook, auf dem **kein Python installiert** ist. Alles läuft über GitHub.
- Sprache: **Deutsch, Du-Form**, einfache Worte. Fachbegriffe beim ersten Auftreten kurz erklären.
- Ziel: **Lernprojekt.** Ein Bot, der selbstständig im **Alpaca-Paper-Konto** (Spielgeld) tradet, plus ein Dashboard, mit dem Dennis versteht, was der Bot tut, und sich Trading-Grundwissen beibringen kann.

## Harte Regeln

1. **Nur Paper Trading.** `TradingClient(..., paper=True)` bleibt fest verdrahtet. Keinen Code für echtes Geld einbauen, auch nicht auf Nachfrage „mal schnell“. Wenn Dennis das will: erst ausführlich Risiken, Steuern und EU-Regeln besprechen.
2. **Nur Aktien/Aktien-ETFs, kein Krypto.** (Dennis' Vorgabe)
3. **Ehrlichkeit vor Optimismus.** Keine Renditeversprechen. Backtests immer mit Kosten, ohne Blick in die Zukunft (Signal heute → Handel morgen) und mit Vergleich zu Kaufen+Halten.
4. **Kein Overfitting.** Parameter nicht so lange drehen, bis der Backtest gut aussieht. Wenn Dennis Parameter ändern will, Effekt in beiden Teilzeiträumen (erste 70 % / letzte 30 %) zeigen und das Risiko erklären.
5. **Geheimnisse** (Alpaca-Schlüssel) nur als GitHub Secrets `ALPACA_API_KEY` / `ALPACA_SECRET_KEY`. Niemals in Code, Konfiguration, Dashboard oder Chat. Das Repository ist **öffentlich**.
6. Die Handelsregel steht nur in `bot/strategy.py` und wird von Bot und Backtest gemeinsam benutzt. Nicht duplizieren.

## Aufbau

```
config.yaml                 Alle Einstellungen (Symbole + Namen, Strategie, Risiko, Backtest)
bot/strategy.py             Handelsregel: Kurs > 200-Tage-Durchschnitt → halten, sonst Cash
bot/common.py               Pfade, Config, Kursdaten (Yahoo, Ersatz: Alpaca IEX), JSON-Helfer
bot/bot.py                  Täglicher Lauf: Signale, Not-Aus, Orders, schreibt docs/data/*.json
bot/backtest.py             Backtest seit 2005, schreibt docs/data/backtest.json
bot/state.json              Höchststand + Not-Aus-Zustand (entsteht beim ersten Lauf mit Schlüsseln)
.github/workflows/bot.yml       Mo–Fr 15:00 UTC automatisch mit --handeln; manuell: probelauf/handeln
.github/workflows/backtest.yml  Sonntags + bei Änderung an config/strategy + manuell
docs/                       GitHub Pages (Branch main, Ordner /docs) – das Dashboard „Linie 200“
docs/index.html             Seitengerüst + Navigation
docs/assets/app.js          Alle Ansichten, Charts (Chart.js 4.4.1 von cdnjs), Formatierung, Router (#uebersicht …)
docs/assets/akademie.js     Lektionen, Quiz, Abschlusstest, Glossar (Inhalte)
docs/assets/style.css       Design, Hell/Dunkel
docs/data/                  JSON-Daten, vom Bot geschrieben (nicht von Hand ändern)
```

Lokal testen (in der Claude-Code-Umgebung, ohne Internet/Alpaca):
```
pip install -r requirements.txt
python bot/backtest.py --demo
python bot/bot.py --demo
```
`--demo` erzeugt Zufallskurse. **Achtung:** Demo-Ergebnisse vor dem Commit nicht in `docs/data/` liegen lassen, außer `status.json`/`backtest.json` als Platzhalter, solange es noch keinen echten Lauf gab. `history.json` und `runs.json` nie mit Demo-Daten committen.

### Strategie (Stand jetzt)
- 8 US-ETFs: SPY, QQQ, IWM, DIA, XLK, XLV, XLF, XLE (bewusst keine Einzelaktien → Survivorship Bias)
- Halten, wenn Schlusskurs > 200-Tage-Durchschnitt; sonst Cash
- Gleichgewichtet, max. 12,5 % je ETF, max. 95 % investiert
- Not-Aus: > 3 % Tagesverlust → heute keine Trades; > 20 % unter Höchststand → Bot stoppt bis `bot/state.json` gelöscht wird
- Umschichtungen unter 50 $ werden ignoriert
- Benchmark: SPY kaufen und halten

## Daten-Vertrag (docs/data) – Grundlage fürs Dashboard

**status.json** (jeder Bot-Lauf)
```
updated, mode ("handeln" | "probelauf" | "nur_signale"), data_source, prices_as_of, benchmark,
strategy{sma_days, max_weight_per_symbol, max_invested}, risk{...},
market_open (bool|null), halted (bool), halt_reason (string),
account {equity, last_equity, cash, blocked} | null,
positions [{symbol, qty, value, avg_price, pl, pl_pct, weight}],
orders [{time, action ("KAUF"|"VERKAUF"|"SCHLIESSEN"), symbol, usd, sent, error}],
signals [{symbol, name, close, sma, distance_pct, in_trend, days_in_state, target_weight,
          change_1d_pct, change_1y_pct, chart:[{d, p (Kurs), a (200-Tage-Linie)}] (≈260 Tage)}]
```
**history.json** – je Handelstag `{date, equity (null ohne Konto), benchmark (SPY-Kurs), invested (Zielquote 0–1)}`
**orders.json** – alle Orders, neueste zuerst (gleiches Format wie `status.orders`)
**runs.json** – letzte 60 Läufe `{time, mode, log:[{level, msg}]}`
**backtest.json**
```
generated, data_source, demo (bool), symbols, benchmark, params, start_capital,
end_value{strategy, benchmark},
periods [{label, from, to, strategy{cagr,total,volatility,max_drawdown,sharpe,best_year,worst_year,
          avg_invested,trades_per_year}, benchmark{...ohne die letzten zwei}}]  (Gesamt, Erste 70 %, Letzte 30 %)
yearly [{year, strategy, benchmark}]   (Renditen als Dezimalzahl, 0.12 = 12 %)
curve  [{d, s, b (Depotwert), dds, ddb (Drawdown), inv (Investitionsquote)}]  wöchentlich
```
Alle Prozentwerte in `backtest.json` und `history.invested` sind Dezimalzahlen; in `status.json` sind die `*_pct`-Felder bereits Prozent.

## Stand (19.10.2026)

- [x] Bot, Backtest, Strategie, Not-Aus fertig und mit simuliertem Broker getestet
- [x] GitHub-Workflows für täglichen Lauf und Backtest
- [x] Platzhalter-Seite `docs/index.html`
- [ ] Dennis: Alpaca-Paper-Konto + Secrets + GitHub Pages einrichten (siehe README.md)
- [ ] Erster echter Backtest und Bot-Lauf über „Actions“
- [x] Dashboard gebaut (Übersicht, Signale, Depot & Orders, Backtest, Akademie mit 12 Lektionen/Quiz/Glossar, Einstellungen)

## Dashboard (Anforderungen, umgesetzt)

Ersetzt `docs/index.html`. Statische Seite auf GitHub Pages, liest nur `docs/data/*.json` (relativ: `data/status.json`). **Keine API-Schlüssel, kein direkter Alpaca-Zugriff im Browser.**

**Design:** eigenes, neutrales Design (ausdrücklich **nicht** Autowelt-Prusseit- oder Mission-X-Code-Design). Ruhig, hochwertig, gut lesbar. Hell- und Dunkelmodus. Zahlen mit tabellarischen Ziffern, deutsches Zahlenformat (1.234,56 $). Grün/Rot nur für Gewinn/Verlust und nie als einzige Information. Muss auf dem iPhone gut funktionieren. Charts mit Chart.js von cdnjs. Ein eigener Name/Logo-Schriftzug ist okay.

**Bereiche:**
1. **Übersicht** – Depotwert, Veränderung heute, Gesamtrendite seit Start vs. SPY im selben Zeitraum, Investitionsquote, Not-Aus-Status, Zeitpunkt des letzten Laufs und nächster geplanter Lauf. Verlaufskurve aus `history.json`. Klarer Hinweis, wenn `mode` = `nur_signale` (Schritte zum Einrichten verlinken) oder Daten veraltet sind (> 4 Tage).
2. **Signale** – je ETF eine Karte: Kurs, 200-Tage-Linie, Abstand, Mini-Chart (Kurs + Linie), Status, seit wie vielen Tagen. Dazu ein Satz in Klartext, z. B. „SPY liegt 4,2 % über seiner 200-Tage-Linie – der Bot hält ihn mit 11,9 %.“ Nahe an der Linie (< 2 %) markieren: „könnte bald kippen“.
3. **Depot & Orders** – Positionen mit Gewinn/Verlust, Order-Historie, Lauf-Protokoll (`runs.json`) aufklappbar.
4. **Backtest** – Kurve Strategie vs. SPY (log-Skala umschaltbar), Drawdown-Chart, Jahresrenditen als Balken, Kennzahlen-Tabelle für alle drei Zeiträume, jede Kennzahl mit Erklär-Tooltip. Deutliches Banner bei `demo: true`. Ehrliche Einordnung als Text: wo die Strategie besser/schlechter war.
5. **Lernen (Akademie)** – der wichtigste Teil für Dennis:
   - Lektionen in sinnvoller Reihenfolge, je 3–6 Minuten Lesezeit, mit „Merke“-Kasten und, wo möglich, Bezug zu den echten Bot-Daten:
     1) Aktie, Index, ETF  2) Wie die Börse funktioniert (Kurs, Angebot/Nachfrage, Handelszeiten, US vs. DE)
     3) Ordertypen (Market, Limit, Stop)  4) Rendite und Risiko (Volatilität, Drawdown, Sharpe)
     5) Diversifikation  6) Trendfolge und gleitender Durchschnitt – was unser Bot macht
     7) Backtests, Overfitting, Survivorship Bias  8) Kosten, Spread, Steuern in Deutschland (allgemein, keine Steuerberatung)
     9) Psychologie (FOMO, Verlustangst, Disziplin)  10) Risikomanagement (Positionsgröße, Not-Aus)
     11) Bot vs. ETF-Sparplan – ehrlicher Vergleich  12) Was bei echtem Geld anders wäre (u. a. US-ETFs sind für EU-Privatanleger meist nicht kaufbar → UCITS-Varianten)
   - Fortschritt pro Lektion merken (localStorage, mit try/catch)
   - **Glossar** mit Suche (mind. 40 Begriffe)
   - **Quiz** pro Lektion und ein Abschlusstest, mit Erklärung zu jeder Antwort
   - Kontext-Hilfe: überall im Dashboard kleine „?“-Symbole, die auf den passenden Glossar-Eintrag bzw. die Lektion springen
6. **Einstellungen erklärt** – liest `status.strategy` / `status.risk` und erklärt jeden Wert; Link zum Bearbeiten von `config.yaml` auf GitHub.

**Qualität:** Inhalte fachlich korrekt und vorsichtig formuliert (keine Anlageberatung). Leere oder fehlende JSON-Dateien abfangen. Vor dem Commit mit Demo-Daten testen (`python bot/bot.py --demo`, `python bot/backtest.py --demo`, dann `python -m http.server -d docs`), danach Demo-Daten wieder zurücksetzen (siehe oben).

## Arbeitsweise mit Dennis

- Vor größeren Änderungen kurz sagen, was passiert; danach in 2–3 Sätzen, was sich geändert hat und wo er es sieht.
- Er sieht Ergebnisse auf `https://dennisknoepfle1.github.io/aktien-bot/` und unter „Actions“.
- Erklärungen ohne Programmier-Jargon. Lieber ein Beispiel mit echten Zahlen als eine Definition.
