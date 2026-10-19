/* Linie 200 – Dashboard des Aktien-Bots.
   Liest nur docs/data/*.json (vom Bot geschrieben). Keine Schlüssel, kein Alpaca-Zugriff im Browser. */
"use strict";

const REPO = "https://github.com/dennisknoepfle1/aktien-bot";
const ACAD = window.AKADEMIE || { lessons: [], glossary: [], finalQuiz: [] };
const D = { status: null, history: [], orders: [], runs: [], backtest: null };
const charts = [];

// ------------------------------------------------------------------ Formatierung (deutsch)
const nf = {};
function fmt(n, d = 2) {
  if (n == null || !isFinite(n)) return "–";
  const k = d;
  nf[k] = nf[k] || new Intl.NumberFormat("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
  return nf[k].format(n);
}
const NB = " ";
const usd = (n, d = 2) => (n == null || !isFinite(n) ? "–" : fmt(n, d) + NB + "$");
const sgn = n => (n > 0 ? "+" : n < 0 ? "−" : "±");
/** Wert ist bereits in Prozent (z. B. 4.2) */
const pct = (n, d = 1, sign = false) =>
  n == null || !isFinite(n) ? "–" : (sign ? sgn(n) + fmt(Math.abs(n), d) : fmt(n, d)) + NB + "%";
/** Wert ist eine Dezimalzahl (0.042 = 4,2 %) */
const pctD = (x, d = 1, sign = false) => (x == null || !isFinite(x) ? "–" : pct(x * 100, d, sign));
const usdS = (n, d = 2) => (n == null || !isFinite(n) ? "–" : sgn(n) + fmt(Math.abs(n), d) + NB + "$");
const cls = n => (n > 0 ? "up" : n < 0 ? "down" : "");
const arrow = n => (n > 0 ? "▲" : n < 0 ? "▼" : "■");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dDate = s => { if (!s) return "–"; const d = new Date(s.length <= 10 ? s + "T12:00:00" : s); return isNaN(d) ? esc(s) : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }); };
const dTime = s => { if (!s) return "–"; const d = new Date(s); return isNaN(d) ? esc(s) : d.toLocaleString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " Uhr"; };
const shortTime = s => { const d = new Date(s); return isNaN(d) ? esc(s || "–") : d.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }); };
const daysAgo = s => (s ? (Date.now() - new Date(s.length <= 10 ? s + "T21:00:00Z" : s).getTime()) / 864e5 : Infinity);

// ------------------------------------------------------------------ Kontext-Hilfe
function gloss(id) { return ACAD.glossary.find(g => g.id === id); }
/** kleines "?" das zum Glossar springt */
function help(id, label) {
  const g = gloss(id);
  const t = g ? `${g.term}: ${g.def.replace(/<[^>]+>/g, "")}` : "Im Glossar nachlesen";
  return `<a class="help" href="#glossar/${id}" title="${esc(t)}" aria-label="Erklärung: ${esc(label || (g && g.term) || id)}">?</a>`;
}
/** Begriff mit Erklär-Tooltip (Klick/Tippen) */
function tip(label, id, extra) {
  const g = gloss(id);
  const text = (extra ? extra + " " : "") + (g ? g.def : "");
  return `<button type="button" class="tip-btn" data-tip="${esc(text)}" data-gl="${id}">${label}</button>`;
}
function lessonLink(n, text) {
  const l = ACAD.lessons[n - 1];
  return `<a href="#lernen/${n}">${text || (l ? `Lektion ${n}: ${l.title}` : `Lektion ${n}`)}</a>`;
}

let popEl = null;
function hidePop() { if (popEl) { popEl.remove(); popEl = null; } }
document.addEventListener("click", e => {
  const t = e.target.closest("[data-tip]");
  if (!t) { if (!e.target.closest(".pop")) hidePop(); return; }
  e.preventDefault();
  const same = popEl && popEl.dataset.for === t.dataset.tip;
  hidePop();
  if (same) return;
  popEl = document.createElement("div");
  popEl.className = "pop"; popEl.dataset.for = t.dataset.tip; popEl.setAttribute("role", "tooltip");
  popEl.innerHTML = t.dataset.tip + (t.dataset.gl ? ` <a href="#glossar/${t.dataset.gl}">Mehr im Glossar →</a>` : "");
  document.body.appendChild(popEl);
  const r = t.getBoundingClientRect(), w = popEl.offsetWidth;
  popEl.style.left = Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - w - 8)) + "px";
  popEl.style.top = window.scrollY + r.bottom + 6 + "px";
});
document.addEventListener("keydown", e => { if (e.key === "Escape") hidePop(); });

// ------------------------------------------------------------------ Speicher (Fortschritt, Thema)
const store = {
  get(k, def) { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privat/blockiert: egal */ } },
};
function progress() { return store.get("l200-progress", { read: {}, quiz: {} }); }
function saveProgress(p) { store.set("l200-progress", p); }

// ------------------------------------------------------------------ Thema
function isDark() {
  const t = document.documentElement.dataset.theme;
  if (t) return t === "dark";
  return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
}
document.getElementById("themeBtn").addEventListener("click", () => {
  const next = isDark() ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("l200-theme", next); } catch (e) {}
  render();
});
if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => render());

// ------------------------------------------------------------------ Daten laden
async function getJSON(name, def) {
  try {
    const r = await fetch(`data/${name}?v=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return def;
    const txt = await r.text();
    if (!txt.trim()) return def;
    return JSON.parse(txt);
  } catch (e) { return def; }
}

// ------------------------------------------------------------------ Hilfsrechnungen
const isDemo = s => !!s && /demo/i.test(String(s.data_source || ""));
function signals() { return (D.status && Array.isArray(D.status.signals)) ? D.status.signals : []; }
function positionsMap() { const m = {}; (D.status?.positions || []).forEach(p => (m[p.symbol] = p)); return m; }

/** Nächster geplanter Lauf: Mo–Fr 15:00 UTC (siehe .github/workflows/bot.yml) */
function nextRun(from = new Date()) {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 15, 0, 0));
  for (let i = 0; i < 8; i++) {
    const wd = d.getUTCDay();
    if (wd >= 1 && wd <= 5 && d > from) return d;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return d;
}

/** Rendite seit dem ersten Lauf mit Konto, verglichen mit SPY im selben Zeitraum */
function sinceStart() {
  const h = (D.history || []).filter(x => x && x.equity != null && x.benchmark != null);
  if (h.length < 2) return null;
  const a = h[0], b = h[h.length - 1];
  return { from: a.date, to: b.date, days: h.length, bot: b.equity / a.equity - 1, spy: b.benchmark / a.benchmark - 1 };
}

function targetQuote() { return signals().reduce((s, g) => s + (g.target_weight || 0), 0); }

// ------------------------------------------------------------------ Charts
function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
function destroyCharts() { while (charts.length) { try { charts.pop().destroy(); } catch (e) {} } }
function chartBase({ yFmt = v => fmt(v, 0), xMax = 6, legend = false, tooltipLabel } = {}) {
  const grid = css("--line"), tick = css("--muted");
  return {
    responsive: true, maintainAspectRatio: false, animation: false, normalized: true,
    interaction: { mode: "index", intersect: false },
    elements: { point: { radius: 0, hoverRadius: 4, hitRadius: 8 }, line: { borderWidth: 2, tension: 0 } },
    plugins: {
      legend: { display: legend },
      tooltip: {
        backgroundColor: css("--ink"), titleColor: css("--page"), bodyColor: css("--page"),
        padding: 10, cornerRadius: 8, boxPadding: 4, usePointStyle: true,
        callbacks: tooltipLabel ? { label: tooltipLabel } : {},
      },
    },
    scales: {
      x: { grid: { display: false }, border: { color: css("--line-2") }, ticks: { color: tick, maxTicksLimit: xMax, maxRotation: 0, autoSkip: true } },
      y: { grid: { color: grid }, border: { display: false }, ticks: { color: tick, callback: yFmt, maxTicksLimit: 6 } },
    },
  };
}
function mkChart(canvas, cfg) {
  if (!window.Chart || !canvas) {
    if (canvas) canvas.parentElement.innerHTML = `<div class="nochart">Diagramm konnte nicht geladen werden (Chart.js nicht erreichbar).</div>`;
    return null;
  }
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.color = css("--ink-2");
  const c = new Chart(canvas, cfg);
  charts.push(c);
  return c;
}
const shortDate = s => (s ? `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(2, 4)}` : "");
const monthYear = s => (s ? `${s.slice(5, 7)}/${s.slice(0, 4)}` : "");

// ------------------------------------------------------------------ Ansichten
const VIEWS = {};
const TITLES = { uebersicht: "Übersicht", signale: "Signale", depot: "Depot & Orders", backtest: "Backtest", lernen: "Lernen", glossar: "Glossar", einstellungen: "Einstellungen" };

function banners() {
  const s = D.status, out = [];
  if (!s) {
    out.push(`<div class="banner warn"><span class="ico">⚠️</span><div><b>Noch keine Bot-Daten</b>
      <p>Die Datei <code>status.json</code> fehlt oder ist leer. Starte den Bot einmal unter <a href="${REPO}/actions">Actions</a> → „Bot – täglicher Lauf“ → „Run workflow“.</p></div></div>`);
    return out.join("");
  }
  if (isDemo(s)) out.push(`<div class="banner warn"><span class="ico">🧪</span><div><b>Testdaten – keine echten Kurse, kein echtes Konto</b>
    <p>Diese Bot-Daten stammen aus einem Test mit Zufallszahlen (Quelle: „${esc(s.data_source)}“). Alle Zahlen hier sind erfunden. Sobald der Bot einmal über <a href="${REPO}/actions">Actions</a> läuft, erscheinen deine echten Werte.</p></div></div>`);
  if (s.halted || s.halt_reason) out.push(`<div class="banner danger"><span class="ico">⛔</span><div><b>Not-Aus ${s.halted ? "aktiv – der Bot ist gestoppt" : "– heute keine Trades"}</b>
    <p>${esc(s.halt_reason)} ${help("not-aus")}</p></div></div>`);
  if (s.mode === "nur_signale") out.push(`<div class="banner info"><span class="ico">🔑</span><div><b>Der Bot berechnet nur Signale</b>
    <p>Es sind noch keine Alpaca-Schlüssel hinterlegt, deshalb gibt es kein Depot und keine Orders. So richtest du es ein (Anleitung im <a href="${REPO}#einrichtung-einmalig-ca-15-minuten">README</a>):</p>
    <ol><li>Kostenloses Paper-Konto bei <a href="https://alpaca.markets">alpaca.markets</a> anlegen, auf „Paper“ stellen, API-Key erzeugen.</li>
    <li>In GitHub unter <a href="${REPO}/settings/secrets/actions">Settings → Secrets → Actions</a> die Secrets <code>ALPACA_API_KEY</code> und <code>ALPACA_SECRET_KEY</code> anlegen.</li>
    <li>Unter <a href="${REPO}/actions">Actions</a> den Bot einmal starten.</li></ol></div></div>`);
  if (s.mode === "probelauf") out.push(`<div class="banner info"><span class="ico">👀</span><div><b>Letzter Lauf war ein Probelauf</b>
    <p>Der Bot hat gerechnet, aber keine Orders geschickt. Die automatischen Läufe (Mo–Fr) handeln im Spielgeld-Konto.</p></div></div>`);
  const age = daysAgo(s.updated);
  if (age > 4) out.push(`<div class="banner warn"><span class="ico">⏰</span><div><b>Daten sind ${Math.floor(age)} Tage alt</b>
    <p>Der letzte Lauf war am ${dTime(s.updated)}. Schau unter <a href="${REPO}/actions">Actions</a>, ob der tägliche Lauf fehlgeschlagen ist (rotes Kreuz).</p></div></div>`);
  return out.join("");
}

// ---------- 1) Übersicht
VIEWS.uebersicht = () => {
  const s = D.status;
  const sig = signals();
  const acct = s?.account;
  const nIn = sig.filter(g => g.in_trend).length;
  const tq = targetQuote();
  let html = `<section class="view"><header><h2>Übersicht</h2>
    <p>Was dein Bot gerade tut, auf einen Blick. Alles läuft mit Spielgeld ${help("paper-trading", "Paper Trading")}.</p></header>${banners()}`;

  // Kennzahlen
  const k = [];
  if (acct) {
    const dayAbs = acct.equity - acct.last_equity, dayPct = acct.last_equity ? (acct.equity / acct.last_equity - 1) * 100 : null;
    k.push(kpi("Depotwert", usd(acct.equity), `Cash ${usd(acct.cash)}`, "depotwert"));
    k.push(kpi("Veränderung heute", `<span class="${cls(dayAbs)}">${arrow(dayAbs)} ${usdS(dayAbs)}</span>`, `<span class="${cls(dayPct)}">${pct(dayPct, 2, true)}</span> seit gestern Abend`, "gewinn-verlust"));
  } else {
    k.push(kpi("Depotwert", "–", s?.mode === "nur_signale" ? "Noch kein Konto verbunden" : "Keine Kontodaten", "depotwert"));
    k.push(kpi("Veränderung heute", "–", "Braucht ein verbundenes Konto", "gewinn-verlust"));
  }
  const ss = sinceStart();
  if (ss) {
    const diff = (ss.bot - ss.spy) * 100;
    k.push(kpi("Rendite seit Start", `<span class="${cls(ss.bot)}">${pctD(ss.bot, 2, true)}</span>`,
      `SPY im selben Zeitraum: <span class="${cls(ss.spy)}">${pctD(ss.spy, 2, true)}</span><br>Seit ${dDate(ss.from)} · ${diff >= 0 ? "vorn" : "hinten"} um ${fmt(Math.abs(diff), 2)} Prozentpunkte`, "gesamtrendite"));
  } else {
    k.push(kpi("Rendite seit Start", "–", "Erscheint nach mindestens zwei Läufen mit Konto", "gesamtrendite"));
  }
  let investedNow = null;
  if (acct && acct.equity) investedNow = (s.positions || []).reduce((a, p) => a + (p.value || 0), 0) / acct.equity;
  k.push(kpi("Investitionsquote", investedNow != null ? pctD(investedNow, 1) : pctD(tq, 1),
    investedNow != null ? `Ziel laut Signalen: ${pctD(tq, 1)}` : `Ziel laut Signalen (${nIn} von ${sig.length} ETFs über der Linie)`, "investitionsquote"));
  const halted = s?.halted, haltToday = s && !s.halted && s.halt_reason;
  k.push(kpi("Not-Aus", halted ? `<span class="chip down">⛔ Gestoppt</span>` : haltToday ? `<span class="chip warn">⚠ Heute Pause</span>` : `<span class="chip neutral">✓ Nicht ausgelöst</span>`,
    s ? `Grenzen: ${pct(s.risk?.max_daily_loss_pct, 0)} am Tag, ${pct(s.risk?.max_drawdown_pct, 0)} vom Höchststand` : "–", "not-aus"));
  const nr = nextRun();
  const modeTxt = { handeln: "handelt im Spielgeld-Konto", probelauf: "Probelauf (keine Orders)", nur_signale: "nur Signale" };
  k.push(kpi("Letzter Lauf", s ? dTime(s.updated).replace(/, \d{4}/, "") : "–",
    `${s ? esc(modeTxt[s.mode] || s.mode) + " · Kurse vom " + dDate(s.prices_as_of) : ""}<br>Nächster geplanter Lauf: ${dTime(nr.toISOString())}`, "handelstag", "wide sm"));
  html += `<div class="grid g3 kpis">${k.join("")}</div>`;

  // Verlauf
  html += `<div class="card"><div class="card-head"><h3>Verlauf: Depot vs. SPY ${help("benchmark")}</h3><span class="muted small">Beide auf 100 gesetzt am ersten Tag</span></div>`;
  const hist = (D.history || []).filter(x => x && x.equity != null && x.benchmark != null);
  if (hist.length >= 2) {
    html += `<div class="legend"><span><i style="background:var(--strategy)"></i>Dein Depot (Bot)</span><span><i style="background:var(--bench)"></i>SPY kaufen und halten</span></div>
      <div class="chart-box"><canvas id="cHist" aria-label="Verlauf Depot gegen SPY"></canvas></div>`;
  } else {
    html += `<p class="muted">Die Kurve erscheint, sobald der Bot an mindestens zwei Tagen mit verbundenem Konto gelaufen ist. Jeder Lauf hängt einen Punkt an <code>history.json</code> an.</p>`;
  }
  html += `</div>`;

  // Klartext
  if (sig.length) {
    const near = sig.filter(g => Math.abs(g.distance_pct) < 2);
    html += `<div class="card"><h3>Was der Bot gerade denkt</h3>
      <p>${nIn} von ${sig.length} ETFs liegen über ihrer 200-Tage-Linie ${help("sma")}. Deshalb will der Bot ${pctD(tq, 1)} des Depots investieren und den Rest als Cash halten.
      ${near.length ? `Nahe an der Linie und damit wackelig: <b>${near.map(g => esc(g.symbol)).join(", ")}</b>.` : "Kein ETF liegt gerade gefährlich nah an der Linie."}</p>
      <a class="btn" href="#signale">Alle Signale ansehen →</a></div>`;
  }
  html += `</section>`;
  return {
    html, after() {
      if (hist.length >= 2) {
        const a = hist[0];
        mkChart(document.getElementById("cHist"), {
          type: "line",
          data: {
            labels: hist.map(x => x.date),
            datasets: [
              { label: "Depot", data: hist.map(x => (x.equity / a.equity) * 100), borderColor: css("--strategy"), backgroundColor: css("--strategy") },
              { label: "SPY", data: hist.map(x => (x.benchmark / a.benchmark) * 100), borderColor: css("--bench"), backgroundColor: css("--bench") },
            ],
          },
          options: (() => {
            const o = chartBase({ yFmt: v => fmt(v, 0), tooltipLabel: c => ` ${c.dataset.label}: ${fmt(c.parsed.y, 1)} (${pct(c.parsed.y - 100, 1, true)})` });
            o.scales.x.ticks.callback = function (v) { return shortDate(this.getLabelForValue(v)); };
            o.plugins.tooltip.callbacks.title = it => dDate(it[0].label);
            return o;
          })(),
        });
      }
    },
  };
};
function kpi(label, value, sub, gl, extra = "") {
  return `<div class="card kpi ${extra}"><div class="label">${label} ${gl ? help(gl, label) : ""}</div><div class="value ${extra.includes("sm") ? "sm" : ""}">${value}</div><div class="sub">${sub || ""}</div></div>`;
}

// ---------- 2) Signale
function signalSentence(g, posW) {
  const d = Math.abs(g.distance_pct);
  const where = `${esc(g.symbol)} liegt ${pct(d, 1)} ${g.distance_pct >= 0 ? "über" : "unter"} seiner 200-Tage-Linie`;
  if (g.in_trend) {
    const w = posW ? `der Bot hält ihn mit ${pctD(posW, 1)} des Depots`
      : `der Bot will ihn mit ${pctD(g.target_weight, 1)} des Depots halten${posW === 0 ? " (gekauft wird beim nächsten Lauf mit offener Börse)" : ""}`;
    return `${where} – ${w}.`;
  }
  return `${where} – der Bot hält ihn nicht, dieser Anteil bleibt in Cash.`;
}
VIEWS.signale = () => {
  const sig = signals(), pm = positionsMap();
  let html = `<section class="view"><header><h2>Signale</h2>
    <p>Die Regel ist einfach: Liegt der Schlusskurs über dem Durchschnitt der letzten 200 Handelstage ${help("sma")}, hält der Bot den ETF. Liegt er darunter, verkauft er und parkt das Geld in Cash. Mehr dazu in ${lessonLink(6)}.</p>
    ${D.status ? `<p class="small muted">Kurse vom ${dDate(D.status.prices_as_of)} · Quelle: ${esc(D.status.data_source)}</p>` : ""}</header>${banners()}`;
  if (!sig.length) return { html: html + `<div class="card muted">Noch keine Signale vorhanden.</div></section>` };
  html += `<div class="legend"><span><i style="background:var(--strategy)"></i>Kurs</span><span><i class="dash"></i>200-Tage-Linie</span></div><div class="grid g3">`;
  sig.forEach((g, i) => {
    const near = Math.abs(g.distance_pct) < 2;
    const posW = pm[g.symbol] ? pm[g.symbol].weight : (D.status?.account ? 0 : null);
    html += `<div class="card sig-card ${near ? "near" : ""}">
      <div class="sig-top"><div><div class="sym">${esc(g.symbol)}</div><div class="name">${esc(g.name)}</div></div>
        ${g.in_trend ? `<span class="chip up">▲ Halten</span>` : `<span class="chip down">▼ Cash</span>`}</div>
      <div class="sig-figs">
        <div>Kurs<b>${usd(g.close)}</b></div>
        <div>200-Tage-Linie<b>${usd(g.sma)}</b></div>
        <div>Abstand<b class="${cls(g.distance_pct)}">${pct(g.distance_pct, 1, true)}</b></div>
      </div>
      <div class="mini"><canvas id="mini${i}" aria-label="Kurs und 200-Tage-Linie von ${esc(g.symbol)}"></canvas></div>
      <p class="sig-sentence">${signalSentence(g, g.in_trend ? posW : null)}</p>
      <div class="small muted" style="margin-top:6px">${g.in_trend ? "Über" : "Unter"} der Linie seit ${g.days_in_state} Handelstag${g.days_in_state === 1 ? "" : "en"}${g.days_in_state >= 199 ? " oder länger" : ""}
        · Heute <span class="${cls(g.change_1d_pct)}">${pct(g.change_1d_pct, 2, true)}</span> · 1 Jahr <span class="${cls(g.change_1y_pct)}">${pct(g.change_1y_pct, 1, true)}</span></div>
      ${near ? `<div class="sig-warn"><span class="chip warn">⚠ Nah an der Linie – könnte bald kippen</span>${help("whipsaw")}</div>` : ""}
    </div>`;
  });
  html += `</div></section>`;
  return {
    html, after() {
      sig.forEach((g, i) => {
        const ch = (g.chart || []).filter(x => x && x.p != null);
        if (!ch.length) return;
        const o = chartBase({ yFmt: v => fmt(v, 0), xMax: 3, tooltipLabel: c => ` ${c.dataset.label}: ${usd(c.parsed.y)}` });
        o.scales.x.ticks.callback = function (v) { return monthYear(this.getLabelForValue(v)); };
        o.scales.x.ticks.font = { size: 10 }; o.scales.y.ticks.font = { size: 10 }; o.scales.y.ticks.maxTicksLimit = 3;
        o.plugins.tooltip.callbacks.title = it => dDate(it[0].label);
        o.elements.line.borderWidth = 1.6;
        mkChart(document.getElementById("mini" + i), {
          type: "line",
          data: {
            labels: ch.map(x => x.d),
            datasets: [
              { label: "Kurs", data: ch.map(x => x.p), borderColor: css("--strategy"), backgroundColor: css("--strategy") },
              { label: "200-Tage-Linie", data: ch.map(x => x.a), borderColor: css("--sma"), backgroundColor: css("--sma"), borderDash: [4, 3], borderWidth: 1.5 },
            ],
          },
          options: o,
        });
      });
    },
  };
};

// ---------- 3) Depot & Orders
VIEWS.depot = () => {
  const s = D.status, acct = s?.account, pos = s?.positions || [];
  let html = `<section class="view"><header><h2>Depot &amp; Orders</h2>
    <p>Was im Spielgeld-Depot liegt, was der Bot gekauft und verkauft hat und was er bei jedem Lauf notiert hat.</p></header>${banners()}`;

  html += `<div class="card"><h3>Positionen ${help("position")}</h3>`;
  if (!acct) {
    html += `<p class="muted">Noch kein Konto verbunden – deshalb gibt es keine Positionen.</p>`;
  } else if (!pos.length) {
    html += `<p class="muted">Gerade keine Positionen – alles liegt in Cash (${usd(acct.cash)}).</p>`;
  } else {
    const tv = pos.reduce((a, p) => a + (p.value || 0), 0), tpl = pos.reduce((a, p) => a + (p.pl || 0), 0);
    html += `<div class="table-wrap"><table><thead><tr><th>ETF</th><th class="r hide-sm">Stück</th><th class="r hide-sm">${tip("Einstand", "einstandskurs")}</th><th class="r">Wert</th><th class="r">${tip("Gewinn/Verlust", "gewinn-verlust")}</th><th class="r">Anteil</th></tr></thead><tbody>`;
    pos.forEach(p => {
      html += `<tr><td class="sig-name"><b>${esc(p.symbol)}</b><span class="sub">${esc(signals().find(g => g.symbol === p.symbol)?.name || "")}</span></td>
        <td class="r hide-sm">${fmt(p.qty, p.qty % 1 ? 4 : 0)}</td><td class="r hide-sm">${usd(p.avg_price)}</td><td class="r">${usd(p.value)}</td>
        <td class="r ${cls(p.pl)}">${arrow(p.pl)} ${usdS(p.pl)}<span class="sub">${pct(p.pl_pct, 2, true)}</span></td><td class="r">${pctD(p.weight, 1)}</td></tr>`;
    });
    html += `<tr><td><b>Cash</b></td><td class="hide-sm"></td><td class="hide-sm"></td><td class="r">${usd(acct.cash)}</td><td></td><td class="r">${pctD(acct.equity ? acct.cash / acct.equity : null, 1)}</td></tr>
      <tr><td><b>Summe</b></td><td class="hide-sm"></td><td class="hide-sm"></td><td class="r"><b>${usd(acct.equity)}</b></td><td class="r ${cls(tpl)}"><b>${arrow(tpl)} ${usdS(tpl)}</b></td><td class="r">100,0 %</td></tr>`;
    html += `</tbody></table></div><p class="small muted" style="margin-top:8px">Gewinn/Verlust ist „unrealisiert“: Er steht nur auf dem Papier, solange der Bot nicht verkauft. Positionen zusammen ${usd(tv)}.</p>`;
  }
  html += `</div>`;

  const orders = (D.orders && D.orders.length ? D.orders : s?.orders) || [];
  html += `<div class="card"><h3>Orders ${help("order")}</h3>`;
  if (!orders.length) html += `<p class="muted">Noch keine Orders.</p>`;
  else {
    const label = { KAUF: "Kauf", VERKAUF: "Verkauf", SCHLIESSEN: "Komplett verkauft" };
    html += `<div class="table-wrap"><table><thead><tr><th>Zeit</th><th>Aktion</th><th>ETF</th><th class="r">Betrag</th><th>Status</th></tr></thead><tbody>`;
    orders.slice(0, 100).forEach(o => {
      const st = o.error ? `<span class="chip down">✕ Fehler</span><span class="sub">${esc(o.error)}</span>` : o.sent ? `<span class="chip neutral">✓ gesendet</span>` : `<span class="chip neutral">nur geplant</span>`;
      html += `<tr><td>${shortTime(o.time)}</td><td>${o.action === "KAUF" ? "＋" : "−"} ${label[o.action] || esc(o.action)}</td><td><b>${esc(o.symbol)}</b></td><td class="r">${usd(o.usd)}</td><td>${st}</td></tr>`;
    });
    html += `</tbody></table></div>${orders.length > 100 ? `<p class="small muted">Die neuesten 100 von ${orders.length} Orders.</p>` : ""}
      <p class="small muted" style="margin-top:8px">Der Bot schickt ${tip("Market-Orders", "market-order")} über einen Dollar-Betrag. Alpaca führt sie zum aktuellen Kurs aus; der genaue Preis steht im Alpaca-Konto.</p>`;
  }
  html += `</div>`;

  const runs = D.runs || [];
  html += `<div class="card"><h3>Lauf-Protokoll</h3>`;
  if (!runs.length) html += `<p class="muted">Noch keine Läufe protokolliert.</p>`;
  else {
    const modeTxt = { handeln: "Handeln", probelauf: "Probelauf", nur_signale: "Nur Signale" };
    runs.forEach((r, i) => {
      const log = r.log || [];
      const warn = log.some(l => l.level === "warn" || l.level === "error");
      html += `<details ${i === 0 ? "open" : ""}><summary><b>${dTime(r.time)}</b> <span class="chip neutral">${esc(modeTxt[r.mode] || r.mode)}</span>${warn ? ` <span class="chip warn">⚠ Hinweise</span>` : ""}</summary>
        <ul class="log">${log.map(l => `<li><span class="lvl ${esc(l.level)}">${{ info: "Info", warn: "Warnung", error: "Fehler" }[l.level] || esc(l.level)}</span><span>${esc(l.msg)}</span></li>`).join("")}</ul></details>`;
    });
  }
  html += `</div></section>`;
  return { html };
};

// ---------- 4) Backtest
const METRICS = [
  ["cagr", "Rendite pro Jahr", "cagr", x => pctD(x, 1, true)],
  ["total", "Gesamtrendite", "gesamtrendite", x => pctD(x, 0, true)],
  ["volatility", "Schwankung (Volatilität)", "volatilitaet", x => pctD(x, 1)],
  ["max_drawdown", "Größter Absturz (Max. Drawdown)", "drawdown", x => pctD(x, 1, true)],
  ["sharpe", "Sharpe-Ratio", "sharpe", x => fmt(x, 2)],
  ["best_year", "Bestes Jahr", "rendite", x => pctD(x, 1, true)],
  ["worst_year", "Schlechtestes Jahr", "rendite", x => pctD(x, 1, true)],
  ["avg_invested", "Ø investiert", "investitionsquote", x => pctD(x, 0)],
  ["trades_per_year", "Tage mit Umschichtung pro Jahr", "rebalancing", x => fmt(x, 0)],
];
function backtestVerdict(b) {
  const P = b.periods || [], g = P.find(p => /gesamt/i.test(p.label)) || P[0];
  if (!g) return "";
  const s = g.strategy, m = g.benchmark, out = [];
  const better = (a, c) => (a > c ? "besser" : "schlechter");
  out.push(`<li><b>Rendite:</b> Die Strategie brachte ${pctD(s.cagr, 1)} pro Jahr, SPY kaufen und halten ${pctD(m.cagr, 1)}. Aus ${usd(b.start_capital, 0)} wurden ${usd(b.end_value?.strategy, 0)} statt ${usd(b.end_value?.benchmark, 0)}. ${s.cagr < m.cagr ? "Bei der reinen Rendite war einfaches Halten also <b>klar besser</b>." : "Bei der Rendite lag die Strategie vorn – das ist für Trendfolge eher ungewöhnlich, also nicht zu viel hineinlesen."}</li>`);
  out.push(`<li><b>Risiko:</b> Der größte Absturz lag bei ${pctD(s.max_drawdown, 1)} statt ${pctD(m.max_drawdown, 1)}, die Schwankung bei ${pctD(s.volatility, 1)} statt ${pctD(m.volatility, 1)}. ${Math.abs(s.max_drawdown) < Math.abs(m.max_drawdown) ? "Hier spielt die Regel ihre Stärke aus: In Crashs ist sie größtenteils in Cash." : "Die Regel hat hier nicht vor großen Verlusten geschützt."}</li>`);
  out.push(`<li><b>Rendite pro Risiko:</b> Die Sharpe-Ratio ist ${better(s.sharpe, m.sharpe)} (${fmt(s.sharpe, 2)} gegen ${fmt(m.sharpe, 2)}). ${s.avg_invested != null ? `Ein Grund: Im Schnitt war nur ${pctD(s.avg_invested, 0)} des Geldes investiert – Cash schwankt nicht, bringt aber auch nichts.` : ""}</li>`);
  const crises = (b.yearly || []).filter(y => y.benchmark < -0.1);
  if (crises.length) out.push(`<li><b>Schlechte Börsenjahre:</b> ${crises.map(y => `${y.year}: SPY ${pctD(y.benchmark, 1, true)}, Strategie ${pctD(y.strategy, 1, true)}`).join("; ")}.</li>`);
  const subs = P.filter(p => p !== g);
  if (subs.length === 2) {
    const both = subs.every(p => p.strategy.cagr < p.benchmark.cagr), none = subs.every(p => p.strategy.cagr > p.benchmark.cagr);
    out.push(`<li><b>Beide Teilzeiträume:</b> ${both ? "In beiden Hälften war die Rendite niedriger als bei SPY – das Ergebnis ist also kein Zufall eines bestimmten Zeitraums." : none ? "In beiden Hälften war die Rendite höher als bei SPY." : "Die Hälften widersprechen sich – das Ergebnis hängt stark vom Zeitraum ab und ist damit wackelig."} ${help("overfitting")}</li>`);
  }
  out.push(`<li><b>Ehrlich gesagt:</b> Die Regel ist eher ein Sicherheitsgurt als ein Turbo. Ob es in Zukunft so kommt, weiß niemand; ein Backtest zeigt nur, wie die Regel in der Vergangenheit gewirkt hätte. Mehr in ${lessonLink(7)} und ${lessonLink(11)}.</li>`);
  return `<ul style="padding-left:20px;margin:0">${out.join("")}</ul>`;
}
let btLog = false;
VIEWS.backtest = () => {
  const b = D.backtest;
  let html = `<section class="view"><header><h2>Backtest</h2>
    <p>Wie hätte die Regel seit ${b?.periods?.[0] ? dDate(b.periods[0].from).slice(-4) : "2005"} abgeschnitten? Gerechnet mit Kosten (${b?.params?.cost_bps ?? "–"} Basispunkte ${help("basispunkt")} je Handel) und ohne Blick in die Zukunft: Signal heute, Handel morgen. ${help("backtest")}</p></header>`;
  if (!b || !b.periods) return { html: html + `<div class="banner warn"><span class="ico">⚠️</span><div><b>Noch kein Backtest</b><p>Starte unter <a href="${REPO}/actions">Actions</a> den Workflow „Backtest“.</p></div></div></section>` };
  if (b.demo) html += `<div class="banner warn"><span class="ico">🧪</span><div><b>Demo-Backtest mit Zufallskursen</b><p>Diese Zahlen sind erfunden und sagen nichts über die echte Strategie. Der echte Backtest läuft jeden Sonntag automatisch.</p></div></div>`;
  html += `<p class="small muted">Erstellt ${dTime(b.generated)} · Daten: ${esc(b.data_source)} · ${esc((b.symbols || []).join(", "))} · Vergleich: ${esc(b.benchmark)} kaufen und halten</p>`;

  html += `<div class="card"><div class="card-head"><h3>Depotwert aus ${usd(b.start_capital, 0)}</h3>
    <div class="seg" role="group" aria-label="Skala"><button type="button" data-scale="lin" aria-pressed="${!btLog}">Normal</button><button type="button" data-scale="log" aria-pressed="${btLog}">Logarithmisch</button></div></div>
    <div class="legend"><span><i style="background:var(--strategy)"></i>Strategie (Bot-Regel): ${usd(b.end_value?.strategy, 0)}</span><span><i style="background:var(--bench)"></i>${esc(b.benchmark)} kaufen und halten: ${usd(b.end_value?.benchmark, 0)}</span></div>
    <div class="chart-box tall"><canvas id="cCurve" aria-label="Depotwert Strategie gegen SPY"></canvas></div>
    <p class="small muted" style="margin-top:8px">Logarithmisch: Gleiche Prozent-Schritte sind gleich hoch. So sieht man frühe Jahre und Crashs besser. ${help("log-skala")}</p></div>`;

  html += `<div class="grid g2"><div class="card"><h3>Abstand vom Höchststand ${help("drawdown")}</h3>
    <div class="legend"><span><i style="background:var(--strategy)"></i>Strategie</span><span><i style="background:var(--bench)"></i>${esc(b.benchmark)}</span></div>
    <div class="chart-box"><canvas id="cDD" aria-label="Drawdown"></canvas></div></div>
    <div class="card"><h3>Rendite je Jahr ${help("rendite")}</h3>
    <div class="legend"><span><i style="background:var(--strategy)"></i>Strategie</span><span><i style="background:var(--bench)"></i>${esc(b.benchmark)}</span></div>
    <div class="chart-box"><canvas id="cYear" aria-label="Jahresrenditen"></canvas></div></div></div>`;

  html += `<div class="card"><h3>Kennzahlen</h3><p class="small muted">Tippe auf eine Kennzahl für die Erklärung. „Erste 70 %“ und „Letzte 30 %“ teilen den Zeitraum: Hält das Ergebnis in beiden Hälften, ist es robuster.</p><div class="grid g3">`;
  (b.periods || []).forEach(p => {
    html += `<div><h4 style="margin:6px 0 2px">${esc(p.label)}</h4><div class="small muted">${dDate(p.from)} – ${dDate(p.to)}</div>
      <div class="table-wrap"><table><thead><tr><th>Kennzahl</th><th class="r">Strategie</th><th class="r">${esc(b.benchmark)}</th></tr></thead><tbody>`;
    METRICS.forEach(([key, label, gl, f]) => {
      const sv = p.strategy?.[key], bv = p.benchmark?.[key];
      if (sv == null && bv == null) return;
      html += `<tr><td>${tip(label, gl)}</td><td class="r">${f(sv)}</td><td class="r">${bv == null ? "–" : f(bv)}</td></tr>`;
    });
    html += `</tbody></table></div></div>`;
  });
  html += `</div></div>`;

  html += `<div class="card"><h3>Ehrliche Einordnung</h3>${backtestVerdict(b)}</div></section>`;
  return {
    html, after() {
      const curve = b.curve || [];
      const lab = curve.map(c => c.d);
      const xTick = function (v) { return this.getLabelForValue(v).slice(0, 4); };
      const o1 = chartBase({ yFmt: v => fmt(v, 0) + NB + "$", xMax: 8, tooltipLabel: c => ` ${c.dataset.label}: ${usd(c.parsed.y, 0)}` });
      o1.scales.x.ticks.callback = xTick; o1.plugins.tooltip.callbacks.title = it => dDate(it[0].label);
      o1.scales.y.type = btLog ? "logarithmic" : "linear";
      o1.elements.line.borderWidth = 1.8;
      const cc = mkChart(document.getElementById("cCurve"), {
        type: "line",
        data: { labels: lab, datasets: [
          { label: "Strategie", data: curve.map(c => c.s), borderColor: css("--strategy"), backgroundColor: css("--strategy") },
          { label: b.benchmark, data: curve.map(c => c.b), borderColor: css("--bench"), backgroundColor: css("--bench") },
        ] },
        options: o1,
      });
      document.querySelectorAll("[data-scale]").forEach(btn => btn.addEventListener("click", () => {
        btLog = btn.dataset.scale === "log";
        document.querySelectorAll("[data-scale]").forEach(x => x.setAttribute("aria-pressed", String(x === btn)));
        if (cc) { cc.options.scales.y.type = btLog ? "logarithmic" : "linear"; cc.update(); }
      }));
      const o2 = chartBase({ yFmt: v => fmt(v * 100, 0) + NB + "%", xMax: 6, tooltipLabel: c => ` ${c.dataset.label}: ${pctD(c.parsed.y, 1)}` });
      o2.scales.x.ticks.callback = xTick; o2.plugins.tooltip.callbacks.title = it => dDate(it[0].label);
      o2.elements.line.borderWidth = 1.5;
      mkChart(document.getElementById("cDD"), {
        type: "line",
        data: { labels: lab, datasets: [
          { label: "Strategie", data: curve.map(c => c.dds), borderColor: css("--strategy"), backgroundColor: css("--strategy") },
          { label: b.benchmark, data: curve.map(c => c.ddb), borderColor: css("--bench"), backgroundColor: css("--bench") },
        ] },
        options: o2,
      });
      const y = b.yearly || [];
      const o3 = chartBase({ yFmt: v => fmt(v * 100, 0) + NB + "%", xMax: 12, tooltipLabel: c => ` ${c.dataset.label}: ${pctD(c.parsed.y, 1, true)}` });
      o3.interaction = { mode: "index", intersect: false };
      mkChart(document.getElementById("cYear"), {
        type: "bar",
        data: { labels: y.map(r => String(r.year)), datasets: [
          { label: "Strategie", data: y.map(r => r.strategy), backgroundColor: css("--strategy"), borderRadius: 3, categoryPercentage: 0.8, barPercentage: 0.9 },
          { label: b.benchmark, data: y.map(r => r.benchmark), backgroundColor: css("--bench"), borderRadius: 3, categoryPercentage: 0.8, barPercentage: 0.9 },
        ] },
        options: o3,
      });
    },
  };
};

// ---------- 5) Lernen
VIEWS.lernen = arg => {
  if (arg === "test") return quizView("test");
  const n = parseInt(arg, 10);
  if (n >= 1 && n <= ACAD.lessons.length) return lessonView(n);
  const p = progress(), L = ACAD.lessons;
  const done = L.filter((_, i) => p.read[i + 1]).length;
  let html = `<section class="view"><header><h2>Akademie</h2>
    <p>${L.length} kurze Lektionen, jede 3–6 Minuten. Sie bauen aufeinander auf und benutzen, wo es geht, die echten Zahlen deines Bots. Nach jeder Lektion gibt es ein kleines Quiz.</p></header>
    <div class="card"><div class="card-head"><h3>Dein Fortschritt</h3><span class="muted small">${done} von ${L.length} Lektionen gelesen</span></div>
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${L.length}" aria-valuenow="${done}"><div style="width:${(done / Math.max(1, L.length)) * 100}%"></div></div>
    ${p.quiz.test != null ? `<p class="small" style="margin-top:8px">Abschlusstest: ${p.quiz.test} von ${ACAD.finalQuiz.length} richtig.</p>` : ""}</div>
    <div class="card"><ol class="lesson-list">`;
  L.forEach((l, i) => {
    const n = i + 1, read = p.read[n], q = p.quiz[n];
    html += `<li class="${read ? "done" : ""}"><a href="#lernen/${n}"><span class="n">${read ? "✓" : n}</span><span class="t">${esc(l.title)}<small>${l.minutes} Min. Lesezeit${q != null ? ` · Quiz ${q}/${l.quiz.length}` : ""}${read ? " · gelesen" : ""}</small></span><span aria-hidden="true">›</span></a></li>`;
  });
  html += `<li><a href="#lernen/test"><span class="n">★</span><span class="t">Abschlusstest<small>${ACAD.finalQuiz.length} Fragen quer durch alle Lektionen</small></span><span aria-hidden="true">›</span></a></li>`;
  html += `</ol></div>
    <div class="card"><h3>Nachschlagen</h3><p>Ein Begriff ist unklar? Im <a href="#glossar">Glossar</a> stehen ${ACAD.glossary.length} Begriffe in einfachen Worten. Überall im Dashboard führen dich die kleinen <span class="help" aria-hidden="true">?</span>-Symbole direkt hin.</p></div>
    <p class="small muted">Dein Fortschritt wird nur in diesem Browser gespeichert. <button type="button" class="tip-btn" id="resetProg">Fortschritt zurücksetzen</button></p></section>`;
  return {
    html, after() {
      document.getElementById("resetProg")?.addEventListener("click", () => {
        if (confirm("Fortschritt und Quiz-Ergebnisse in diesem Browser löschen?")) { saveProgress({ read: {}, quiz: {} }); render(); }
      });
    },
  };
};

/** Live-Kontext für Lektionen: echte Bot-Zahlen, sicher verpackt */
function lessonCtx() {
  const s = D.status, b = D.backtest;
  const per = l => (b?.periods || []).find(p => p.label === l);
  return {
    status: s, backtest: b, signals: signals(), fmt, pct, pctD, usd, esc, dDate, help, lessonLink, gloss: id => `#glossar/${id}`,
    sig: sym => signals().find(g => g.symbol === sym),
    period: per, demo: isDemo(s), btDemo: !!b?.demo,
    targetQuote: targetQuote(),
    live(title, fn) {
      try {
        const inner = fn();
        if (!inner) return "";
        return `<div class="live"><span class="tag">Aus deinem Bot · ${esc(title)}</span>${inner}${isDemo(s) ? `<div class="small muted" style="margin-top:6px">Hinweis: Die Bot-Daten sind gerade noch Testdaten.</div>` : ""}</div>`;
      } catch (e) { return ""; }
    },
  };
}
function lessonView(n) {
  const L = ACAD.lessons, l = L[n - 1], p = progress();
  let body = "";
  try { body = l.body(lessonCtx()); } catch (e) { body = `<p class="muted">Diese Lektion konnte nicht geladen werden.</p>`; }
  const html = `<section class="view"><article class="lesson">
    <a href="#lernen" class="small">← Alle Lektionen</a>
    <div class="small muted" style="margin-top:12px">Lektion ${n} von ${L.length} · ${l.minutes} Min. Lesezeit</div>
    <h2>${esc(l.title)}</h2>
    ${body}
    <div class="merke"><b>Merke</b><ul>${l.merke.map(m => `<li>${m}</li>`).join("")}</ul></div>
    <h3>Quiz zu Lektion ${n}</h3>
    <div class="quiz" id="quiz"></div>
    <div class="lesson-nav">
      ${n > 1 ? `<a class="btn" href="#lernen/${n - 1}">← ${n - 1}. ${esc(L[n - 2].title)}</a>` : `<span></span>`}
      <button type="button" class="btn ${p.read[n] ? "" : "primary"}" id="markRead">${p.read[n] ? "✓ Gelesen" : "Als gelesen markieren"}</button>
      ${n < L.length ? `<a class="btn" href="#lernen/${n + 1}">${n + 1}. ${esc(L[n].title)} →</a>` : `<a class="btn" href="#lernen/test">Zum Abschlusstest →</a>`}
    </div></article></section>`;
  return {
    html, after() {
      mountQuiz(document.getElementById("quiz"), l.quiz, n);
      document.getElementById("markRead").addEventListener("click", e => {
        const q = progress(); q.read[n] = !q.read[n]; saveProgress(q);
        e.target.textContent = q.read[n] ? "✓ Gelesen" : "Als gelesen markieren";
        e.target.classList.toggle("primary", !q.read[n]);
      });
    },
  };
}
function quizView() {
  const html = `<section class="view"><article class="lesson"><a href="#lernen" class="small">← Alle Lektionen</a>
    <h2 style="margin-top:12px">Abschlusstest</h2>
    <p>${ACAD.finalQuiz.length} Fragen quer durch alle Lektionen. Nach jeder Antwort siehst du, warum sie richtig oder falsch ist. Es geht ums Verstehen, nicht um Noten.</p>
    <div class="quiz" id="quiz"></div></article></section>`;
  return { html, after() { mountQuiz(document.getElementById("quiz"), ACAD.finalQuiz, "test"); } };
}
function mountQuiz(el, questions, key) {
  let answered = 0, right = 0;
  el.innerHTML = questions.map((q, qi) => `<div class="q" data-q="${qi}"><b>${qi + 1}. ${q.q}</b><div class="opts">${q.a.map((a, ai) => `<button type="button" class="opt" data-a="${ai}"><span aria-hidden="true">${String.fromCharCode(65 + ai)}</span><span>${a}</span></button>`).join("")}</div></div>`).join("") + `<div class="score" aria-live="polite"></div>`;
  el.addEventListener("click", e => {
    const btn = e.target.closest(".opt"); if (!btn || btn.disabled) return;
    const qd = btn.closest(".q"), q = questions[+qd.dataset.q], ai = +btn.dataset.a;
    qd.querySelectorAll(".opt").forEach(b => {
      b.disabled = true;
      if (+b.dataset.a === q.c) { b.classList.add("right"); b.querySelector("span").textContent = "✓"; }
      else if (b === btn) { b.classList.add("wrong"); b.querySelector("span").textContent = "✕"; }
    });
    const ok = ai === q.c; answered++; if (ok) right++;
    qd.insertAdjacentHTML("beforeend", `<div class="why"><b>${ok ? "Richtig." : "Nicht ganz."}</b> ${q.why}</div>`);
    if (answered === questions.length) {
      el.querySelector(".score").textContent = `Ergebnis: ${right} von ${questions.length} richtig.${right === questions.length ? " Stark!" : ""}`;
      const p = progress(); p.quiz[key] = right; if (key !== "test") p.read[key] = true; saveProgress(p);
      const mr = document.getElementById("markRead"); if (mr) { mr.textContent = "✓ Gelesen"; mr.classList.remove("primary"); }
    }
  });
}

// ---------- Glossar
VIEWS.glossar = arg => {
  const G = [...ACAD.glossary].sort((a, b) => a.term.localeCompare(b.term, "de"));
  let html = `<section class="view"><header><h2>Glossar</h2><p>${G.length} Begriffe rund um Börse, Bot und Risiko – in einfachen Worten.</p></header>
    <input type="search" class="gloss-search" id="gq" placeholder="Begriff suchen, z. B. Drawdown oder ETF" aria-label="Glossar durchsuchen" autocomplete="off">
    <div class="card"><dl id="glist" style="margin:0">`;
  G.forEach(g => {
    html += `<div class="gloss-item" id="g-${g.id}" data-s="${esc((g.term + " " + (g.alt || "") + " " + g.def).toLowerCase())}"><dt>${esc(g.term)}${g.alt ? ` <span class="muted small">(${esc(g.alt)})</span>` : ""}</dt>
      <dd>${g.def}${g.lesson ? ` ${lessonLink(g.lesson, `→ Lektion ${g.lesson}`)}` : ""}</dd></div>`;
  });
  html += `</dl><p id="gnone" class="muted hidden">Kein Treffer.</p></div></section>`;
  return {
    html, after() {
      const q = document.getElementById("gq");
      q.addEventListener("input", () => {
        const v = q.value.trim().toLowerCase(); let n = 0;
        document.querySelectorAll(".gloss-item").forEach(it => { const show = !v || it.dataset.s.includes(v); it.classList.toggle("hidden", !show); n += show; });
        document.getElementById("gnone").classList.toggle("hidden", n > 0);
      });
      if (arg) {
        const it = document.getElementById("g-" + arg);
        if (it) { it.classList.add("flash"); setTimeout(() => it.scrollIntoView({ block: "center" }), 30); }
      }
    },
  };
};

// ---------- 6) Einstellungen erklärt
VIEWS.einstellungen = () => {
  const s = D.status, st = s?.strategy || {}, r = s?.risk || {}, bp = D.backtest?.params || {};
  const n = signals().length || 8;
  const per = st.max_weight_per_symbol != null && st.max_invested != null ? Math.min(st.max_weight_per_symbol, st.max_invested / n) : null;
  const eq = s?.account?.equity;
  const ex = eq ? ` Bei deinem Depot von ${usd(eq, 0)} sind das ${usd(eq * (per ?? 0), 0)} je ETF.` : ` Bei 100.000 $ Spielgeld wären das ${usd(100000 * (per ?? 0), 0)} je ETF.`;
  const row = (k, v, path, d, gl) => `<div class="setting"><div class="k">${k} ${gl ? help(gl, k) : ""}</div><div class="v">${v}</div><div class="d">${d}<br><code>${path}</code></div></div>`;
  let html = `<section class="view"><header><h2>Einstellungen erklärt</h2>
    <p>So ist dein Bot gerade eingestellt (gelesen aus dem letzten Lauf). Ändern kannst du alles in <code>config.yaml</code> auf GitHub.</p></header>`;
  if (!s) html += banners();
  html += `<div class="card"><h3>Strategie</h3>
    ${row("Länge des Durchschnitts", st.sma_days != null ? `${st.sma_days} Tage` : "–", "strategy.sma_days", `Der Bot vergleicht den Kurs mit dem Durchschnitt der letzten ${st.sma_days ?? "…"} Handelstage (ungefähr ${st.sma_days ? fmt(st.sma_days / 21, 0) : "…"} Monate). Kürzer = reagiert schneller, aber mehr Fehlsignale und Kosten. Länger = ruhiger, aber später.`, "sma")}
    ${row("Höchstanteil je ETF", pctD(st.max_weight_per_symbol, 1), "strategy.max_weight_per_symbol", `Kein ETF bekommt mehr als diesen Anteil vom Depot. Tatsächlich bekommt jeder ETF ${pctD(per, 2)} (${pctD(st.max_invested, 0)} verteilt auf ${n} ETFs).${ex}`, "positionsgroesse")}
    ${row("Höchstens investiert", pctD(st.max_invested, 0), "strategy.max_invested", `Selbst wenn alle ETFs über ihrer Linie liegen, bleiben mindestens ${pctD(st.max_invested != null ? 1 - st.max_invested : null, 0)} als Puffer in Cash – für Kursschwankungen zwischen Signal und Ausführung.`, "investitionsquote")}
    </div>
    <div class="card"><h3>Risiko und Not-Aus</h3>
    ${row("Tagesverlust-Grenze", pct(r.max_daily_loss_pct, 1), "risk.max_daily_loss_pct", `Ist das Depot seit gestern Abend um mehr als ${pct(r.max_daily_loss_pct, 1)} gefallen, macht der Bot an diesem Tag gar nichts. So verkauft er nicht panisch an einem Crash-Tag.${eq ? ` Bei ${usd(eq, 0)} wären das ${usd(eq * r.max_daily_loss_pct / 100, 0)} Verlust an einem Tag.` : ""}`, "not-aus")}
    ${row("Gesamtverlust-Grenze", pct(r.max_drawdown_pct, 1), "risk.max_drawdown_pct", `Fällt das Depot mehr als ${pct(r.max_drawdown_pct, 1)} unter seinen bisherigen Höchststand, stoppt der Bot komplett. Wieder einschalten: die Datei <code>bot/state.json</code> auf GitHub löschen. Das zwingt dich, bewusst hinzuschauen.`, "drawdown")}
    ${row("Kleinste Umschichtung", usd(r.min_trade_usd, 0), "risk.min_trade_usd", `Änderungen unter diesem Betrag ignoriert der Bot. Sonst würde er täglich winzige Beträge hin- und herschieben und dabei Kosten erzeugen.`, "rebalancing")}
    </div>
    <div class="card"><h3>Backtest</h3>
    ${row("Handelskosten", bp.cost_bps != null ? `${bp.cost_bps} Basispunkte` : "–", "backtest.cost_bps", `Pro Kauf oder Verkauf zieht der Backtest ${bp.cost_bps != null ? pct(bp.cost_bps / 100, 2) : "…"} ab – für Spread und schlechtere Ausführung. Ehrlicher als „kostenlos“.`, "spread")}
    ${row("Startkapital", usd(D.backtest?.start_capital, 0), "backtest.start_capital", `Nur für die Darstellung: Mit welchem Betrag der Backtest rechnet. Ändert nichts an den Prozenten.`, "backtest")}
    </div>
    <div class="card"><h3>Ändern</h3>
      <p>Öffne <a href="${REPO}/edit/main/config.yaml">config.yaml auf GitHub</a> → Stift-Symbol → Wert ändern → „Commit changes“. Der Backtest rechnet danach automatisch neu.</p>
      <p class="small muted">Bitte nicht so lange an Zahlen drehen, bis der Backtest schön aussieht – das ist Overfitting ${help("overfitting")}. Eine gute Einstellung muss in beiden Teilzeiträumen (erste 70 %, letzte 30 %) vernünftig aussehen.</p></div></section>`;
  return { html };
};

// ------------------------------------------------------------------ Router
function parseHash() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
  const [view, arg] = h.split("/");
  return { view: VIEWS[view] ? view : "uebersicht", arg };
}
let lastView = null;
function render() {
  hidePop();
  destroyCharts();
  const { view, arg } = parseHash();
  document.querySelectorAll("nav.tabs a").forEach(a => {
    if (a.getAttribute("href") === "#" + view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  document.title = `${TITLES[view]} · Linie 200`;
  let res;
  try { res = VIEWS[view](arg); } catch (e) {
    console.error(e);
    res = { html: `<div class="banner danger"><span class="ico">⚠️</span><div><b>Hier ist etwas schiefgelaufen</b><p>${esc(e.message)}</p></div></div>` };
  }
  const app = document.getElementById("app");
  app.innerHTML = res.html;
  try { res.after && res.after(); } catch (e) { console.error(e); }
  const key = view + "/" + (arg || "");
  if (key !== lastView && !(view === "glossar" && arg)) window.scrollTo(0, 0);
  lastView = key;
  const active = document.querySelector('nav.tabs a[aria-current="page"]');
  if (active) active.scrollIntoView({ block: "nearest", inline: "nearest" });
}
window.addEventListener("hashchange", render);

(async function init() {
  const [status, history, orders, runs, backtest] = await Promise.all([
    getJSON("status.json", null), getJSON("history.json", []), getJSON("orders.json", []), getJSON("runs.json", []), getJSON("backtest.json", null),
  ]);
  D.status = status && typeof status === "object" && !Array.isArray(status) ? status : null;
  D.history = Array.isArray(history) ? history : [];
  D.orders = Array.isArray(orders) ? orders : [];
  D.runs = Array.isArray(runs) ? runs : [];
  D.backtest = backtest && typeof backtest === "object" ? backtest : null;
  render();
})();
