/* Crypto King: Demo tab — Journal 2 (leg-one) + Pyramid (Journal 3).
 * Reads journal.json / pyramid_journal.json. Live prices from Binance Spot public data.
 * No real holdings, balances or exchange-account data are ever in these files.
 */
(function () {
  "use strict";
  var VIEW = document.getElementById("view-demo");
  if (!VIEW) return;
  var LWC_SRC = "https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.7/dist/lightweight-charts.standalone.production.js";
  var LWC_SRI = "sha384-ubOX1hTMs7Y0lb1Ef6IUeWP35f2rF+tjtm2zr4f2f4fL0pyOiPKnR5FIWhl8Q+ik";
  var HOSTS = ["https://api.binance.com", "https://data-api.binance.vision"];
  var REFRESH_MS = 60000, JOURNAL_MS = 300000;
  var hostIdx = 0, J = null, started = false, chart = null, live = {}, lastLive = null, busy = false;
  var which = "j2"; // "j2" | "pyramid"
  var SOURCES = {
    j2: { file: "journal.json", title: "Journal 2 · leg-one",
      hint: "Every qualifying 1h setup under the leg-one rules · live Binance Spot prices",
      openTitle: "Open positions", openHint: "Unrealised P&L at live price",
      closedTitle: "Closed trades",
      footer: "Journal 2: £500 start, 4% risk per trade, 0.1% fee per fill, stop-limit fills modelled at the limit or worse. Not financial advice." },
    pyramid: { file: "pyramid_journal.json", title: "Pyramid · Journal 3",
      hint: "Same 1h/4h entry trigger · Tom-style scale-in at +1R…+4R with a rising shared stop",
      openTitle: "Open pyramids", openHint: "Entries filled · shared stop · next add",
      closedTitle: "Closed pyramids",
      footer: "Pyramid: £500 start, 4% risk on Entry1 (original 1R), adds at ½ size, shared stop rises before each add, 0.1% fee per fill. Not financial advice." }
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function isNum(x) { return typeof x === "number" && isFinite(x); }
  function dec(p) { var a = Math.abs(p); return a >= 1000 ? 2 : a >= 100 ? 2 : a >= 1 ? 3 : a >= 0.01 ? 4 : 8; }
  function fmtP(p) {
    if (!isNum(p)) return "—";
    var raw = (String(p).split(".")[1] || "").length, d = dec(p);
    return "$" + p.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: Math.min(8, Math.max(d, raw)) });
  }
  function money(v, sym) { return isNum(v) ? (v < 0 ? "−" : "") + sym + Math.abs(v).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"; }
  function pct(n, d) { if (!isNum(n)) return "—"; d = d == null ? 2 : d; return (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(d) + "%"; }
  function rr(n) { return isNum(n) ? (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(2) + "R" : "—"; }
  function cls(n) { return !isNum(n) ? "dj-flat" : n > 0.0001 ? "dj-up" : n < -0.0001 ? "dj-down" : "dj-flat"; }
  function mark(n) { return !isNum(n) ? "" : n > 0.0001 ? "🟢📈 " : n < -0.0001 ? "🔴📉 " : "⚪ "; }
  function ukT(iso, withDate) {
    if (!iso) return "—";
    var o = { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false };
    if (withDate) { o.day = "numeric"; o.month = "short"; }
    return new Date(iso).toLocaleString("en-GB", o);
  }
  function q(v) {
    if (!isNum(v)) return "—";
    return String(v).replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
  }

  function bget(path) {
    var i = hostIdx, lastErr = null;
    function attempt() {
      if (i >= HOSTS.length) return Promise.reject(lastErr || new Error("Binance unreachable"));
      var host = HOSTS[i];
      return fetch(host + path, { cache: "no-store" }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }).then(function (j) { hostIdx = i; return j; }, function (e) { lastErr = e; i++; return attempt(); });
    }
    return attempt();
  }

  function applyLabels() {
    var src = SOURCES[which];
    var title = $("dj-title"); if (title) title.textContent = src.title;
    var hint = $("djHint"); if (hint) hint.textContent = src.hint;
    var ot = $("djOpenTitle"); if (ot) ot.textContent = src.openTitle;
    var oh = $("djOpenHint"); if (oh) oh.textContent = src.openHint;
    var ct = $("djClosedTitle"); if (ct) ct.textContent = src.closedTitle;
    var fn = $("djFooterNote"); if (fn) fn.textContent = src.footer;
    document.querySelectorAll(".dj-sw").forEach(function (b) {
      var on = b.getAttribute("data-journal") === which;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function stat(label, value, sub, extra) {
    return '<div class="dj-stat' + (extra || "") + '"><div class="l">' + esc(label) + '</div><div class="v">' + value + "</div>" + (sub ? '<div class="s">' + sub + "</div>" : "") + "</div>";
  }
  function liveEquity() {
    var s = J.summary, fx = s.fx_gbp_usd || J.start.fx_gbp_usd, eq = s.equity_usdt;
    (J.open || []).forEach(function (p) {
      var px = live[p.symbol];
      var units = isNum(p.units) ? p.units : (isNum(p.qty_open) ? p.qty_open : null);
      if (p.status !== "pending" && isNum(px) && isNum(p.last_price) && isNum(units)) eq += units * (px - p.last_price);
    });
    return { usdt: eq, gbp: eq / fx };
  }
  function renderHeader() {
    var s = J.summary, st = J.start, t = s.today || {}, eq = liveEquity();
    var since = s.since_start_pct;
    var todaySub = which === "pyramid"
      ? (t.closed || 0) + " closed · " + rr(t.R || 0) + (t.adds ? " · " + t.adds + " adds" : "") + (t.breaker ? " · ⚠️ breaker on" : " · " + (t.entries_left != null ? t.entries_left : "—") + " left")
      : (t.closed || 0) + " closed · " + rr(t.R || 0) + (t.breaker ? " · ⚠️ breaker on" : " · " + (t.entries_left != null ? t.entries_left : "—") + " left");
    $("djStats").innerHTML =
      stat("Equity", money(eq.gbp, "£"), money(eq.usdt, "") + " USDT · start " + money(st.gbp, "£"), " hero") +
      stat("Since start", '<span class="' + cls(since) + '">' + mark(since) + pct(since) + "</span>", "from " + money(st.gbp, "£") + " on " + ukT(st.date, true).replace(/,.*/, ""), " hero") +
      stat("Total R", '<span class="' + cls(s.total_R) + '">' + rr(s.total_R) + "</span>", "avg " + rr(s.avg_R) + (which === "pyramid" ? " / pyramid" : " / trade")) +
      stat("Win rate", isNum(s.win_rate) ? Math.round(s.win_rate * 100) + "%" : "—", (s.wins || 0) + " of " + (s.trades || 0) + (which === "pyramid" ? " pyramids" : " trades")) +
      stat("Max drawdown", '<span class="' + (s.max_drawdown_pct < 0 ? "dj-down" : "dj-flat") + '">' + pct(s.max_drawdown_pct) + "</span>", "peak to trough") +
      stat("Today", (t.entries || 0) + " entr" + (t.entries === 1 ? "y" : "ies"), todaySub);
  }

  function loadLib() {
    if (window.LightweightCharts) return Promise.resolve();
    return new Promise(function (res, rej) {
      var sc = document.createElement("script");
      sc.src = LWC_SRC; sc.integrity = LWC_SRI; sc.crossOrigin = "anonymous"; sc.async = true;
      sc.onload = function () { res(); }; sc.onerror = function () { rej(new Error("Chart library failed to load")); };
      document.head.appendChild(sc);
    });
  }
  function renderChart() {
    var host = $("djChart"), LW = window.LightweightCharts, pts = J.equity_curve || [];
    if (!pts.length) { host.innerHTML = '<div class="ts-msg">Equity curve starts after the first tick.</div>'; return; }
    if (chart) { try { chart.remove(); } catch (e) {} chart = null; }
    host.innerHTML = "";
    chart = LW.createChart(host, {
      autoSize: true,
      layout: { background: { type: "solid", color: "#12141c" }, textColor: "#8b93a7", fontSize: 11, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" },
      grid: { vertLines: { color: "rgba(42,47,61,0.35)" }, horzLines: { color: "rgba(42,47,61,0.35)" } },
      rightPriceScale: { borderColor: "#2a2f3d" },
      timeScale: { borderColor: "#2a2f3d", timeVisible: true, secondsVisible: false },
      crosshair: { mode: 0 },
      handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: false, pinch: true, axisPressedMouseMove: true },
      localization: { priceFormatter: function (p) { return "£" + p.toFixed(2); } }
    });
    var fx = J.start.fx_gbp_usd, seen = {}, data = [];
    pts.forEach(function (p) { var t = p[0]; if (seen[t]) return; seen[t] = 1; data.push({ time: t, value: isNum(p[2]) ? p[2] : p[1] / fx }); });
    data.sort(function (a, b) { return a.time - b.time; });
    var last = data[data.length - 1].value, up = last >= J.start.gbp;
    var series = chart.addLineSeries({ color: up ? "#22c55e" : "#e63946", lineWidth: 2, priceLineVisible: false });
    series.setData(data);
    series.createPriceLine({ price: J.start.gbp, color: "#5c6578", lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: "start £" + J.start.gbp });
    chart.timeScale().fitContent();
  }

  function posMetrics(p) {
    var px = live[p.symbol];
    if (!isNum(px)) px = p.last_price;
    var m = { px: px, pct: null, R: null };
    if (p.status === "pending" || !isNum(px)) return m;
    var entry = which === "pyramid" ? (p.avg_entry || p.entry1 || p.entry) : p.entry;
    var stop0 = p.stop0;
    var risk = entry - stop0;
    if (which === "pyramid" && isNum(p.R_dist) && isNum(p.entry1)) {
      // Mark R vs Entry1 / original R distance (Matthew's unit)
      m.pct = (px / (p.avg_entry || p.entry1) - 1) * 100;
      m.R = (px - p.entry1) / p.R_dist;
    } else {
      m.pct = (px / entry - 1) * 100;
      m.R = (p.realized_R || 0) + (isNum(p.remaining_frac) ? p.remaining_frac : 1) * (risk > 0 ? (px - entry) / risk : 0);
    }
    return m;
  }

  function renderOpenJ2() {
    var host = $("djOpen"), rows = J.open || [];
    if (!rows.length) { host.innerHTML = '<div class="dj-empty">No open positions or pending limit orders.</div>'; return; }
    host.innerHTML = rows.map(function (p) {
      var m = posMetrics(p), k = p.status === "pending" ? "k-amber" : (m.R > 0 ? "k-green" : m.R < 0 ? "k-red" : "");
      var tag = p.status === "pending" ? "a" : p.status === "runner" ? "g" : "";
      var under = p.status === "pending"
        ? '<div class="u dj-flat">limit ' + fmtP(p.limit) + (isNum(m.px) ? " · " + pct((m.px / p.limit - 1) * 100) + " away" : "") + "</div>"
        : '<div class="u ' + cls(m.R) + '">' + mark(m.R) + pct(m.pct) + " · " + rr(m.R) + "</div>";
      return '<article class="dj-card ' + k + '"><div class="hd"><div><h3>' + esc(p.coin) + '</h3><span class="dj-tag ' + tag + '">' + esc(p.status_label) + "</span></div>" +
        '<div class="px"><div class="p">' + fmtP(m.px) + "</div>" + under + "</div></div>" +
        '<div class="dj-lv"><div><div class="l">Entry</div><div class="v">' + fmtP(p.entry) + '</div></div><div><div class="l">🛑 Stop</div><div class="v">' + fmtP(p.stop) +
        '</div></div><div><div class="l">🎯 TP1</div><div class="v">' + fmtP(p.tp1) + '</div></div><div><div class="l">🎯 TP2</div><div class="v">' + fmtP(p.tp2) + "</div></div></div>" +
        '<div class="why">' + esc(p.reason) + " · " + (p.status === "pending" ? "placed " + ukT(p.placed_ts, true) + " UK, expires " + ukT(p.expires_ts) + " UK" : "filled " + ukT(p.filled_ts, true) + " UK") + "</div></article>";
    }).join("");
  }

  function renderOpenPyramid() {
    var host = $("djOpen"), rows = J.open || [];
    if (!rows.length) { host.innerHTML = '<div class="dj-empty">No open pyramids or pending Entry1 orders.</div>'; return; }
    host.innerHTML = rows.map(function (p) {
      var m = posMetrics(p), k = p.status === "pending" ? "k-amber" : (m.R > 0 ? "k-green" : m.R < 0 ? "k-red" : "");
      var tag = p.status === "pending" ? "a" : p.status === "trailing" ? "g" : "";
      var under = p.status === "pending"
        ? '<div class="u dj-flat">Entry1 limit ' + fmtP(p.limit) + (isNum(m.px) ? " · " + pct((m.px / p.limit - 1) * 100) + " away" : "") + "</div>"
        : '<div class="u ' + cls(m.R) + '">' + mark(m.R) + pct(m.pct) + " · " + rr(m.R) + " from Entry1</div>";
      var next = isNum(p.next_add) ? fmtP(p.next_add) : "—";
      var fills = (p.fills || []).map(function (f) { return "E" + f.n + "@" + fmtP(f.px); }).join(" · ") || "—";
      return '<article class="dj-card ' + k + '"><div class="hd"><div><h3>' + esc(p.coin) + '</h3><span class="dj-tag ' + tag + '">' + esc(p.status_label) + "</span>" +
        '<div class="dj-fills">' + esc(fills) + "</div></div>" +
        '<div class="px"><div class="p">' + fmtP(m.px) + "</div>" + under + "</div></div>" +
        '<div class="dj-lv dj-lv5"><div><div class="l">Entry1</div><div class="v">' + fmtP(p.entry1 || p.entry) + '</div></div>' +
        '<div><div class="l">Avg</div><div class="v">' + fmtP(p.avg_entry) + '</div></div>' +
        '<div><div class="l">🛑 Stop</div><div class="v">' + fmtP(p.stop) + '</div></div>' +
        '<div><div class="l">Next add</div><div class="v">' + next + '</div></div>' +
        '<div><div class="l">Size</div><div class="v">' + q(p.qty_open || p.qty1) + '</div></div></div>' +
        '<div class="why">' + esc(p.reason) + " · 1R " + money(p.original_1R, "") + " USDT · " +
        (p.status === "pending" ? "placed " + ukT(p.placed_ts, true) + " UK, expires " + ukT(p.expires_ts) + " UK" : "opened " + ukT(p.filled_ts, true) + " UK · " + (p.n_fills || 0) + "/5 fills") +
        "</div></article>";
    }).join("");
  }

  function renderOpen() {
    if (which === "pyramid") renderOpenPyramid();
    else renderOpenJ2();
  }

  function howTag(h) {
    var c = h === "TP1+TP2" || h === "trail" || h === "ladder-stop" ? "g" : h === "stop" ? "r" : h === "expired" ? "" : "a";
    return '<span class="dj-tag ' + c + '">' + esc(h) + "</span>";
  }
  function renderClosed() {
    var rows = J.closed || [];
    if (!rows.length) { $("djClosed").innerHTML = '<div class="dj-empty">No closed ' + (which === "pyramid" ? "pyramids" : "trades") + " yet.</div>"; return; }
    var head = which === "pyramid"
      ? '<th>Closed (UK)</th><th>Coin</th><th class="num">Entry1</th><th class="num">Exit</th><th class="num">Fills</th><th class="num">R</th><th class="num">%</th><th>How</th><th>Why taken</th>'
      : '<th>Closed (UK)</th><th>Coin</th><th class="num">Entry</th><th class="num">Exit</th><th class="num">R</th><th class="num">%</th><th>How</th><th>Why taken</th>';
    $("djClosed").innerHTML = '<div class="dj-table-wrap"><table class="dj-table"><thead><tr>' + head + "</tr></thead><tbody>" +
      rows.map(function (t) {
        if (which === "pyramid") {
          return "<tr><td>" + esc(ukT(t.closed_ts, true)) + '</td><td><b style="font-family:var(--mono)">' + esc(t.coin) + '</b></td><td class="num">' + fmtP(t.entry) + '</td><td class="num">' + fmtP(t.exit) +
            '</td><td class="num">' + (t.n_fills || "—") + '</td><td class="num ' + cls(t.R) + '"><b>' + rr(t.R) + '</b></td><td class="num ' + cls(t.pct) + '">' + pct(t.pct) + "</td><td>" + howTag(t.how) + '</td><td class="why">' + esc(t.reason) + "</td></tr>";
        }
        return "<tr><td>" + esc(ukT(t.closed_ts, true)) + '</td><td><b style="font-family:var(--mono)">' + esc(t.coin) + '</b></td><td class="num">' + fmtP(t.entry) + '</td><td class="num">' + fmtP(t.exit) +
          '</td><td class="num ' + cls(t.R) + '"><b>' + rr(t.R) + '</b></td><td class="num ' + cls(t.pct) + '">' + pct(t.pct) + "</td><td>" + howTag(t.how) + '</td><td class="why">' + esc(t.reason) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function renderLog() {
    var items = [];
    (J.blocked_today || []).forEach(function (b) {
      items.push({ ts: b.ts, coin: "ALL", text: b.reasons && b.reasons.length ? b.reasons.join(" · ") : "✅ filters clear, scanning" });
    });
    (J.skipped_today || []).forEach(function (s) { items.push({ ts: s.ts, coin: s.coin, text: s.reason }); });
    items.sort(function (a, b) { return a.ts < b.ts ? 1 : -1; });
    $("djLog").innerHTML = items.length
      ? '<ul class="dj-log">' + items.slice(0, 60).map(function (x) {
          return '<li><span class="t">' + esc(ukT(x.ts)) + '</span><span class="c">' + esc(x.coin) + "</span><span>" + esc(x.text) + "</span></li>";
        }).join("") + "</ul>"
      : '<div class="dj-empty">Nothing skipped or blocked today.</div>';
  }

  function renderAll() {
    applyLabels();
    renderHeader(); renderOpen(); renderClosed(); renderLog();
    $("djUpdated").textContent = (J.name || "Journal") + " updated " + (J.updated_label || "—") + (lastLive ? " · live prices " + ukT(new Date(lastLive).toISOString()) + " UK" : "");
  }

  function refreshLive() {
    var syms = (J && J.open || []).map(function (p) { return p.symbol; }).filter(Boolean);
    if (!syms.length || busy) return Promise.resolve();
    busy = true;
    return bget("/api/v3/ticker/price?symbols=" + encodeURIComponent(JSON.stringify(syms))).then(function (rows) {
      rows.forEach(function (r) { live[r.symbol] = +r.price; });
      lastLive = Date.now();
      $("djMeta").innerHTML = '<span class="status-dot live"></span>Live Binance Spot prices · auto-refresh 60s';
    }).catch(function () {
      $("djMeta").innerHTML = '<span class="status-dot error"></span>Could not reach Binance, showing last tick prices.';
    }).then(function () { busy = false; renderOpen(); renderHeader(); $("djUpdated").textContent = (J.name || "Journal") + " updated " + (J.updated_label || "—") + (lastLive ? " · live prices " + ukT(new Date(lastLive).toISOString()) + " UK" : ""); });
  }

  function loadJournal() {
    var file = SOURCES[which].file;
    return fetch(file, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(file + " HTTP " + r.status);
      return r.json();
    }).then(function (j) { J = j; live = {}; lastLive = null; renderAll(); });
  }

  function switchTo(id) {
    if (id !== "j2" && id !== "pyramid") return;
    if (which === id && J) return;
    which = id;
    try {
      var hash = which === "pyramid" ? "#demo/pyramid" : "#demo";
      if (location.hash !== hash) history.replaceState(null, "", location.pathname + location.search + hash);
    } catch (e) {}
    applyLabels();
    $("djMeta").textContent = "Loading " + SOURCES[which].title + "…";
    loadJournal().then(function () {
      $("djMeta").innerHTML = '<span class="status-dot cached"></span>Journal loaded';
      return Promise.all([refreshLive(), loadLib().then(renderChart, function (e) { $("djChart").innerHTML = '<div class="ts-msg">' + esc(e.message) + "</div>"; })]);
    }).catch(function (e) {
      $("djStats").innerHTML = '<div class="ts-error">Could not load the journal: ' + esc(e.message) + "</div>";
      $("djOpen").innerHTML = ""; $("djClosed").innerHTML = ""; $("djLog").innerHTML = "";
      $("djChart").innerHTML = '<div class="ts-msg">No data yet.</div>';
      $("djMeta").textContent = "";
    });
  }

  function start() {
    if (started) return;
    started = true;
    var m = location.hash.match(/^#demo(?:\/(pyramid|j2))?$/);
    if (m && m[1] === "pyramid") which = "pyramid";
    applyLabels();
    $("djMeta").textContent = "Loading journal…";
    loadJournal().then(function () {
      $("djMeta").innerHTML = '<span class="status-dot cached"></span>Journal loaded';
      var lv = refreshLive();
      var ch = loadLib().then(renderChart, function (e) { $("djChart").innerHTML = '<div class="ts-msg">' + esc(e.message) + "</div>"; });
      return Promise.all([lv, ch]);
    }).then(function () {
      setInterval(function () { if (!document.hidden && !VIEW.hidden) refreshLive(); }, REFRESH_MS);
      setInterval(function () { if (!document.hidden && !VIEW.hidden) loadJournal().then(function () { if (window.LightweightCharts) renderChart(); }).catch(function () {}); }, JOURNAL_MS);
    }).catch(function (e) {
      $("djStats").innerHTML = '<div class="ts-error">Could not load the journal: ' + esc(e.message) + "</div>";
      $("djMeta").textContent = "";
      started = false;
    });
  }

  document.querySelectorAll(".dj-sw").forEach(function (b) {
    b.addEventListener("click", function () { switchTo(b.getAttribute("data-journal")); });
  });

  var tab = document.querySelector('.nav-tab[data-view="demo"]');
  Array.prototype.forEach.call(document.querySelectorAll(".nav-tab"), function (t) {
    t.addEventListener("click", function () {
      var isDemo = t === tab;
      try {
        if (isDemo) {
          var hash = which === "pyramid" ? "#demo/pyramid" : "#demo";
          if (location.hash !== hash) history.replaceState(null, "", location.pathname + location.search + hash);
        } else if (/^#demo/.test(location.hash)) {
          history.replaceState(null, "", location.pathname + location.search);
        }
      } catch (e) {}
      if (isDemo) { start(); try { t.scrollIntoView({ block: "nearest", inline: "center" }); } catch (e) {} }
    });
  });
  var rb = $("refreshBtn");
  if (rb) rb.addEventListener("click", function () { if (started && J) { loadJournal().then(refreshLive).catch(function () {}); } });
  if (/^#demo/.test(location.hash) && tab) {
    if (/pyramid/.test(location.hash)) which = "pyramid";
    tab.click();
  }
  window.addEventListener("hashchange", function () {
    if (/^#demo/.test(location.hash) && tab) {
      if (/pyramid/.test(location.hash)) switchTo("pyramid");
      else if (which !== "j2") switchTo("j2");
      tab.click();
    }
  });
})();
