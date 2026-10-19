/* Akademie: Lektionen, Quiz und Glossar für das Dashboard „Linie 200“.
   Jede Lektion ist eine Funktion c => HTML. c enthält die echten Bot-Daten (siehe lessonCtx in app.js).
   c.live(titel, fn) zeigt einen Kasten mit echten Zahlen – und verschwindet still, wenn Daten fehlen.
   Inhalte: allgemeine Bildung, keine Anlage- oder Steuerberatung. */
"use strict";

window.AKADEMIE = (function () {
  const G = id => `#glossar/${id}`;
  const lessons = [];

  // ------------------------------------------------------------ 1
  lessons.push({
    title: "Aktie, Index, ETF",
    minutes: 4,
    body: c => `
<p>Bevor wir über den Bot reden, brauchen wir drei Wörter, die ständig vorkommen: Aktie, Index und ETF.</p>
<h3>Die Aktie: ein kleines Stück einer Firma</h3>
<p>Eine <a href="${G("aktie")}">Aktie</a> ist ein Anteil an einem Unternehmen. Hat eine Firma 1 Million Aktien und du besitzt 100 davon, gehört dir ein Zehntausendstel der Firma. Läuft das Geschäft gut, steigt meist der Wert deines Anteils, und manchmal schüttet die Firma einen Teil des Gewinns als <a href="${G("dividende")}">Dividende</a> aus. Läuft es schlecht, kann die Aktie stark fallen – im Extremfall auf null, wenn die Firma pleitegeht.</p>
<p>Vergleich aus dem Autohandel: Stell dir vor, fünf Freunde kaufen zusammen ein Autohaus. Jeder hat einen Anteil. Wenn das Autohaus gut läuft und wertvoller wird, ist auch jeder Anteil mehr wert. Eine Aktie ist genau so ein Anteil – nur dass man ihn jeden Tag an der Börse weiterverkaufen kann.</p>
<h3>Der Index: ein Thermometer für den Markt</h3>
<p>Ein <a href="${G("index")}">Index</a> fasst viele Aktien zu einer Zahl zusammen. Der <a href="${G("sp500")}">S&amp;P 500</a> zum Beispiel enthält die rund 500 größten US-Firmen. Steigt er heute um 1 %, sind diese Firmen im Schnitt (gewichtet nach Größe) um 1 % mehr wert. Den Index selbst kann man nicht kaufen – er ist nur eine Rechengröße, wie ein Thermometer.</p>
<h3>Der ETF: den ganzen Korb auf einmal kaufen</h3>
<p>Ein <a href="${G("etf")}">ETF</a> (Exchange Traded Fund, börsengehandelter Fonds) ist ein Fonds, der einen Index nachbildet. Kaufst du einen Anteil des ETF „SPY“, besitzt du indirekt ein winziges Stück aller 500 Firmen im S&amp;P 500. Der Anbieter kauft die Aktien für dich und verlangt dafür eine kleine jährliche Gebühr, die <a href="${G("ter")}">TER</a> (bei großen ETFs oft unter 0,1 % pro Jahr).</p>
<p>Vorteile von ETFs: Man streut sein Geld automatisch auf viele Firmen, die Kosten sind niedrig, und man kann sie wie eine Aktie jederzeit während der Handelszeit kaufen und verkaufen.</p>
${c.live("die 8 ETFs deines Bots", () => c.signals.length ? `<p>Dein Bot handelt nur ETFs, keine Einzelaktien:</p><ul>${c.signals.map(s => `<li><b>${c.esc(s.symbol)}</b> – ${c.esc(s.name)}</li>`).join("")}</ul>` : "")}
<h3>Warum der Bot keine Einzelaktien kauft</h3>
<p>Mit Einzelaktien wie Apple oder Nvidia sieht ein Rückblick oft traumhaft aus. Das liegt aber daran, dass wir heute wissen, welche Firmen die Gewinner wurden. Wer 2005 hätte wählen müssen, hätte vielleicht Nokia gekauft. Dieser Denkfehler heißt <a href="${G("survivorship-bias")}">Survivorship Bias</a> – dazu mehr in Lektion 7. ETFs auf breite Indizes umgehen das Problem weitgehend, weil der Index sich selbst erneuert: Schwache Firmen fliegen raus, aufsteigende kommen rein.</p>
<p>Vier der acht ETFs sind <a href="${G("sektor")}">Sektor</a>-ETFs. XLK enthält zum Beispiel nur Technologiefirmen aus dem S&amp;P 500, XLE nur Energiefirmen. Sie entwickeln sich oft unterschiedlich – genau das macht sie für eine Trendregel interessant.</p>`,
    merke: [
      "Aktie = Anteil an einer Firma. Index = Rechengröße für viele Aktien. ETF = Fonds, der einen Index nachbildet und an der Börse handelbar ist.",
      "Ein ETF verteilt dein Geld automatisch auf viele Firmen und kostet wenig.",
      "Der Bot handelt nur breite ETFs, damit der Rückblick (Backtest) nicht durch bekannte Gewinner geschönt ist.",
    ],
    quiz: [
      { q: "Was kaufst du mit einem Anteil des ETF SPY?", a: ["Eine Aktie der Firma SPY", "Ein winziges Stück aller rund 500 Firmen im S&P 500", "Ein Versprechen auf feste Zinsen"], c: 1, why: "SPY bildet den S&P 500 nach. Mit einem Anteil besitzt du indirekt einen kleinen Teil aller enthaltenen Firmen." },
      { q: "Kann man einen Index wie den S&P 500 direkt kaufen?", a: ["Ja, an jeder Börse", "Nein, er ist nur eine Rechengröße – man kauft einen ETF, der ihn nachbildet", "Nur in den USA"], c: 1, why: "Ein Index ist wie ein Thermometer: Er misst nur. Kaufen kann man Produkte wie ETFs, die ihn nachbilden." },
      { q: "Warum handelt der Bot keine Einzelaktien wie Nvidia?", a: ["Weil Alpaca das nicht erlaubt", "Weil Einzelaktien immer schlechter laufen", "Weil ein Rückblick mit heute bekannten Gewinnern geschönt wäre (Survivorship Bias)"], c: 2, why: "Wer heute die Gewinner von gestern auswählt, bekommt traumhafte Backtests, die für die Zukunft nichts bedeuten." },
    ],
  });

  // ------------------------------------------------------------ 2
  lessons.push({
    title: "Wie die Börse funktioniert",
    minutes: 4,
    body: c => `
<p>Eine <a href="${G("boerse")}">Börse</a> ist ein Marktplatz – ähnlich wie eine Fahrzeugauktion. Käufer sagen, wie viel sie höchstens zahlen wollen, Verkäufer, wie viel sie mindestens haben wollen. Treffen sich beide, gibt es einen Handel, und der Preis dieses Handels ist der aktuelle <a href="${G("kurs")}">Kurs</a>.</p>
<h3>Angebot und Nachfrage</h3>
<p>Wollen gerade mehr Leute kaufen als verkaufen, müssen Käufer mehr bieten – der Kurs steigt. Wollen mehr verkaufen, fällt er. Was die Leute dazu bringt, sind Nachrichten, Firmenzahlen, Zinsen, Stimmung und oft auch einfach Herdenverhalten. Kurzfristig ist der Kurs deshalb kaum vorherzusagen.</p>
<p>Genau wie bei Gebrauchtwagen gibt es zwei Preise gleichzeitig: den höchsten Kaufpreis (Geldkurs, englisch „Bid“) und den niedrigsten Verkaufspreis (Briefkurs, „Ask“). Die kleine Lücke dazwischen heißt <a href="${G("spread")}">Spread</a>. Bei großen ETFs wie SPY ist sie winzig, oft nur ein Cent.</p>
<h3>Handelszeiten: USA und Deutschland</h3>
<p>Die großen US-Börsen (NYSE und Nasdaq) handeln regulär von 9:30 bis 16:00 Uhr New Yorker Zeit. Bei uns ist das meist <b>15:30 bis 22:00 Uhr</b>. Weil die USA und Europa die Uhren an unterschiedlichen Tagen umstellen, verschiebt sich das ein paar Wochen im Jahr um eine Stunde. Die Börse Frankfurt (Xetra) handelt von 9:00 bis 17:30 Uhr.</p>
<p>An Wochenenden und US-Feiertagen (zum Beispiel Thanksgiving oder dem 4. Juli) ist die US-Börse zu. Ein Börsentag heißt <a href="${G("handelstag")}">Handelstag</a> – ein Jahr hat ungefähr 252 davon.</p>
${c.live("wann dein Bot handelt", () => `<p>Dein Bot startet Montag bis Freitag um 15:00 Uhr UTC. Das ist bei uns 17:00 Uhr (Sommerzeit) bzw. 16:00 Uhr (Winterzeit) und in New York 11:00 bzw. 10:00 Uhr – die Börse ist dann sicher offen. Er rechnet mit den <a href="${G("schlusskurs")}">Schlusskursen</a> des letzten vollständigen Handelstags${c.status ? ` (zuletzt vom ${c.dDate(c.status.prices_as_of)})` : ""}. Ist die Börse zu, schickt er keine Orders.</p>`)}
<h3>Was passiert, wenn du kaufst?</h3>
<p>Du kaufst nicht direkt an der Börse, sondern über einen <a href="${G("broker")}">Broker</a> – bei deinem Bot ist das <a href="${G("alpaca")}">Alpaca</a>. Der Broker leitet deine Order weiter, sie wird ausgeführt, und die Anteile landen in deinem Depot. Bei deinem Bot passiert das alles nur mit Spielgeld (<a href="${G("paper-trading")}">Paper Trading</a>): Alpaca simuliert die Ausführung mit echten Kursen, aber es fließt kein echtes Geld.</p>
<h3>Warum US-Börse und nicht Frankfurt?</h3>
<p>Alpaca ist ein US-Broker und handelt nur US-Wertpapiere. Die Kurse sind deshalb in US-Dollar. Für das Lernen ist das egal. Bei echtem Geld käme ein <a href="${G("waehrungsrisiko")}">Währungsrisiko</a> dazu – dazu mehr in Lektion 12.</p>`,
    merke: [
      "Der Kurs entsteht aus Angebot und Nachfrage – wie bei einer Auktion.",
      "US-Börse: meist 15:30–22:00 Uhr deutscher Zeit, an Wochenenden und US-Feiertagen geschlossen.",
      "Zwischen Kauf- und Verkaufspreis liegt der Spread – eine kleine, versteckte Gebühr.",
    ],
    quiz: [
      { q: "Was passiert mit dem Kurs, wenn viel mehr Leute kaufen als verkaufen wollen?", a: ["Er steigt", "Er fällt", "Er bleibt gleich, die Börse legt den Preis fest"], c: 0, why: "Käufer müssen dann mehr bieten, um zum Zug zu kommen – der Kurs steigt." },
      { q: "Wann ist die US-Börse normalerweise geöffnet (deutsche Zeit)?", a: ["9:00 bis 17:30 Uhr", "15:30 bis 22:00 Uhr", "Rund um die Uhr"], c: 1, why: "9:30–16:00 Uhr New Yorker Zeit entspricht meist 15:30–22:00 Uhr bei uns. 9:00–17:30 Uhr ist Xetra in Frankfurt." },
      { q: "Was ist der Spread?", a: ["Die jährliche Fondsgebühr", "Der Abstand zwischen Kauf- und Verkaufspreis", "Die Steuer auf Gewinne"], c: 1, why: "Wer sofort kauft, zahlt den etwas höheren Briefkurs; wer sofort verkauft, bekommt den etwas niedrigeren Geldkurs. Die Lücke ist der Spread." },
    ],
  });

  // ------------------------------------------------------------ 3
  lessons.push({
    title: "Ordertypen: Market, Limit, Stop",
    minutes: 4,
    body: c => `
<p>Eine <a href="${G("order")}">Order</a> ist ein Auftrag an den Broker: „Kauf mir das“ oder „Verkauf das“. Es gibt verschiedene Arten, die sich darin unterscheiden, <i>zu welchem Preis</i> und <i>wann</i> ausgeführt wird.</p>
<h3>Market-Order: sofort, zum aktuellen Preis</h3>
<p>Die <a href="${G("market-order")}">Market-Order</a> (Bestens-Order) wird sofort zum besten verfügbaren Preis ausgeführt. Vorteil: Sie wird praktisch immer ausgeführt. Nachteil: Den genauen Preis kennst du vorher nicht. Bei sehr gefragten ETFs wie SPY ist das unproblematisch; bei wenig gehandelten Papieren kann der Preis deutlich danebenliegen – das nennt man <a href="${G("slippage")}">Slippage</a>.</p>
<h3>Limit-Order: nur zu meinem Preis</h3>
<p>Bei einer <a href="${G("limit-order")}">Limit-Order</a> sagst du: „Kaufe nur, wenn der Preis höchstens 500 $ ist“ (bzw. beim Verkauf: „mindestens 500 $“). Du bekommst nie einen schlechteren Preis – aber vielleicht gar keinen, wenn der Kurs dein Limit nie erreicht.</p>
<p>Vergleich: Bei einer Fahrzeugauktion ist die Market-Order „ich nehme das Auto, egal was der Hammer sagt“, die Limit-Order „ich biete höchstens 12.000 €“.</p>
<h3>Stop-Order: Notbremse</h3>
<p>Eine <a href="${G("stop-order")}">Stop-Order</a> schläft, bis ein bestimmter Kurs erreicht ist, und wird dann zur Market-Order. Typisch ist der Stop-Loss: „Wenn die Aktie unter 90 $ fällt, verkaufe sie.“ So begrenzt man Verluste – aber nicht perfekt: Fällt der Kurs über Nacht von 95 auf 80 $, wird zu etwa 80 $ verkauft, nicht zu 90 $.</p>
<h3>Wie lange gilt eine Order?</h3>
<p>Orders haben eine Gültigkeit. „Day“ heißt: gilt nur heute; was bis Börsenschluss nicht ausgeführt ist, verfällt. „GTC“ (good till cancelled) heißt: gilt, bis du sie löschst.</p>
${c.live("so handelt dein Bot", () => `<p>Dein Bot benutzt nur <b>Market-Orders mit Gültigkeit „Day“</b> und gibt einen Dollar-Betrag statt einer Stückzahl an (zum Beispiel „kaufe für 1.250 $ SPY“). Alpaca kann dafür auch Bruchteile von Anteilen kaufen. Stop-Orders braucht er nicht, denn seine „Notbremse“ ist die 200-Tage-Linie und der Not-Aus.</p>${(() => { const o = (c.status && c.status.orders) || []; return o.length ? `<p>Letzte Order: ${c.esc(o[0].action)} ${c.esc(o[0].symbol)} für ${c.usd(o[0].usd)}.</p>` : ""; })()}`)}
<h3>Warum Market-Orders für den Bot okay sind</h3>
<p>Der Bot handelt nur sehr große, viel gehandelte ETFs, und zwar mitten am Handelstag. Da ist der Spread winzig und Market-Orders werden sehr nah am angezeigten Kurs ausgeführt. Im Backtest rechnen wir trotzdem pro Handel 0,05 % Kosten ab, um ehrlich zu bleiben.</p>`,
    merke: [
      "Market-Order: sofort, Preis unbekannt. Limit-Order: Preis garantiert, Ausführung nicht.",
      "Stop-Order: wird erst bei einem bestimmten Kurs aktiv – eine Notbremse, aber keine perfekte.",
      "Dein Bot nutzt Market-Orders in Dollar-Beträgen, nur bei offener Börse.",
    ],
    quiz: [
      { q: "Du willst sicher sein, dass du nicht mehr als 450 $ pro Anteil zahlst. Welche Order nimmst du?", a: ["Market-Order", "Limit-Order mit Limit 450 $", "Stop-Order bei 450 $"], c: 1, why: "Nur die Limit-Order garantiert den Höchstpreis. Dafür kann es sein, dass sie nicht ausgeführt wird." },
      { q: "Ein Stop-Loss liegt bei 90 $. Über Nacht fällt der Kurs von 95 $ auf 80 $. Was passiert?", a: ["Es wird genau zu 90 $ verkauft", "Es wird ungefähr zu 80 $ verkauft", "Gar nichts"], c: 1, why: "Der Stop wird zur Market-Order, sobald 90 $ unterschritten sind – und der nächste verfügbare Preis ist dann etwa 80 $." },
      { q: "Warum sind Market-Orders für deinen Bot vertretbar?", a: ["Weil sie gratis sind", "Weil der Bot nur sehr liquide ETFs mitten am Handelstag kauft", "Weil Limit-Orders bei Alpaca verboten sind"], c: 1, why: "Bei viel gehandelten ETFs ist der Spread winzig, die Ausführung liegt sehr nah am Kurs." },
    ],
  });

  // ------------------------------------------------------------ 4
  lessons.push({
    title: "Rendite und Risiko",
    minutes: 4,
    body: c => `
<p>Jede Geldanlage hat zwei Seiten: Was bringt sie (Rendite), und wie sehr wackelt sie dabei (Risiko)? Wer nur auf die Rendite schaut, übersieht die Hälfte.</p>
<h3>Rendite</h3>
<p>Die <a href="${G("rendite")}">Rendite</a> ist der Gewinn in Prozent. Aus 10.000 € werden 11.000 € – das sind 10 %. Über mehrere Jahre rechnet man mit der <a href="${G("cagr")}">jährlichen Durchschnittsrendite (CAGR)</a>: Wie viel Prozent pro Jahr hätte man gebraucht, um vom Anfangs- zum Endwert zu kommen? Wichtig ist der Zinseszins: 7 % pro Jahr verdoppeln das Geld in etwa 10 Jahren.</p>
<h3>Volatilität: wie stark es wackelt</h3>
<p>Die <a href="${G("volatilitaet")}">Volatilität</a> misst, wie stark die Kurse schwanken. Eine Volatilität von 19 % pro Jahr heißt grob: In zwei von drei Jahren liegt die Rendite irgendwo im Bereich „Durchschnitt plus/minus 19 Prozentpunkte“. Je höher, desto unruhiger die Fahrt.</p>
<h3>Drawdown: der tiefste Absturz</h3>
<p>Der <a href="${G("drawdown")}">Drawdown</a> ist der Rückgang vom bisherigen Höchststand. Der <b>maximale Drawdown</b> ist der schlimmste solche Absturz im ganzen Zeitraum. Diese Zahl spürt man im Bauch: Ein Drawdown von −50 % heißt, aus 100.000 € werden 50.000 €. Und Achtung: Um wieder auf 100.000 € zu kommen, braucht man dann <b>+100 %</b>, nicht +50 %.</p>
<h3>Sharpe-Ratio: Rendite pro Risiko</h3>
<p>Die <a href="${G("sharpe")}">Sharpe-Ratio</a> teilt die Rendite durch die Schwankung. Je höher, desto mehr Rendite gab es pro Einheit Wackeln. Werte um 0,5 sind für Aktien normal, über 1 ist sehr gut. (Eigentlich zieht man vorher den risikolosen Zins ab; unser Backtest rechnet vereinfacht ohne – damit sind die Werte etwas höher als in Fachbüchern.)</p>
${c.live("Backtest seit 2005", () => { const g = c.period("Gesamt"); if (!g) return ""; const s = g.strategy, b = g.benchmark; return `<table><thead><tr><th></th><th class="r">Bot-Regel</th><th class="r">SPY halten</th></tr></thead><tbody>
<tr><td>Rendite pro Jahr</td><td class="r">${c.pctD(s.cagr, 1)}</td><td class="r">${c.pctD(b.cagr, 1)}</td></tr>
<tr><td>Volatilität</td><td class="r">${c.pctD(s.volatility, 1)}</td><td class="r">${c.pctD(b.volatility, 1)}</td></tr>
<tr><td>Max. Drawdown</td><td class="r">${c.pctD(s.max_drawdown, 1)}</td><td class="r">${c.pctD(b.max_drawdown, 1)}</td></tr>
<tr><td>Sharpe</td><td class="r">${c.fmt(s.sharpe, 2)}</td><td class="r">${c.fmt(b.sharpe, 2)}</td></tr></tbody></table>
<p style="margin-top:8px">Siehst du das Muster? ${s.cagr < b.cagr ? "SPY brachte mehr Rendite, " : "Die Regel brachte mehr Rendite, "}${Math.abs(s.max_drawdown) < Math.abs(b.max_drawdown) ? "aber die Bot-Regel hatte den deutlich kleineren Absturz." : "und auch beim Absturz war sie nicht besser."} ${c.btDemo ? "(Achtung: Demo-Backtest mit Zufallskursen.)" : ""}</p>`; })}
<h3>Rendite und Risiko gehören zusammen</h3>
<p>Höhere Rendite gibt es an der Börse auf Dauer fast nur gegen höheres Risiko. Wer etwas anbietet, das „hohe Rendite ohne Risiko“ verspricht, verkauft fast immer etwas Unseriöses. Die ehrliche Frage lautet: Welches Auf und Ab halte ich aus, ohne in Panik zu verkaufen?</p>`,
    merke: [
      "Rendite immer zusammen mit Risiko anschauen.",
      "Drawdown = Absturz vom Höchststand. Nach −50 % braucht man +100 %, um wieder bei null zu sein.",
      "Sharpe-Ratio = Rendite pro Schwankung. Höher ist besser.",
    ],
    quiz: [
      { q: "Dein Depot fällt von 100.000 € auf 50.000 €. Wie viel Prozent musst du jetzt gewinnen, um wieder bei 100.000 € zu sein?", a: ["50 %", "100 %", "200 %"], c: 1, why: "Von 50.000 € auf 100.000 € ist eine Verdopplung, also +100 %. Verluste wiegen schwerer als gleich große Gewinne." },
      { q: "Was misst die Volatilität?", a: ["Wie stark die Kurse schwanken", "Wie viel Gewinn es gab", "Wie oft gehandelt wurde"], c: 0, why: "Volatilität ist ein Maß für das Auf und Ab, nicht für den Gewinn." },
      { q: "Zwei Anlagen bringen beide 6 % pro Jahr. A schwankt mit 10 %, B mit 20 %. Welche hat die höhere Sharpe-Ratio?", a: ["A", "B", "Beide gleich"], c: 0, why: "Gleiche Rendite bei halber Schwankung – A bringt mehr Rendite pro Einheit Risiko." },
    ],
  });

  // ------------------------------------------------------------ 5
  lessons.push({
    title: "Diversifikation",
    minutes: 4,
    body: c => `
<p><a href="${G("diversifikation")}">Diversifikation</a> heißt: nicht alle Eier in einen Korb legen. Verteilt man das Geld auf viele Anlagen, die sich nicht alle gleich verhalten, wird das Gesamtdepot ruhiger – ohne dass man im Schnitt auf Rendite verzichten muss.</p>
<h3>Ein Beispiel</h3>
<p>Ein Autohändler, der nur Cabrios verkauft, hat im Winter ein Problem. Einer, der Cabrios, Kombis und Transporter anbietet, hat das ganze Jahr Umsatz. Bei Aktien ist es genauso: Energiefirmen laufen oft gut, wenn der Ölpreis steigt; Technologiefirmen leiden manchmal gerade dann unter steigenden Zinsen.</p>
<h3>Korrelation: laufen zwei Dinge gemeinsam?</h3>
<p>Wie ähnlich sich zwei Anlagen bewegen, misst die <a href="${G("korrelation")}">Korrelation</a>. Bei +1 laufen sie exakt gleich, bei 0 unabhängig voneinander, bei −1 genau entgegengesetzt. Diversifikation hilft nur, wenn die Korrelation deutlich unter +1 liegt.</p>
<h3>Die Grenzen</h3>
<ul>
<li><b>Überschneidungen:</b> SPY, QQQ, DIA und XLK enthalten zum Teil dieselben Riesenfirmen (etwa Apple, Microsoft, Nvidia). Acht ETFs heißt deshalb nicht acht unabhängige Wetten.</li>
<li><b>Im Crash fällt fast alles:</b> In echten Panikphasen (2008, März 2020) steigt die Korrelation; dann fallen fast alle Aktien gleichzeitig. Diversifikation innerhalb von Aktien schützt dann wenig.</li>
<li><b>Nur US-Aktien:</b> Dein Bot hält ausschließlich US-ETFs. Europa, Asien, Anleihen oder Gold sind nicht dabei.</li>
</ul>
${c.live("Verteilung im Bot", () => { const n = c.signals.length; if (!n) return ""; const inT = c.signals.filter(s => s.in_trend).length; return `<p>Der Bot teilt das Geld gleichmäßig auf ${n} ETFs auf, jeder höchstens ${c.status ? c.pctD(c.status.strategy.max_weight_per_symbol, 1) : "12,5 %"}. Gerade sind ${inT} von ${n} über ihrer Linie, also will der Bot ${c.pctD(c.targetQuote, 1)} investieren. Das Gegenmittel zum Crash ist bei ihm nicht die Streuung, sondern die Cash-Regel aus Lektion 6.</p>`; })}
<h3>Gleichgewichtet statt nach Größe</h3>
<p>Ein Index wie der S&amp;P 500 gewichtet nach <a href="${G("marktkapitalisierung")}">Marktkapitalisierung</a>: große Firmen zählen mehr. Dein Bot gibt dagegen jedem ETF denselben Anteil. Dadurch bekommen kleinere Firmen (IWM) und Sektoren wie Energie oder Gesundheit mehr Gewicht als im S&amp;P 500.</p>`,
    merke: [
      "Streuen macht das Depot ruhiger – aber nur, wenn die Anlagen nicht alle gleich laufen.",
      "Im Crash fallen fast alle Aktien gemeinsam. Streuung allein ist kein Crash-Schutz.",
      "Die 8 Bot-ETFs überschneiden sich teilweise und sind alle aus den USA.",
    ],
    quiz: [
      { q: "Wann bringt Diversifikation am meisten?", a: ["Wenn die Anlagen sehr ähnlich laufen (Korrelation nahe +1)", "Wenn die Anlagen sich unterschiedlich bewegen (Korrelation deutlich unter +1)", "Immer gleich viel"], c: 1, why: "Nur wenn nicht alles gleichzeitig fällt, gleichen sich Bewegungen aus." },
      { q: "Was passiert typischerweise in einem großen Börsencrash?", a: ["Die Korrelation zwischen Aktien steigt – fast alles fällt", "Sektoren bewegen sich völlig unabhängig", "Technologie steigt immer"], c: 0, why: "In Panikphasen verkaufen viele Anleger alles gleichzeitig. Darum schützt Streuung über Aktien hinweg dann nur wenig." },
      { q: "Warum sind die 8 Bot-ETFs nicht 8 unabhängige Wetten?", a: ["Weil sie alle von derselben Firma kommen", "Weil sie sich teilweise überschneiden und alle aus dem US-Markt stammen", "Weil sie alle gleich viel kosten"], c: 1, why: "Große Firmen wie Apple oder Microsoft stecken in mehreren der ETFs, und alle hängen am US-Aktienmarkt." },
    ],
  });

  // ------------------------------------------------------------ 6
  lessons.push({
    title: "Trendfolge und die 200-Tage-Linie",
    minutes: 4,
    body: c => `
<p>Jetzt kommt das Herz deines Bots. Er folgt einer einzigen Regel, die seit Jahrzehnten bekannt ist:</p>
<div class="merke"><b>Die Regel</b>Liegt der Schlusskurs über dem Durchschnitt der letzten 200 Handelstage, wird der ETF gehalten. Liegt er darunter, wird verkauft, und das Geld bleibt in Cash.</div>
<h3>Was ist ein gleitender Durchschnitt?</h3>
<p>Der <a href="${G("sma")}">gleitende Durchschnitt</a> (englisch SMA, Simple Moving Average) über 200 Tage ist der Mittelwert der letzten 200 Schlusskurse. „Gleitend“, weil jeden Tag der neueste Kurs dazukommt und der älteste herausfällt. 200 Handelstage sind ungefähr 9–10 Monate. Die Linie glättet das tägliche Zappeln und zeigt die grobe Richtung.</p>
<p>Beispiel mit 5 statt 200 Tagen: Kurse 10, 11, 12, 11, 13 → Durchschnitt 11,4. Kommt morgen 14 dazu, fällt die 10 raus: 11, 12, 11, 13, 14 → 12,2.</p>
${c.live("SPY heute", () => { const s = c.sig("SPY"); if (!s) return ""; return `<p>SPY schloss zuletzt bei <b>${c.usd(s.close)}</b>. Der Durchschnitt der letzten 200 Tage liegt bei <b>${c.usd(s.sma)}</b>. Der Kurs liegt also ${c.pct(Math.abs(s.distance_pct), 1)} ${s.distance_pct >= 0 ? "darüber" : "darunter"} – deshalb ${s.in_trend ? "<b>hält</b>" : "<b>meidet</b>"} der Bot SPY, und das seit ${s.days_in_state} Handelstagen.</p>`; })}
<h3>Warum soll das funktionieren?</h3>
<p>Märkte bewegen sich oft in längeren Trends: Stimmung, Nachrichten und Geldflüsse ändern sich nicht über Nacht. Große Crashs (2000–2002, 2008) begannen meist mit einem längeren Abwärtstrend. Wer unter der 200-Tage-Linie aussteigt, verpasst oft einen Teil des schlimmsten Absturzes. Diese Idee heißt <a href="${G("trendfolge")}">Trendfolge</a>.</p>
<h3>Der Preis dafür</h3>
<ul>
<li><b>Fehlsignale (<a href="${G("whipsaw")}">Whipsaw</a>):</b> Pendelt ein Kurs um die Linie, kauft und verkauft der Bot hin und her – jedes Mal mit Kosten und oft zu ungünstigen Kursen. Deshalb markiert das Dashboard ETFs, die weniger als 2 % von ihrer Linie entfernt sind („könnte bald kippen“).</li>
<li><b>Zu spät:</b> Die Linie reagiert träge. Bei sehr schnellen Crashs (März 2020) verkauft der Bot erst, wenn schon viel verloren ist, und steigt manchmal erst wieder ein, wenn die Erholung weit fortgeschritten ist.</li>
<li><b>Weniger Rendite in guten Zeiten:</b> In langen Aufwärtsphasen ist ein Teil des Geldes zeitweise in Cash und verpasst Gewinne.</li>
</ul>
<h3>Ohne Blick in die Zukunft</h3>
<p>Der Bot rechnet mit dem Schlusskurs von gestern und handelt heute. Im Backtest genauso: Signal am Tag t, Handel am Tag t+1. Würde man mit dem Kurs desselben Tages handeln, den man ja erst nach Börsenschluss kennt, wäre das ein <a href="${G("look-ahead")}">Blick in die Zukunft</a> und der Backtest zu schön.</p>`,
    merke: [
      "Kurs über der 200-Tage-Linie → halten. Darunter → Cash.",
      "Ziel: große, lange Abstürze teilweise vermeiden – nicht mehr Rendite.",
      "Preis dafür: Fehlsignale nahe der Linie, späte Reaktion, weniger Rendite in langen Aufwärtsphasen.",
    ],
    quiz: [
      { q: "SPY schließt bei 500 $, seine 200-Tage-Linie liegt bei 520 $. Was macht der Bot?", a: ["Er kauft mehr SPY", "Er hält SPY nicht – das Geld bleibt in Cash", "Er wartet 200 Tage"], c: 1, why: "Der Kurs liegt unter der Linie, also gilt laut Regel: kein SPY, Cash." },
      { q: "Was ist ein „Whipsaw“?", a: ["Ein besonders großer Gewinn", "Hin- und Herhandeln, wenn der Kurs um die Linie pendelt", "Eine Ordergebühr"], c: 1, why: "Pendelt der Kurs um die Linie, erzeugt die Regel viele Fehlsignale, die Geld kosten." },
      { q: "Was ist das ehrliche Hauptziel der 200-Tage-Regel?", a: ["Den Markt jedes Jahr schlagen", "Große Abstürze teilweise vermeiden", "Möglichst oft handeln"], c: 1, why: "Trendfolge ist eher ein Sicherheitsgurt: weniger tiefe Abstürze, dafür oft etwas weniger Rendite." },
    ],
  });

  // ------------------------------------------------------------ 7
  lessons.push({
    title: "Backtests, Overfitting, Survivorship Bias",
    minutes: 4,
    body: c => `
<p>Ein <a href="${G("backtest")}">Backtest</a> rechnet aus, wie eine Regel in der Vergangenheit abgeschnitten hätte. Das ist nützlich – und gefährlich, weil man sich damit sehr leicht selbst belügt.</p>
<h3>Was ein guter Backtest braucht</h3>
<ul>
<li><b>Kosten:</b> Jeder Handel kostet etwas (Spread, Slippage). Unser Backtest zieht 0,05 % pro Umschichtung ab.</li>
<li><b>Kein Blick in die Zukunft:</b> Signal heute, Handel morgen.</li>
<li><b>Vergleich:</b> Immer gegen „einfach kaufen und halten“ (<a href="${G("benchmark")}">Benchmark</a>). Sonst weiß man nicht, ob sich der Aufwand lohnt.</li>
<li><b>Lange Zeiträume mit Krisen:</b> Unser Backtest beginnt 2005 und enthält die Finanzkrise 2008, Corona 2020 und das Zinsjahr 2022.</li>
</ul>
<h3>Overfitting: die Regel auf die Vergangenheit maßschneidern</h3>
<p><a href="${G("overfitting")}">Overfitting</a> heißt: Man dreht so lange an den Einstellungen, bis der Backtest toll aussieht. 200 Tage? 187 Tage? Nur 6 der 8 ETFs? Probiert man genug Varianten, findet man immer eine, die zufällig perfekt zur Vergangenheit passt – und in Zukunft nichts taugt. Wie ein Anzug, der nur einer Schaufensterpuppe passt.</p>
<p>Ein Schutz: den Zeitraum teilen. Die ersten 70 % (<a href="${G("in-sample")}">In-Sample</a>) und die letzten 30 % (Out-of-Sample). Eine robuste Regel sollte in beiden Teilen ähnlich wirken.</p>
${c.live("deine beiden Teilzeiträume", () => { const a = c.period("Erste 70 %"), b = c.period("Letzte 30 %"); if (!a || !b) return ""; return `<p><b>Erste 70 %</b> (${c.dDate(a.from).slice(-4)}–${c.dDate(a.to).slice(-4)}): Regel ${c.pctD(a.strategy.cagr, 1)} pro Jahr, SPY ${c.pctD(a.benchmark.cagr, 1)}. Größter Absturz: ${c.pctD(a.strategy.max_drawdown, 0)} gegen ${c.pctD(a.benchmark.max_drawdown, 0)}.<br>
<b>Letzte 30 %</b> (${c.dDate(b.from).slice(-4)}–${c.dDate(b.to).slice(-4)}): Regel ${c.pctD(b.strategy.cagr, 1)} pro Jahr, SPY ${c.pctD(b.benchmark.cagr, 1)}. Größter Absturz: ${c.pctD(b.strategy.max_drawdown, 0)} gegen ${c.pctD(b.benchmark.max_drawdown, 0)}.</p>
<p>${(a.strategy.cagr < a.benchmark.cagr) === (b.strategy.cagr < b.benchmark.cagr) ? "Das Bild ist in beiden Hälften dasselbe – ein gutes Zeichen für Ehrlichkeit, auch wenn es nicht für die Regel spricht." : "Die Hälften zeigen ein unterschiedliches Bild – das Ergebnis ist also stark zeitraumabhängig."}</p>`; })}
<h3>Survivorship Bias: nur die Überlebenden sehen</h3>
<p>Im Zweiten Weltkrieg wollte man Flugzeuge dort panzern, wo zurückkehrende Maschinen Einschusslöcher hatten. Ein Statistiker wies darauf hin: Man sieht nur die Flugzeuge, die <i>zurückkamen</i>. Die abgeschossenen hatten ihre Treffer woanders. Das ist <a href="${G("survivorship-bias")}">Survivorship Bias</a>.</p>
<p>An der Börse: Wer heute die zehn erfolgreichsten Aktien nimmt und zurückrechnet, ignoriert alle Firmen, die damals vielversprechend aussahen und dann gescheitert sind. Deshalb nutzt dein Bot breite ETFs, die es schon 2005 gab.</p>
<h3>Was ein Backtest nicht kann</h3>
<p>Er kann nicht sagen, was in Zukunft passiert. Er zeigt nur, wie sich eine Regel in <i>einer</i> bestimmten Vergangenheit verhalten hätte. Die Zukunft kann anders sein.</p>`,
    merke: [
      "Ein ehrlicher Backtest hat Kosten, keinen Blick in die Zukunft und einen Vergleich mit Kaufen und Halten.",
      "Overfitting: Regel so lange anpassen, bis sie zur Vergangenheit passt. Schutz: Ergebnis in beiden Teilzeiträumen prüfen.",
      "Survivorship Bias: Wer nur heutige Gewinner betrachtet, überschätzt jede Strategie.",
    ],
    quiz: [
      { q: "Du probierst 50 verschiedene Durchschnittslängen und nimmst die mit dem besten Backtest. Was ist das Problem?", a: ["Keins, das ist Optimierung", "Overfitting – die Bestwerte passen wahrscheinlich nur zufällig zur Vergangenheit", "Der Backtest wird langsamer"], c: 1, why: "Bei genug Versuchen sieht immer eine Variante zufällig toll aus. In der Zukunft hilft das nicht." },
      { q: "Warum teilt der Backtest den Zeitraum in erste 70 % und letzte 30 %?", a: ["Damit die Grafik schöner wird", "Um zu prüfen, ob die Regel in beiden Teilen ähnlich wirkt", "Weil Yahoo nur 30 % der Daten liefert"], c: 1, why: "Wirkt eine Regel nur in einem Teil, ist ihr Ergebnis wahrscheinlich Zufall oder Overfitting." },
      { q: "Was ist Survivorship Bias?", a: ["Wenn man nur die Überlebenden/Gewinner betrachtet und die Gescheiterten vergisst", "Eine Steuer auf Gewinne", "Wenn Kurse über Nacht springen"], c: 0, why: "Wie bei den Flugzeugen: Man sieht nur, was überlebt hat, und zieht daraus falsche Schlüsse." },
    ],
  });

  // ------------------------------------------------------------ 8
  lessons.push({
    title: "Kosten, Spread und Steuern in Deutschland",
    minutes: 4,
    body: c => `
<p class="small muted">Allgemeine Information, keine Steuerberatung. Steuerregeln ändern sich; für deinen Fall gilt, was dein Steuerberater oder das Finanzamt sagt.</p>
<p>Kosten sind der einzige Teil der Rendite, den man sicher kontrollieren kann. Sie wirken leise, aber jedes Jahr.</p>
<h3>Die sichtbaren und die unsichtbaren Kosten</h3>
<ul>
<li><b>Ordergebühren:</b> Was der Broker pro Order verlangt. Bei vielen Neobrokern 0–1 €, bei Filialbanken teils 10 € und mehr.</li>
<li><b><a href="${G("spread")}">Spread</a>:</b> Die Lücke zwischen Kauf- und Verkaufspreis. Steht auf keiner Rechnung, kostet aber bei jedem Handel.</li>
<li><b><a href="${G("slippage")}">Slippage</a>:</b> Der tatsächliche Ausführungspreis weicht vom erwarteten ab.</li>
<li><b><a href="${G("ter")}">TER</a>:</b> Laufende Fondskosten des ETF, z. B. 0,07 % pro Jahr. Wird direkt im Kurs verrechnet.</li>
</ul>
${c.live("Kosten im Backtest", () => { const g = c.period("Gesamt"), bp = c.backtest && c.backtest.params; if (!g || !bp) return ""; return `<p>Der Backtest rechnet <b>${bp.cost_bps} Basispunkte</b> (= ${c.pct(bp.cost_bps / 100, 2)}) Kosten auf jeden umgeschichteten Betrag. Die Regel hat an durchschnittlich ${c.fmt(g.strategy.trades_per_year, 0)} Tagen pro Jahr umgeschichtet. Je öfter gehandelt wird, desto mehr fressen Kosten – und bei echtem Geld auch Steuern – die Rendite auf.</p>`; })}
<h3>Steuern in Deutschland – die Grundzüge</h3>
<ul>
<li><b><a href="${G("abgeltungsteuer")}">Abgeltungsteuer</a>:</b> Auf Kursgewinne und Dividenden fallen 25 % an, plus 5,5 % Solidaritätszuschlag darauf (und ggf. Kirchensteuer). Zusammen rund 26,4 %.</li>
<li><b><a href="${G("sparerpauschbetrag")}">Sparer-Pauschbetrag</a>:</b> 1.000 € Kapitalerträge pro Jahr sind steuerfrei (2.000 € bei Zusammenveranlagung). Dafür stellt man bei der Bank einen <a href="${G("freistellungsauftrag")}">Freistellungsauftrag</a>.</li>
<li><b><a href="${G("teilfreistellung")}">Teilfreistellung</a>:</b> Bei Aktien-ETFs (mindestens 51 % Aktien) sind 30 % der Erträge steuerfrei. Effektiv zahlt man also auf Gewinne aus Aktien-ETFs rund 18,5 % statt 26,4 %.</li>
<li><b><a href="${G("vorabpauschale")}">Vorabpauschale</a>:</b> Bei thesaurierenden Fonds (die Erträge wieder anlegen) wird jedes Jahr ein kleiner fiktiver Ertrag besteuert, abhängig vom Basiszins. Wird später beim Verkauf verrechnet.</li>
</ul>
<h3>Warum Steuern für einen Trading-Bot so wichtig sind</h3>
<p>Wer kauft und hält, zahlt Steuern auf Kursgewinne erst beim Verkauf – vielleicht in 20 Jahren. Das Geld arbeitet so lange weiter (Steuerstundung). Ein Bot, der verkauft, sobald ein Kurs unter die Linie fällt, realisiert Gewinne immer wieder und muss jedes Mal versteuern. Das bremst den Zinseszins spürbar. <b>Unser Backtest rechnet ohne Steuern</b> – bei echtem Geld wäre der Abstand zu Kaufen und Halten in Deutschland also eher noch größer.</p>
<h3>Ein Rechenbeispiel</h3>
<p>Gewinn beim Verkauf eines Aktien-ETF: 3.000 €. Davon 30 % Teilfreistellung → 2.100 € steuerpflichtig. Noch nicht genutzter Pauschbetrag 1.000 € → 1.100 € zu versteuern. Steuer ca. 26,4 % → rund 290 €.</p>`,
    merke: [
      "Kosten sind sicher, Rendite nicht. Jeder Handel kostet Spread und oft Gebühren.",
      "Deutschland: rund 26,4 % auf Kapitalerträge, 1.000 € frei pro Jahr, bei Aktien-ETFs 30 % Teilfreistellung.",
      "Häufiges Verkaufen löst häufig Steuern aus – ein großer Nachteil von Trading gegenüber Kaufen und Halten.",
    ],
    quiz: [
      { q: "Wie hoch ist der Sparer-Pauschbetrag für eine einzelne Person?", a: ["801 €", "1.000 €", "5.000 €"], c: 1, why: "Seit 2023 sind es 1.000 € pro Person und Jahr (2.000 € bei Ehepaaren mit Zusammenveranlagung)." },
      { q: "Was bedeutet die Teilfreistellung bei Aktien-ETFs?", a: ["30 % der Erträge sind steuerfrei", "ETFs sind komplett steuerfrei", "Man zahlt 30 % Steuern"], c: 0, why: "Bei Aktienfonds bleiben 30 % der Erträge steuerfrei, der Rest wird mit der Abgeltungsteuer belastet." },
      { q: "Warum ist häufiges Handeln steuerlich ungünstig?", a: ["Weil das Finanzamt Trader bestraft", "Weil Gewinne öfter realisiert und versteuert werden und dieses Geld nicht weiterarbeitet", "Ist es nicht"], c: 1, why: "Wer hält, zahlt erst beim Verkauf. Wer oft verkauft, zahlt immer wieder, und der Zinseszins arbeitet mit weniger Geld." },
    ],
  });

  // ------------------------------------------------------------ 9
  lessons.push({
    title: "Psychologie: FOMO, Verlustangst, Disziplin",
    minutes: 4,
    body: c => `
<p>Die meisten Anleger scheitern nicht an fehlendem Wissen, sondern an ihren Gefühlen. Ein Bot hat einen großen Vorteil: Er hat keine.</p>
<h3>FOMO: die Angst, etwas zu verpassen</h3>
<p><a href="${G("fomo")}">FOMO</a> (Fear of Missing Out) ist das Gefühl: „Alle verdienen gerade mit X, ich muss auch rein!“ Meist kommt es, nachdem etwas schon stark gestiegen ist. Wer dann kauft, kauft oft teuer – kurz bevor die Stimmung kippt.</p>
<h3>Verlustangst</h3>
<p>Psychologen haben gezeigt: Ein Verlust von 100 € schmerzt ungefähr doppelt so stark, wie ein Gewinn von 100 € freut (<a href="${G("verlustaversion")}">Verlustaversion</a>). Das führt zu zwei typischen Fehlern:</p>
<ul>
<li>Gewinner zu früh verkaufen („Lieber den Gewinn sichern!“)</li>
<li>Verlierer zu lange halten („Ich verkaufe erst, wenn ich wieder bei null bin.“)</li>
</ul>
<h3>Panik im Crash</h3>
<p>Wenn das Depot 30 % im Minus ist und jeden Abend in den Nachrichten von Crash die Rede ist, verkaufen viele – oft nahe dem Tiefpunkt. Danach steigen sie aus Angst lange nicht wieder ein und verpassen die Erholung. So machen sie aus einem vorübergehenden einen dauerhaften Verlust.</p>
${c.live("was du aushalten müsstest", () => { const g = c.period("Gesamt"); if (!g) return ""; return `<p>Wer SPY seit 2005 einfach gehalten hätte, hätte zwischendurch einen Absturz von <b>${c.pctD(g.benchmark.max_drawdown, 0)}</b> erlebt und ein schlechtestes Jahr mit <b>${c.pctD(g.benchmark.worst_year, 0)}</b>. Die Bot-Regel hatte ${c.pctD(g.strategy.max_drawdown, 0)} bzw. ${c.pctD(g.strategy.worst_year, 0)}. Frag dich ehrlich: Hättest du bei −50 % ruhig weitergeschlafen?</p>`; })}
<h3>Disziplin: der eigentliche Wert des Bots</h3>
<p>Eine Regel ist nur so gut, wie man sie einhält. Der Bot verkauft, wenn die Regel „verkaufen“ sagt – auch wenn es sich falsch anfühlt. Und er kauft wieder, wenn der Kurs über die Linie steigt – auch wenn alle noch Angst haben. Die größte Gefahr für deinen Bot bist deshalb … du: wenn du nach drei Fehlsignalen die Regel änderst oder ihn abschaltest.</p>
<h3>Tipps für dich</h3>
<ul>
<li>Vorher festlegen, was du tust, wenn es schlecht läuft – nicht währenddessen.</li>
<li>Nicht jeden Tag aufs Depot schauen. Tägliches Schwanken ist Rauschen.</li>
<li>Nie Geld anlegen, das du in den nächsten Jahren brauchst.</li>
</ul>`,
    merke: [
      "FOMO lässt uns teuer kaufen, Verlustangst lässt uns billig verkaufen.",
      "Verluste schmerzen etwa doppelt so stark wie gleich große Gewinne freuen.",
      "Der Wert einer Regel liegt in der Disziplin, sie auch in schlechten Phasen einzuhalten.",
    ],
    quiz: [
      { q: "Was beschreibt FOMO?", a: ["Die Angst, einen Gewinn zu verpassen, und deshalb spät noch einzusteigen", "Eine Orderart", "Den Verkauf im Crash"], c: 0, why: "Fear of Missing Out: Man springt auf, weil andere scheinbar Geld verdienen – oft zum ungünstigsten Zeitpunkt." },
      { q: "Welcher Fehler folgt typischerweise aus Verlustangst?", a: ["Verlierer zu lange halten, Gewinner zu früh verkaufen", "Zu viel diversifizieren", "Zu wenig handeln"], c: 0, why: "Weil Verluste so wehtun, will man sie nicht „realisieren“ – und sichert Gewinne dagegen hastig." },
      { q: "Was ist die größte Gefahr für eine regelbasierte Strategie?", a: ["Dass die Börse schließt", "Dass der Mensch die Regel nach ein paar Fehlschlägen über Bord wirft", "Dass Chart.js nicht lädt"], c: 1, why: "Jede Regel hat schlechte Phasen. Wer dann aufgibt, nimmt die Nachteile mit, aber nicht die Vorteile." },
    ],
  });

  // ------------------------------------------------------------ 10
  lessons.push({
    title: "Risikomanagement: Positionsgröße und Not-Aus",
    minutes: 4,
    body: c => `
<p>Risikomanagement fragt nicht „Was kaufe ich?“, sondern „Wie viel – und was, wenn es schiefgeht?“. Profis sagen: Erst das Risiko, dann die Rendite.</p>
<h3>Positionsgröße</h3>
<p>Die <a href="${G("positionsgroesse")}">Positionsgröße</a> ist der Anteil des Depots in einer einzelnen Anlage. Steckt alles in einem Wert und der fällt um 40 %, ist das Depot 40 % im Minus. Bei 12,5 % Anteil sind es nur 5 % des Depots.</p>
${c.live("Positionsgrößen deines Bots", () => { const s = c.status; if (!s || !s.strategy) return ""; const n = c.signals.length || 8; const per = Math.min(s.strategy.max_weight_per_symbol, s.strategy.max_invested / n); const eq = s.account && s.account.equity; return `<p>Jeder der ${n} ETFs bekommt höchstens <b>${c.pctD(per, 2)}</b> des Depots${eq ? ` – bei deinem Depotwert von ${c.usd(eq, 0)} also etwa ${c.usd(eq * per, 0)}` : ""}. Insgesamt investiert der Bot höchstens ${c.pctD(s.strategy.max_invested, 0)}; mindestens ${c.pctD(1 - s.strategy.max_invested, 0)} bleiben als Puffer. Fiele ein einzelner ETF um 30 %, verlöre das Depot dadurch rund ${c.pctD(per * 0.3, 1)}.</p>`; })}
<h3>Cash ist auch eine Position</h3>
<p>Bargeld bringt im Backtest keine Zinsen, schwankt aber auch nicht. Wenn die Regel „Cash“ sagt, ist das kein Fehler, sondern genau ihre Schutzfunktion.</p>
<h3>Der Not-Aus deines Bots</h3>
<p>Der <a href="${G("not-aus")}">Not-Aus</a> hat zwei Stufen:</p>
<ol>
<li><b>Tagesgrenze:</b> Ist das Depot seit gestern Abend um mehr als ${c.status && c.status.risk ? c.pct(c.status.risk.max_daily_loss_pct, 0) : "3 %"} gefallen, handelt der Bot an diesem Tag nicht. An extremen Tagen sind die Kurse chaotisch, Spreads groß, und Panikverkäufe sind teuer.</li>
<li><b>Gesamtgrenze:</b> Liegt das Depot mehr als ${c.status && c.status.risk ? c.pct(c.status.risk.max_drawdown_pct, 0) : "20 %"} unter seinem Höchststand, stoppt der Bot komplett, bis du die Datei <code>bot/state.json</code> löschst. Das ist bewusst unbequem: Ein Mensch soll hinschauen, ob etwas kaputt ist – oder ob einfach der Markt fällt.</li>
</ol>
<p>Ehrlich gesagt: Die Gesamtgrenze kann auch schaden. Der Backtest-Absturz der Regel lag bei rund 19 %. Stoppt der Bot knapp darunter, verpasst er womöglich die Erholung. Deshalb gehört zu einem Not-Aus immer die Entscheidung, wann und wie man wieder startet.</p>
<h3>Weitere Sicherungen</h3>
<ul>
<li>Orders nur bei offener Börse</li>
<li>Kleine Umschichtungen unter ${c.status && c.status.risk ? c.usd(c.status.risk.min_trade_usd, 0) : "50 $"} werden ignoriert (spart Kosten)</li>
<li>Fest verdrahtet auf Spielgeld: Echtes Geld ist im Code gar nicht vorgesehen</li>
</ul>`,
    merke: [
      "Erst fragen „Wie viel kann ich verlieren?“, dann „Wie viel kann ich gewinnen?“.",
      "Kleine Positionsgrößen begrenzen den Schaden durch einen einzelnen Wert.",
      "Der Not-Aus stoppt den Bot bei großen Verlusten – danach entscheidet ein Mensch.",
    ],
    quiz: [
      { q: "Ein ETF macht 12,5 % deines Depots aus und fällt um 40 %. Wie stark sinkt dein Depot dadurch?", a: ["40 %", "Um 5 %", "Um 12,5 %"], c: 1, why: "12,5 % × 40 % = 5 % des Depots. Darum begrenzt die Positionsgröße den Schaden." },
      { q: "Was passiert, wenn dein Depot an einem Tag um mehr als 3 % fällt?", a: ["Der Bot verkauft alles", "Der Bot handelt an diesem Tag nicht", "Der Bot kauft nach"], c: 1, why: "Die Tagesgrenze verhindert Panikhandel an chaotischen Tagen." },
      { q: "Wie gibst du den Bot nach dem großen Not-Aus wieder frei?", a: ["Er startet nach einer Woche von selbst", "Die Datei bot/state.json löschen", "Bei Alpaca anrufen"], c: 1, why: "Das ist bewusst ein manueller Schritt, damit ein Mensch die Lage prüft." },
    ],
  });

  // ------------------------------------------------------------ 11
  lessons.push({
    title: "Bot oder ETF-Sparplan? Ein ehrlicher Vergleich",
    minutes: 4,
    body: c => `
<p>Die wichtigste Frage zum Schluss: Lohnt sich das? Oder wäre ein einfacher <a href="${G("sparplan")}">ETF-Sparplan</a> besser?</p>
<h3>Der Sparplan</h3>
<p>Beim Sparplan kauft man jeden Monat automatisch für einen festen Betrag einen breiten ETF (zum Beispiel auf den Weltaktienmarkt) und verkauft jahrzehntelang nicht. Kein Timing, keine Regeln, kaum Kosten, Steuern erst beim Verkauf. Fällt der Markt, kauft man automatisch mehr Anteile zum günstigeren Preis.</p>
${c.live("Backtest-Ergebnis", () => { const b = c.backtest, g = c.period("Gesamt"); if (!b || !g) return ""; return `<p>Aus ${c.usd(b.start_capital, 0)} wurden seit ${c.dDate(g.from).slice(-4)} mit der Bot-Regel <b>${c.usd(b.end_value.strategy, 0)}</b>, mit SPY kaufen und halten <b>${c.usd(b.end_value.benchmark, 0)}</b>. Dafür war der größte Absturz der Regel ${c.pctD(g.strategy.max_drawdown, 0)} statt ${c.pctD(g.benchmark.max_drawdown, 0)}. ${c.btDemo ? "(Demo-Backtest mit Zufallskursen!)" : ""}</p>`; })}
<h3>Gegenüberstellung</h3>
<table><thead><tr><th></th><th>Bot (200-Tage-Regel)</th><th>Sparplan/Halten</th></tr></thead><tbody>
<tr><td>Rendite (historisch)</td><td>meist niedriger</td><td>meist höher</td></tr>
<tr><td>Tiefe Abstürze</td><td>oft kleiner</td><td>voll mitgenommen</td></tr>
<tr><td>Aufwand</td><td>Technik, Überwachung</td><td>fast keiner</td></tr>
<tr><td>Steuern (DE)</td><td>häufig fällig</td><td>erst beim Verkauf</td></tr>
<tr><td>Fehlerquellen</td><td>Code, Daten, Broker</td><td>kaum</td></tr>
<tr><td>Psychologie</td><td>leichter durchzuhalten</td><td>verlangt Nerven im Crash</td></tr>
</tbody></table>
<h3>Was folgt daraus?</h3>
<p>Für den langfristigen Vermögensaufbau gilt in der Forschung der breite, günstige ETF-Sparplan als schwer zu schlagen. Trendfolge kann sinnvoll sein für jemanden, der große Abstürze psychologisch nicht aushält und deshalb sonst im falschen Moment verkaufen würde – der Bot zwingt dann zu einem geordneten Ausstieg und Wiedereinstieg.</p>
<p>Der eigentliche Wert dieses Projekts ist ein anderer: Du lernst, wie Märkte, Risiken und Regeln funktionieren – mit Spielgeld, ohne dass Fehler weh tun. Das ist ein guter Grund, ihn laufen zu lassen.</p>`,
    merke: [
      "Historisch brachte einfaches Halten meist mehr Rendite, die Trendregel kleinere Abstürze.",
      "Ein Sparplan ist billig, einfach und steuerlich günstig – schwer zu schlagen.",
      "Der Bot ist ein Lernwerkzeug, keine Gelddruckmaschine.",
    ],
    quiz: [
      { q: "Was war im Backtest der typische Vorteil der Bot-Regel gegenüber SPY halten?", a: ["Deutlich mehr Rendite", "Kleinere tiefe Abstürze", "Keine Kosten"], c: 1, why: "Die Regel steigt in langen Abwärtstrends aus und vermeidet so einen Teil großer Verluste – meist auf Kosten der Rendite." },
      { q: "Warum ist ein Sparplan steuerlich oft günstiger?", a: ["Sparpläne sind steuerfrei", "Kursgewinne werden erst beim Verkauf versteuert, das Geld arbeitet länger", "Weil man weniger Geld anlegt"], c: 1, why: "Ohne Verkäufe fällt (bis auf die Vorabpauschale) lange keine Steuer auf Kursgewinne an." },
      { q: "Für wen kann eine Trendregel trotz geringerer Rendite sinnvoll sein?", a: ["Für jemanden, der bei großen Abstürzen sonst in Panik verkaufen würde", "Für jeden, immer", "Für niemanden"], c: 0, why: "Wer in Crashs ohnehin verkaufen würde, profitiert von einem geordneten, regelbasierten Ausstieg und Wiedereinstieg." },
    ],
  });

  // ------------------------------------------------------------ 12
  lessons.push({
    title: "Was bei echtem Geld anders wäre",
    minutes: 4,
    body: c => `
<p>Dein Bot handelt mit Spielgeld, und so bleibt es auch. Trotzdem lohnt sich zu wissen, was bei echtem Geld alles dazukäme – damit du keinen falschen Eindruck mitnimmst.</p>
<h3>1. Die gleichen ETFs gibt es für dich (meist) gar nicht</h3>
<p>SPY, QQQ und Co. sind US-Fonds. Für EU-Privatanleger sind sie in der Regel <b>nicht kaufbar</b>, weil die Anbieter kein EU-Basisinformationsblatt (vorgeschrieben durch die PRIIPs-Verordnung) bereitstellen. Stattdessen gibt es <a href="${G("ucits")}">UCITS</a>-ETFs: europäische Fonds, die dieselben Indizes nachbilden (zum Beispiel S&amp;P 500 oder Nasdaq-100) und bei deutschen Brokern handelbar sind. Sie haben eigene Kurse, Kosten und Handelszeiten.</p>
<h3>2. Währung</h3>
<p>US-ETFs notieren in Dollar. Für dich als Euro-Anleger kommt ein <a href="${G("waehrungsrisiko")}">Währungsrisiko</a> dazu: Steigt der Euro gegenüber dem Dollar um 10 %, verlierst du 10 % in Euro gerechnet, selbst wenn der Kurs in Dollar gleich bleibt.</p>
<h3>3. Steuern</h3>
<p>Jeder Verkauf mit Gewinn löst Steuer aus (Lektion 8). Bei US-Wertpapieren kommt die US-<a href="${G("quellensteuer")}">Quellensteuer</a> auf Dividenden hinzu (mit dem Formular W-8BEN meist 15 %, teilweise in Deutschland anrechenbar). Ein deutscher Broker erledigt vieles automatisch, ein ausländischer oft nicht – dann musst du alles selbst in der Steuererklärung (Anlage KAP) angeben.</p>
<h3>4. Ausführung</h3>
<p>Paper Trading simuliert die Ausführung. Echte Orders können zu etwas anderen Preisen ausgeführt werden, vor allem bei kleineren europäischen Handelsplätzen mit breiteren Spreads.</p>
<h3>5. Technik und Verantwortung</h3>
<p>Fehler im Code, falsche Kursdaten, ein ausgefallener GitHub-Lauf, ein gesperrtes Konto: Mit Spielgeld ist das lehrreich, mit echtem Geld teuer. Echte Trading-Systeme brauchen Überwachung, Benachrichtigungen und Tests.</p>
<h3>6. Regulierung</h3>
<p>Nicht jeder Broker darf Kunden in der EU bedienen. Ein in Deutschland zugelassener oder EU-regulierter Broker bietet Einlagensicherung und klare Regeln.</p>
${c.live("Sicherheit im Code", () => `<p>Im Code deines Bots ist <code>paper=True</code> fest eingestellt. Ein Wechsel auf echtes Geld ist bewusst nicht vorgesehen – das wäre eine größere Entscheidung mit Steuer-, Rechts- und Risikofragen, die man vorher ausführlich besprechen sollte.</p>`)}`,
    merke: [
      "US-ETFs wie SPY sind für EU-Privatanleger meist nicht kaufbar – stattdessen gibt es UCITS-ETFs auf dieselben Indizes.",
      "Bei echtem Geld kommen Währungsrisiko, Steuern, echte Ausführung und Verantwortung für die Technik dazu.",
      "Dein Bot bleibt fest auf Spielgeld eingestellt.",
    ],
    quiz: [
      { q: "Warum kann ein deutscher Privatanleger SPY meist nicht kaufen?", a: ["Weil SPY verboten ist", "Weil der Anbieter kein EU-Basisinformationsblatt (PRIIPs) bereitstellt", "Weil SPY zu teuer ist"], c: 1, why: "Ohne Basisinformationsblatt dürfen Broker das Produkt Privatkunden in der EU nicht anbieten. UCITS-ETFs sind die Alternative." },
      { q: "Der S&P 500 bleibt in Dollar gleich, der Euro steigt aber um 10 % gegenüber dem Dollar. Was passiert mit deinem Wert in Euro?", a: ["Er steigt um etwa 10 %", "Er bleibt gleich", "Er fällt um etwa 10 %"], c: 2, why: "Deine Dollar sind weniger Euro wert. Das ist das Währungsrisiko." },
      { q: "Was ist ein UCITS-ETF?", a: ["Ein europäischer Fonds nach EU-Regeln, der oft dieselben Indizes nachbildet", "Ein US-Fonds nur für Profis", "Eine Kryptowährung"], c: 0, why: "UCITS ist der EU-Standard für Investmentfonds. Es gibt UCITS-ETFs z. B. auf den S&P 500 oder Nasdaq-100." },
    ],
  });


  // ------------------------------------------------------------ Vertiefung je Lektion (Beispiele mit Zahlen)
  const EXTRA = [
`<h3>Beispiel mit Zahlen</h3>
<p>Angenommen, du legst 1.000 $ in SPY an, und ein Anteil kostet 500 $. Dann bekommst du 2 Anteile. Steigt der S&amp;P 500 im Laufe eines Jahres um 10 %, steigt auch SPY um ungefähr 10 % – minus die winzige Jahresgebühr von rund 0,09 %. Deine 2 Anteile sind dann etwa 1.099 $ wert. Hättest du stattdessen 1.000 $ in eine einzige Aktie gesteckt, hätte das Ergebnis alles zwischen −80 % und +200 % sein können. Beim ETF gleichen sich Gewinner und Verlierer innerhalb des Korbs größtenteils aus.</p>
<h3>Häufige Frage: Ist ein ETF sicher?</h3>
<p>Sicher im Sinne von „kann nicht fallen“: nein. Ein ETF auf den S&amp;P 500 fiel 2008 um über 35 %. Sicher im Sinne von „das Geld ist weg, wenn der Anbieter pleitegeht“: auch nein – das Fondsvermögen ist rechtlich vom Anbieter getrennt (Sondervermögen). Das Risiko eines ETF ist also vor allem das Risiko des Marktes, den er abbildet.</p>`,
`<h3>Beispiel: ein Tag im Leben eines Kurses</h3>
<p>Morgens um 15:30 Uhr deutscher Zeit eröffnet die US-Börse. Über Nacht hat eine große Firma gute Zahlen gemeldet, viele wollen kaufen – SPY startet 0,5 % höher als am Vorabend. Mittags veröffentlicht die US-Notenbank etwas zu den Zinsen, Käufer und Verkäufer reagieren, der Kurs schwankt. Um 22:00 Uhr schließt die Börse, und der letzte Preis ist der Schlusskurs. Genau diesen Schlusskurs nutzt dein Bot am nächsten Tag für seine Rechnung.</p>
<h3>Häufige Frage: Warum bewegt sich der Kurs, obwohl nichts passiert ist?</h3>
<p>Weil jeden Moment Tausende Menschen und Computer handeln, jeder mit eigenen Gründen: Einer braucht Geld für ein Haus, ein Fonds muss umschichten, ein Algorithmus reagiert auf eine Schlagzeile. Kleine tägliche Bewegungen von 0,5–1 % sind deshalb normal und meist ohne Bedeutung. Fachleute nennen das „Rauschen“.</p>`,
`<h3>Beispiel: drei Orders, ein Ziel</h3>
<p>SPY steht bei 502,10 $ (Kaufpreis) und 502,08 $ (Verkaufspreis). Du willst 2 Anteile kaufen.</p>
<ul>
<li><b>Market-Order:</b> sofort ausgeführt, zu etwa 502,10 $. Kosten 1.004,20 $.</li>
<li><b>Limit-Order 500 $:</b> wird nur ausgeführt, wenn SPY heute auf 500 $ fällt. Vielleicht passiert das, vielleicht nicht. Mit Gültigkeit „Day“ verfällt sie am Abend.</li>
<li><b>Stop-Buy 510 $:</b> kauft erst, wenn SPY auf 510 $ steigt – so etwas nutzen Trendfolger, die erst bei Stärke einsteigen wollen.</li>
</ul>
<h3>Häufige Frage: Kann ich mit einer Market-Order viel zu viel zahlen?</h3>
<p>Bei sehr liquiden ETFs während der Handelszeit praktisch nicht. Gefährlich wird es bei wenig gehandelten Papieren, kurz nach Börsenöffnung oder außerhalb der Handelszeit. Dort setzen auch erfahrene Anleger lieber ein Limit.</p>`,
`<h3>Beispiel: zwei Fahrten, gleiches Ziel</h3>
<p>Anlage A und Anlage B starten beide mit 10.000 € und haben nach 10 Jahren beide 19.700 € (7 % pro Jahr). A ist dabei ruhig gestiegen, nie mehr als 10 % gefallen. B ist zwischendurch auf 6.000 € abgestürzt und hat sich danach wieder erholt. Auf dem Papier sind beide gleich gut. Im echten Leben hätten viele Anleger B im Tief verkauft – und dann nicht 19.700 € gehabt, sondern deutlich weniger. Deshalb gehört zu jeder Rendite die Frage nach dem Weg dorthin.</p>
<h3>Häufige Frage: Was ist eine „gute“ Rendite?</h3>
<p>Breite Aktienmärkte brachten über lange Zeiträume grob 6–10 % pro Jahr, aber mit großen Unterschieden zwischen den Jahrzehnten und Ländern. Wer dauerhaft deutlich mehr verspricht, sollte sehr genau erklären können, woher das kommen soll – und welches Risiko dafür getragen wird.</p>`,
`<h3>Beispiel: drei Körbe</h3>
<p>Du hast 30.000 €. Variante 1: alles in eine Aktie. Fällt sie um 60 %, bleiben 12.000 €. Variante 2: je 10.000 € in drei Aktien derselben Branche. Fällt die Branche, fallen alle drei – vielleicht bleiben 15.000 €. Variante 3: ein ETF auf 500 Firmen aus allen Branchen. Ein einzelner Pleitefall kostet dich kaum etwas; nur ein Einbruch des ganzen Marktes trifft dich spürbar. Je breiter gestreut, desto mehr hängt dein Ergebnis am Markt als Ganzes statt an Einzelschicksalen.</p>
<h3>Häufige Frage: Wie viele ETFs braucht man?</h3>
<p>Für die Streuung reicht oft schon ein einziger sehr breiter ETF (z. B. auf den Weltaktienmarkt mit über 1.000 Firmen). Mehr ETFs bedeuten nicht automatisch mehr Streuung, wenn sie dieselben Firmen enthalten. Dein Bot nutzt acht ETFs nicht wegen der Streuung, sondern damit die Trendregel für Teile des Marktes getrennt entscheiden kann.</p>`,
`<h3>Beispiel: so entscheidet der Bot an einem Tag</h3>
<ol>
<li>Bei jedem Lauf (nachmittags deutscher Zeit) holt er die Schlusskurse des letzten vollständigen Handelstags für alle 8 ETFs.</li>
<li>Für jeden rechnet er den Durchschnitt der letzten 200 Schlusskurse.</li>
<li>Liegt der Kurs darüber, bekommt der ETF sein Zielgewicht (rund 11,9 %), sonst 0 %.</li>
<li>Er vergleicht das mit dem, was im Depot liegt, und schickt nur die Differenz als Kauf oder Verkauf – Beträge unter 50 $ lässt er weg.</li>
</ol>
<p>Liegen also 5 von 8 ETFs über ihrer Linie, sind rund 59 % des Depots investiert und 41 % in Cash.</p>
<h3>Häufige Frage: Warum gerade 200 Tage?</h3>
<p>Weil 200 Tage seit Jahrzehnten der übliche Wert ist, den viele Marktteilnehmer beobachten – nicht, weil er in unserem Backtest am besten war. Genau das schützt vor Overfitting (Lektion 7): Die Zahl wurde nicht passend zu unseren Daten ausgesucht.</p>`,
`<h3>Beispiel: wie leicht man sich selbst betrügt</h3>
<p>Stell dir vor, du testest die Regel mit 20 verschiedenen Durchschnittslängen (50, 60, 70 … 250 Tage) und mit 10 verschiedenen ETF-Auswahlen. Das sind 200 Varianten. Selbst wenn keine davon wirklich besser ist als Kaufen und Halten, wird reiner Zufall dafür sorgen, dass ein paar im Backtest glänzen. Nimmst du die beste, hast du nicht die beste Regel gefunden, sondern den größten Zufall.</p>
<h3>Häufige Frage: Ist ein Backtest dann wertlos?</h3>
<p>Nein. Er ist gut, um Regeln auszusortieren (was schon in der Vergangenheit nicht funktioniert hat, ist verdächtig) und um ein Gefühl für Risiken zu bekommen: Wie tief kann es fallen? Wie lange kann eine schlechte Phase dauern? Er ist schlecht als Renditeversprechen.</p>`,
`<h3>Beispiel: Kosten über 20 Jahre</h3>
<p>10.000 € wachsen 20 Jahre lang mit 7 % pro Jahr. Ohne Kosten werden daraus rund 38.700 €. Kostet die Anlage 1 % pro Jahr (zum Beispiel ein teurer aktiver Fonds), bleiben 6 % übrig – Endwert rund 32.100 €. Das ist ein Unterschied von 6.600 €, nur durch einen Prozentpunkt Kosten. Bei einem ETF mit 0,1 % Kosten wären es rund 38.000 €.</p>
<h3>Häufige Frage: Muss ich mit dem Paper-Konto Steuern zahlen?</h3>
<p>Nein. Mit Spielgeld entstehen keine echten Gewinne und damit auch keine Steuern. Alles in dieser Lektion betrifft nur echtes Geld.</p>`,
`<h3>Beispiel: März 2020</h3>
<p>Im Februar 2020 erreichte der S&amp;P 500 ein Rekordhoch. Innerhalb von gut vier Wochen fiel er um rund ein Drittel. Viele verkauften in Panik im März. Wer gehalten hat, war im August schon wieder auf Rekordniveau. Wer verkauft hat und auf „Klarheit“ warten wollte, kaufte oft erst Monate später zu höheren Kursen zurück. Die Trendregel ist in diesem Beispiel übrigens auch nicht glänzend: Sie stieg spät aus und stieg erst wieder ein, als ein guter Teil der Erholung schon vorbei war.</p>
<h3>Häufige Frage: Soll ich den Bot abschalten, wenn er ein paar Mal danebenliegt?</h3>
<p>Ein paar Fehlsignale gehören zur Regel dazu – das zeigt auch der Backtest. Wenn du etwas ändern willst, dann mit Ruhe, nach dem Lesen von Lektion 7 und mit Blick auf beide Teilzeiträume, nicht aus dem Bauch nach einer schlechten Woche.</p>`,
`<h3>Beispiel: die 2-%-Regel der Trader</h3>
<p>Viele aktive Trader riskieren pro Trade höchstens 1–2 % ihres Kontos. Bei 50.000 € heißt das: Wenn der Trade schiefgeht und der Stop-Loss greift, sollen höchstens 1.000 € verloren sein. Liegt der Stop 10 % unter dem Kaufkurs, darf die Position also höchstens 10.000 € groß sein. Dein Bot arbeitet anders (keine Stops, feste Gewichte), aber die Denkweise ist dieselbe: Die Größe einer Position ergibt sich aus dem Verlust, den man im schlechten Fall akzeptiert.</p>
<h3>Häufige Frage: Warum nicht einfach 100 % investieren?</h3>
<p>Zwischen Signal (Schlusskurs von gestern) und Ausführung (heute) bewegen sich die Kurse. Ein kleiner Cash-Puffer sorgt dafür, dass Kaufaufträge nicht an fehlendem Geld scheitern und das Konto nie ins Minus rutscht.</p>`,
`<h3>Beispiel: 200 € im Monat</h3>
<p>Wer 20 Jahre lang jeden Monat 200 € in einen breiten ETF spart, zahlt insgesamt 48.000 € ein. Bei angenommenen 6 % pro Jahr (das ist ein Rechenbeispiel, keine Prognose) wären es am Ende rund 92.000 €. Der Aufwand: einmal einrichten. Ein Trading-Bot müsste diesen Wert nach Kosten und Steuern übertreffen, um sich rein finanziell zu lohnen – und das ist historisch sehr schwer.</p>
<h3>Häufige Frage: Kann ich beides kombinieren?</h3>
<p>Ja, und viele machen das: Der große Teil läuft langweilig im Sparplan, ein kleiner Teil dient zum Lernen und Ausprobieren. Genau so ist dein Projekt gedacht – nur dass der Lernteil hier sogar mit Spielgeld läuft.</p>`,
`<h3>Beispiel: Wechselkurs</h3>
<p>Du kaufst für 10.000 € US-ETFs, als 1 € = 1,10 $ kostet. Du bekommst dafür 11.000 $. Ein Jahr später sind die ETFs um 5 % gestiegen: 11.550 $. Inzwischen kostet 1 € aber 1,20 $. Beim Rücktausch bekommst du 11.550 / 1,20 = 9.625 €. Trotz Kursgewinn hast du in Euro 3,75 % verloren. Umgekehrt kann ein steigender Dollar dir auch einen Zusatzgewinn bescheren. Das Währungsrisiko wirkt in beide Richtungen.</p>
<h3>Häufige Frage: Was wäre der nächste Schritt, wenn ich irgendwann echtes Geld anlegen will?</h3>
<p>Zuerst die Grundlagen klären: Notgroschen, Schulden, Anlagehorizont. Dann für den Großteil meist ein einfacher, breiter UCITS-ETF-Sparplan bei einem deutschen Broker. Eine automatische Trading-Regel mit echtem Geld wäre ein eigenes Projekt mit eigenen Risiken – das würden wir vorher ausführlich besprechen.</p>`,
  ];
  lessons.forEach((l, i) => { const b = l.body; l.body = c => b(c) + (EXTRA[i] || ""); });
  // Lesezeit grob aus der Wortzahl schätzen (ca. 170 Wörter pro Minute, inkl. Quiz)
  const stub = { signals: [], live: () => "", period: () => null, sig: () => null, esc: x => x, pct: x => x, pctD: x => x, usd: x => x, fmt: x => x, dDate: x => x };
  lessons.forEach(l => {
    let words = 0;
    try { words = (l.body(stub) + l.merke.join(" ") + l.quiz.map(q => q.q + " " + q.a.join(" ") + " " + q.why).join(" ")).replace(/<[^>]+>/g, " ").split(/\s+/).length; } catch (e) { words = 600; }
    l.minutes = Math.min(6, Math.max(3, Math.round(words / 170)));
  });

  // ------------------------------------------------------------ Abschlusstest
  const finalQuiz = [
    { q: "Ein ETF ist …", a: ["eine einzelne Aktie", "ein börsengehandelter Fonds, der meist einen Index nachbildet", "ein Sparbuch"], c: 1, why: "ETF = Exchange Traded Fund. Er bündelt viele Wertpapiere und ist an der Börse handelbar." },
    { q: "Was bestimmt den Kurs an der Börse?", a: ["Die Börsenaufsicht", "Angebot und Nachfrage", "Der Gewinn des letzten Jahres"], c: 1, why: "Der Kurs ist der Preis, zu dem sich Käufer und Verkäufer gerade einig werden." },
    { q: "Welche Order garantiert dir einen Höchstpreis?", a: ["Market-Order", "Limit-Order", "Stop-Order"], c: 1, why: "Die Limit-Order wird nie über deinem Limit ausgeführt – dafür vielleicht gar nicht." },
    { q: "Was ist der maximale Drawdown?", a: ["Der größte Tagesgewinn", "Der größte Absturz vom bisherigen Höchststand", "Die durchschnittliche Rendite"], c: 1, why: "Er zeigt, wie tief es zwischendurch im schlimmsten Fall ging." },
    { q: "Nach einem Verlust von 50 % braucht man wie viel Gewinn, um wieder auf den alten Stand zu kommen?", a: ["50 %", "75 %", "100 %"], c: 2, why: "Aus 50 wieder 100 zu machen ist eine Verdopplung." },
    { q: "Was ist die Kernregel deines Bots?", a: ["Kaufen, wenn der Kurs fällt", "Halten, wenn der Kurs über dem 200-Tage-Durchschnitt liegt, sonst Cash", "Jeden Montag alles kaufen"], c: 1, why: "Trendfolge: über der Linie halten, darunter Cash." },
    { q: "Warum rechnet der Backtest „Signal heute, Handel morgen“?", a: ["Damit er schneller ist", "Damit kein Wissen genutzt wird, das man zum Handelszeitpunkt noch nicht hatte", "Weil Alpaca es verlangt"], c: 1, why: "Den Schlusskurs kennt man erst nach Börsenschluss. Mit ihm am selben Tag zu handeln wäre ein Blick in die Zukunft." },
    { q: "Was ist Overfitting?", a: ["Zu viele ETFs im Depot", "Eine Regel so lange an die Vergangenheit anpassen, bis der Backtest perfekt aussieht", "Zu hohe Gebühren"], c: 1, why: "Überangepasste Regeln funktionieren in der Vergangenheit toll und in der Zukunft schlecht." },
    { q: "Wie hoch ist ungefähr die Steuer auf Kapitalerträge in Deutschland (ohne Kirchensteuer)?", a: ["Rund 15 %", "Rund 26,4 %", "Rund 42 %"], c: 1, why: "25 % Abgeltungsteuer plus 5,5 % Soli darauf ergibt rund 26,4 %." },
    { q: "Wann hilft Diversifikation am wenigsten?", a: ["In ruhigen Zeiten", "In großen Crashs, wenn fast alles gleichzeitig fällt", "Bei ETFs"], c: 1, why: "In Panikphasen steigt die Korrelation, die Streuung über Aktien schützt dann kaum." },
    { q: "Ein Verlust schmerzt ungefähr wie stark im Vergleich zu einem gleich großen Gewinn?", a: ["Halb so stark", "Gleich stark", "Etwa doppelt so stark"], c: 2, why: "Das ist die Verlustaversion – ein gut belegter psychologischer Effekt." },
    { q: "Wozu dient die Positionsgröße von höchstens 12,5 % je ETF?", a: ["Sie begrenzt den Schaden, wenn ein einzelner ETF stark fällt", "Sie erhöht die Rendite", "Sie spart Steuern"], c: 0, why: "Fällt ein ETF um 40 %, verliert das Depot dadurch nur 5 %." },
    { q: "Was zeigte der Backtest typischerweise für die 200-Tage-Regel im Vergleich zu SPY halten?", a: ["Mehr Rendite und mehr Risiko", "Weniger Rendite, aber kleinere Abstürze", "Gleiche Rendite, gleiches Risiko"], c: 1, why: "Trendfolge ist eher ein Sicherheitsgurt als ein Turbo." },
    { q: "Was ist bei echtem Geld für EU-Anleger anders?", a: ["Nichts", "US-ETFs sind meist nicht kaufbar, dazu kommen Währungsrisiko und Steuern", "Man darf nur Krypto kaufen"], c: 1, why: "Stattdessen gibt es UCITS-ETFs; Dollar-Schwankungen und Steuern verändern das Ergebnis." },
    { q: "Was ist Paper Trading?", a: ["Handel mit Aktienurkunden aus Papier", "Handel mit Spielgeld zu echten Kursen", "Handel nur per Brief"], c: 1, why: "Alpaca simuliert die Orders mit echten Kursen, aber es fließt kein echtes Geld." },
  ];

  // ------------------------------------------------------------ Glossar
  const glossary = [
    { id: "aktie", term: "Aktie", def: "Ein Anteil an einem Unternehmen. Wer Aktien besitzt, ist Miteigentümer und profitiert von Kurssteigerungen und Dividenden – trägt aber auch Verluste.", lesson: 1 },
    { id: "index", term: "Index", def: "Eine Kennzahl, die viele Aktien zusammenfasst, z. B. den S&P 500. Man kann ihn nicht direkt kaufen, nur Produkte wie ETFs, die ihn nachbilden.", lesson: 1 },
    { id: "etf", term: "ETF", alt: "Exchange Traded Fund", def: "Ein börsengehandelter Fonds, der meist einen Index nachbildet. Günstig, breit gestreut und jederzeit während der Handelszeit handelbar.", lesson: 1 },
    { id: "sp500", term: "S&P 500", def: "Index der rund 500 größten börsennotierten US-Unternehmen, gewichtet nach Größe. Der bekannteste Maßstab für den US-Aktienmarkt. Der ETF SPY bildet ihn nach.", lesson: 1 },
    { id: "nasdaq", term: "Nasdaq-100", def: "Index der 100 größten Nicht-Finanz-Firmen an der US-Börse Nasdaq, stark technologielastig. Der ETF QQQ bildet ihn nach.", lesson: 1 },
    { id: "dow", term: "Dow Jones", def: "Ältester US-Aktienindex mit 30 Großkonzernen. Er gewichtet nach Aktienkurs statt nach Firmengröße – eine historische Eigenheit. ETF: DIA.", lesson: 1 },
    { id: "russell", term: "Russell 2000", def: "Index von rund 2.000 kleineren US-Firmen (Small Caps). Schwankt meist stärker als der S&P 500. ETF: IWM.", lesson: 1 },
    { id: "sektor", term: "Sektor", def: "Eine Branche, z. B. Technologie, Gesundheit, Finanzen oder Energie. Sektor-ETFs (XLK, XLV, XLF, XLE) enthalten nur Firmen einer Branche aus dem S&P 500.", lesson: 1 },
    { id: "dividende", term: "Dividende", def: "Ein Teil des Firmengewinns, der an die Aktionäre ausgezahlt wird. ETFs geben Dividenden entweder aus (ausschüttend) oder legen sie wieder an (thesaurierend).", lesson: 1 },
    { id: "marktkapitalisierung", term: "Marktkapitalisierung", def: "Der Börsenwert einer Firma: Aktienkurs mal Anzahl der Aktien. Große Indizes gewichten Firmen danach.", lesson: 5 },
    { id: "ter", term: "TER", alt: "Gesamtkostenquote", def: "Die jährlichen laufenden Kosten eines Fonds in Prozent, z. B. 0,07 %. Werden automatisch aus dem Fondsvermögen bezahlt.", lesson: 8 },
    { id: "boerse", term: "Börse", def: "Ein organisierter Marktplatz für Wertpapiere, auf dem Käufer und Verkäufer zusammenfinden. Beispiele: NYSE, Nasdaq, Xetra.", lesson: 2 },
    { id: "kurs", term: "Kurs", def: "Der Preis, zu dem ein Wertpapier gerade gehandelt wird. Entsteht aus Angebot und Nachfrage.", lesson: 2 },
    { id: "schlusskurs", term: "Schlusskurs", def: "Der letzte Kurs eines Handelstags. Dein Bot rechnet mit Schlusskursen, bereinigt um Dividenden und Aktiensplits.", lesson: 2 },
    { id: "handelstag", term: "Handelstag", def: "Ein Tag, an dem die Börse geöffnet hat. In den USA sind das rund 252 pro Jahr. Dein Bot läuft Mo–Fr um 15:00 Uhr UTC (17:00 Uhr Sommerzeit, 16:00 Uhr Winterzeit).", lesson: 2 },
    { id: "handelszeiten", term: "Handelszeiten", def: "US-Börsen: 9:30–16:00 Uhr New Yorker Zeit, bei uns meist 15:30–22:00 Uhr. Xetra (Frankfurt): 9:00–17:30 Uhr.", lesson: 2 },
    { id: "spread", term: "Spread", alt: "Geld-Brief-Spanne", def: "Die Differenz zwischen dem höchsten Kaufgebot und dem niedrigsten Verkaufsangebot. Eine versteckte Gebühr bei jedem Handel; bei großen ETFs sehr klein.", lesson: 2 },
    { id: "liquiditaet", term: "Liquidität", def: "Wie leicht sich ein Wertpapier ohne große Preisabschläge kaufen oder verkaufen lässt. Viel gehandelte ETFs wie SPY sind sehr liquide.", lesson: 3 },
    { id: "broker", term: "Broker", def: "Ein Vermittler, über den du Wertpapiere kaufst und verkaufst und der dein Depot führt. Bei deinem Bot ist das Alpaca.", lesson: 2 },
    { id: "alpaca", term: "Alpaca", def: "Ein US-Broker mit Programmierschnittstelle. Dein Bot nutzt nur das kostenlose Paper-Konto (Spielgeld).", lesson: 2 },
    { id: "paper-trading", term: "Paper Trading", def: "Handeln mit Spielgeld zu echten Kursen. Orders werden simuliert, es fließt kein echtes Geld. Ideal zum Lernen.", lesson: 2 },
    { id: "order", term: "Order", def: "Ein Kauf- oder Verkaufsauftrag an den Broker.", lesson: 3 },
    { id: "market-order", term: "Market-Order", alt: "Bestens-Order", def: "Wird sofort zum besten verfügbaren Preis ausgeführt. Sicher ausgeführt, Preis aber nicht garantiert. Dein Bot nutzt sie.", lesson: 3 },
    { id: "limit-order", term: "Limit-Order", def: "Wird nur zu deinem Wunschpreis oder besser ausgeführt. Preis garantiert, Ausführung nicht.", lesson: 3 },
    { id: "stop-order", term: "Stop-Order", alt: "Stop-Loss", def: "Wird erst aktiv, wenn ein bestimmter Kurs erreicht ist, und dann wie eine Market-Order ausgeführt. Typisch zur Verlustbegrenzung.", lesson: 3 },
    { id: "slippage", term: "Slippage", def: "Der Unterschied zwischen erwartetem und tatsächlichem Ausführungspreis. Größer bei schnellen Märkten und wenig gehandelten Papieren.", lesson: 3 },
    { id: "position", term: "Position", def: "Was du von einem Wertpapier besitzt, z. B. „12 Anteile SPY im Wert von 6.000 $“.", lesson: 10 },
    { id: "einstandskurs", term: "Einstandskurs", def: "Der durchschnittliche Preis, zu dem du eine Position gekauft hast. Daran wird Gewinn oder Verlust gemessen.", lesson: 4 },
    { id: "depotwert", term: "Depotwert", def: "Der Gesamtwert deines Kontos: alle Positionen zum aktuellen Kurs plus Cash.", lesson: 4 },
    { id: "cash", term: "Cash", def: "Nicht investiertes Geld im Depot. Schwankt nicht, bringt im Backtest aber auch keine Zinsen. Der Bot hält Cash, wenn ein ETF unter seiner Linie liegt.", lesson: 10 },
    { id: "gewinn-verlust", term: "Gewinn/Verlust", alt: "G/V", def: "Wie viel eine Position gegenüber dem Einstandskurs gewonnen oder verloren hat. „Unrealisiert“ heißt: nur auf dem Papier, solange nicht verkauft wurde.", lesson: 4 },
    { id: "rendite", term: "Rendite", def: "Der Ertrag einer Anlage in Prozent, z. B. +12 % in einem Jahr.", lesson: 4 },
    { id: "gesamtrendite", term: "Gesamtrendite", def: "Die Rendite über den ganzen Zeitraum. +100 % heißt: das Geld hat sich verdoppelt.", lesson: 4 },
    { id: "cagr", term: "Rendite pro Jahr (CAGR)", alt: "jährliche Wachstumsrate", def: "Die durchschnittliche jährliche Rendite mit Zinseszins: Wie viel Prozent pro Jahr hätte man gebraucht, um vom Start- zum Endwert zu kommen?", lesson: 4 },
    { id: "volatilitaet", term: "Volatilität", def: "Maß für die Schwankung der Kurse, aufs Jahr gerechnet. Höher = unruhiger. Der S&P 500 liegt langfristig bei etwa 15–20 % pro Jahr.", lesson: 4 },
    { id: "drawdown", term: "Drawdown", alt: "Rückgang vom Höchststand", def: "Wie weit ein Depot unter seinem bisherigen Höchststand liegt. Der maximale Drawdown ist der schlimmste solche Absturz im Zeitraum.", lesson: 4 },
    { id: "sharpe", term: "Sharpe-Ratio", def: "Rendite geteilt durch Schwankung – also Rendite pro Einheit Risiko. Höher ist besser. Unser Backtest rechnet vereinfacht ohne Abzug des risikolosen Zinses.", lesson: 4 },
    { id: "log-skala", term: "Logarithmische Skala", def: "Eine Achse, auf der gleiche Prozent-Schritte gleich hoch sind (100→200 genauso hoch wie 1.000→2.000). Gut für lange Zeiträume.", lesson: 4 },
    { id: "benchmark", term: "Benchmark", alt: "Vergleichsmaßstab", def: "Womit man eine Strategie vergleicht. Bei deinem Bot: SPY kaufen und halten. Nur wenn eine Strategie die Benchmark schlägt (bei Rendite oder Risiko), lohnt sich der Aufwand.", lesson: 7 },
    { id: "kaufen-halten", term: "Kaufen und Halten", alt: "Buy and Hold", def: "Einmal kaufen und jahrelang nicht verkaufen. Einfach, günstig, steuerlich vorteilhaft – und schwer zu schlagen.", lesson: 11 },
    { id: "diversifikation", term: "Diversifikation", alt: "Streuung", def: "Geld auf viele unterschiedliche Anlagen verteilen, damit ein einzelner Verlust nicht das ganze Depot trifft.", lesson: 5 },
    { id: "korrelation", term: "Korrelation", def: "Wie ähnlich sich zwei Anlagen bewegen, von −1 (genau entgegengesetzt) über 0 (unabhängig) bis +1 (exakt gleich).", lesson: 5 },
    { id: "sma", term: "200-Tage-Linie", alt: "gleitender Durchschnitt, SMA", def: "Der Durchschnitt der letzten 200 Schlusskurse, jeden Tag neu berechnet. Dein Bot hält einen ETF nur, wenn der Kurs darüber liegt.", lesson: 6 },
    { id: "trendfolge", term: "Trendfolge", def: "Strategien, die bestehenden Trends folgen: halten, solange es steigt, aussteigen, wenn der Trend dreht. Die 200-Tage-Regel ist eine einfache Form davon.", lesson: 6 },
    { id: "whipsaw", term: "Whipsaw", alt: "Fehlsignal", def: "Wenn ein Kurs um die Linie pendelt und die Regel deshalb mehrmals kurz hintereinander kauft und verkauft – mit Kosten und oft Verlust. Liegt ein ETF weniger als 2 % von der Linie entfernt, ist das Risiko dafür größer.", lesson: 6 },
    { id: "bullenmarkt", term: "Bullenmarkt", def: "Eine längere Phase steigender Kurse. Der Bulle stößt mit den Hörnern nach oben.", lesson: 6 },
    { id: "baerenmarkt", term: "Bärenmarkt", def: "Eine längere Phase fallender Kurse, oft definiert als mehr als 20 % unter dem Hoch. Der Bär schlägt mit der Tatze nach unten.", lesson: 6 },
    { id: "backtest", term: "Backtest", def: "Eine Rückrechnung: Wie hätte eine Regel in der Vergangenheit abgeschnitten? Nützlich, aber keine Vorhersage.", lesson: 7 },
    { id: "overfitting", term: "Overfitting", alt: "Überanpassung", def: "Eine Regel so lange an die Vergangenheit anpassen, bis der Backtest perfekt aussieht. Funktioniert dann meist in der Zukunft schlecht.", lesson: 7 },
    { id: "in-sample", term: "In-Sample / Out-of-Sample", def: "Der Teil der Daten, mit dem man eine Regel entwickelt (in-sample), und der Teil, mit dem man sie danach prüft (out-of-sample). Im Dashboard: erste 70 % und letzte 30 %.", lesson: 7 },
    { id: "look-ahead", term: "Blick in die Zukunft", alt: "Look-ahead Bias", def: "Ein Backtest-Fehler: Man nutzt Informationen, die man zum Handelszeitpunkt noch nicht hatte. Dein Backtest vermeidet das mit „Signal heute, Handel morgen“.", lesson: 7 },
    { id: "survivorship-bias", term: "Survivorship Bias", def: "Denkfehler, bei dem man nur die „Überlebenden“ betrachtet (z. B. heutige Gewinner-Aktien) und die Gescheiterten vergisst. Lässt Strategien besser aussehen, als sie sind.", lesson: 7 },
    { id: "basispunkt", term: "Basispunkt", def: "Ein Hundertstel Prozent: 1 Basispunkt = 0,01 %. 5 Basispunkte = 0,05 %.", lesson: 8 },
    { id: "rebalancing", term: "Umschichten", alt: "Rebalancing", def: "Das Depot zurück auf die Zielgewichte bringen. Dein Bot ignoriert Umschichtungen unter 50 $, um Kosten zu sparen.", lesson: 10 },
    { id: "investitionsquote", term: "Investitionsquote", def: "Welcher Anteil des Depots in ETFs steckt, der Rest ist Cash. Bei deinem Bot höchstens 95 %; sie sinkt, wenn ETFs unter ihre Linie fallen.", lesson: 10 },
    { id: "positionsgroesse", term: "Positionsgröße", def: "Wie viel vom Depot in einer einzelnen Anlage steckt. Kleine Positionen begrenzen den Schaden durch einen einzelnen Verlierer.", lesson: 10 },
    { id: "not-aus", term: "Not-Aus", def: "Sicherung deines Bots: Mehr als 3 % Tagesverlust → an diesem Tag kein Handel. Mehr als 20 % unter dem Höchststand → Bot stoppt, bis bot/state.json gelöscht wird.", lesson: 10 },
    { id: "abgeltungsteuer", term: "Abgeltungsteuer", def: "Steuer auf Kapitalerträge in Deutschland: 25 % plus Solidaritätszuschlag (und ggf. Kirchensteuer), zusammen rund 26,4 %. Keine Steuerberatung.", lesson: 8 },
    { id: "sparerpauschbetrag", term: "Sparer-Pauschbetrag", def: "Kapitalerträge bis 1.000 € pro Person und Jahr (2.000 € bei Zusammenveranlagung) sind in Deutschland steuerfrei.", lesson: 8 },
    { id: "freistellungsauftrag", term: "Freistellungsauftrag", def: "Ein Auftrag an deine Bank, Kapitalerträge bis zum Sparer-Pauschbetrag nicht zu versteuern.", lesson: 8 },
    { id: "teilfreistellung", term: "Teilfreistellung", def: "Bei Aktienfonds (mindestens 51 % Aktien) sind in Deutschland 30 % der Erträge steuerfrei.", lesson: 8 },
    { id: "vorabpauschale", term: "Vorabpauschale", def: "Jährlich besteuerter, fiktiver Mindestertrag bei Fonds, abhängig vom Basiszins. Wird beim späteren Verkauf verrechnet.", lesson: 8 },
    { id: "quellensteuer", term: "Quellensteuer", def: "Steuer, die direkt im Herkunftsland einbehalten wird – bei US-Dividenden meist 15 % (mit Formular W-8BEN).", lesson: 12 },
    { id: "ucits", term: "UCITS", def: "EU-Standard für Investmentfonds. UCITS-ETFs sind für Privatanleger in der EU kaufbar und bilden oft dieselben Indizes ab wie US-ETFs.", lesson: 12 },
    { id: "waehrungsrisiko", term: "Währungsrisiko", def: "Das Risiko, dass sich der Wechselkurs (z. B. Euro/Dollar) ungünstig entwickelt. Betrifft Euro-Anleger bei Dollar-Anlagen.", lesson: 12 },
    { id: "sparplan", term: "ETF-Sparplan", def: "Regelmäßig (z. B. monatlich) automatisch für einen festen Betrag ETF-Anteile kaufen und lange halten.", lesson: 11 },
    { id: "fomo", term: "FOMO", alt: "Fear of Missing Out", def: "Die Angst, einen Gewinn zu verpassen. Verleitet dazu, nach starken Anstiegen teuer einzusteigen.", lesson: 9 },
    { id: "verlustaversion", term: "Verlustaversion", def: "Verluste schmerzen etwa doppelt so stark, wie gleich große Gewinne freuen. Führt zu typischen Anlegerfehlern.", lesson: 9 },
  ];

  return { lessons, glossary, finalQuiz };
})();
