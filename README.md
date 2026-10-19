# Aktien-Bot 📈

Ein Lern-Trading-Bot für US-Aktien-ETFs. Er handelt automatisch, aber **nur mit Spielgeld** (Alpaca Paper Trading), und läuft komplett auf GitHub. Auf deinem Mac musst du nichts installieren.

**Dashboard:** https://dennisknoepfle1.github.io/aktien-bot/ (funktioniert nach Schritt 3)

> Kein Anlagerat. Vergangene Ergebnisse sind keine Garantie für die Zukunft.

---

## Einrichtung (einmalig, ca. 15 Minuten)

### Schritt 1 – Alpaca-Spielgeld-Konto
1. Auf **https://alpaca.markets** mit deiner E-Mail registrieren. Das Paper-Konto ist kostenlos und braucht keine Einzahlung.
2. Im Alpaca-Dashboard oben links auf **„Paper“** stellen (nicht „Live“).
3. Bei **„API Keys“** auf **„Generate New Key“** klicken.
4. Du bekommst zwei Werte: **Key** und **Secret**. Das Secret wird nur einmal angezeigt, also das Fenster offen lassen.

### Schritt 2 – Schlüssel geheim bei GitHub hinterlegen
1. In diesem Repository oben auf **Settings** klicken
2. Links **Secrets and variables → Actions**
3. **New repository secret**
   - Name: `ALPACA_API_KEY` · Secret: dein *Key* → **Add secret**
4. Nochmal **New repository secret**
   - Name: `ALPACA_SECRET_KEY` · Secret: dein *Secret* → **Add secret**

Die Werte sind danach für niemanden mehr sichtbar, auch nicht für dich. Das Repository ist öffentlich, die Schlüssel bleiben trotzdem geheim.

### Schritt 3 – Dashboard-Webseite einschalten
1. **Settings → Pages**
2. Bei „Source“: **Deploy from a branch**
3. Branch: **main**, Ordner: **/docs** → **Save**
4. Nach 1–2 Minuten ist die Seite unter dem Link oben erreichbar.

### Schritt 4 – Erster Lauf
1. Oben auf **Actions** klicken. Falls GitHub fragt: „I understand my workflows, go ahead and enable them“.
2. Links **„Backtest“** → rechts **Run workflow** → **Run workflow**. Rechnet die Vergangenheit seit 2005 durch, dauert ca. 1 Minute.
3. Links **„Bot – täglicher Lauf“** → **Run workflow** → Modus **probelauf** → **Run workflow**. Zeigt, was der Bot tun würde.
4. Ein grüner Haken heißt: hat geklappt. Ein Klick darauf zeigt das Protokoll.

Ab jetzt läuft der Bot **Mo–Fr um 17:00 Uhr** (im Winter um 16:00 Uhr) automatisch und handelt im Spielgeld-Konto.

---

## Weitermachen in Claude Code

Öffne dieses Repository (`dennisknoepfle1/aktien-bot`) in Claude Code. In `CLAUDE.md` stehen alle Regeln, der Aufbau und die nächsten Schritte. Guter erster Satz:

> Bau das Dashboard laut CLAUDE.md.

---

## Was der Bot macht

Eine einzige, seit Jahrzehnten bekannte Regel: **Liegt der Kurs über seinem Durchschnitt der letzten 200 Handelstage, wird gehalten. Liegt er darunter, wird verkauft, und das Geld bleibt in Cash.** Das gilt für 8 US-ETFs (S&P 500, Nasdaq, Russell 2000, Dow Jones und vier Sektoren), jeder mit höchstens 12,5 % vom Depot.

**Realistische Erwartung:** Solche Regeln verdienen meist nicht mehr als einfaches Kaufen und Halten. Ihr Vorteil ist, dass sie in großen Crashs einen Teil der Verluste vermeiden können.

## Sicherheitsfunktionen

- Fest auf **Paper Trading** eingestellt
- **Not-Aus Tag:** mehr als 3 % Verlust an einem Tag → an dem Tag keine Trades
- **Not-Aus gesamt:** mehr als 20 % unter dem Höchststand → Bot stoppt. Freigabe: Datei `bot/state.json` löschen
- Orders nur bei geöffneter US-Börse
- Ohne Alpaca-Schlüssel berechnet er nur Signale

## Einstellungen

Alles steht in `config.yaml`. Auf GitHub Datei öffnen → Stift-Symbol → ändern → **Commit changes**. Der Backtest rechnet danach automatisch neu.
