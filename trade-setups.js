/* Crypto King: Trade setups tab.
 * PUBLIC PAGE: shows generic setup levels only (no holdings, sizes or equity).
 * Levels come from setups.json (updated by routines); prices are pulled live,
 * client-side, from Binance Spot public market data.
 */
(function () {
  "use strict";
  var VIEW = document.getElementById("view-setups");
  if (!VIEW) return;

  var LWC_SRC = "https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.7/dist/lightweight-charts.standalone.production.js";
  var LWC_SRI = "sha384-ubOX1hTMs7Y0lb1Ef6IUeWP35f2rF+tjtm2zr4f2f4fL0pyOiPKnR5FIWhl8Q+ik";
  /* api.binance.com first; the official public market-data mirror is a fallback
     for networks where api.binance.com is geo-blocked (HTTP 451). */
  var HOSTS = ["https://api.binance.com", "https://data-api.binance.vision"];
  var REFRESH_MS = 60000;

  var C = { green: "#22c55e", red: "#e63946", gold: "#f0c040", blue: "#60a5fa", text: "#e8eaef", muted: "#8b93a7", dim: "#5c6578", grey: "#6b7385" };

  var hostIdx = 0, cfg = null, cards = [], interval = "1d", started = false, timer = null, busy = false, lastRefresh = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function isNum(x) { return typeof x === "number" && isFinite(x); }
  function decimals(p) { var a = Math.abs(p); return a >= 100 ? 2 : a >= 1 ? 3 : 4; }
  function fmtP(p, d) {
    if (!isNum(p)) return "—";
    var raw = (String(p).split(".")[1] || "").length;
    var minD = d != null ? d : decimals(p);
    var maxD = d != null ? d : Math.min(6, Math.max(minD, raw));
    return "$" + p.toLocaleString("en-US", { minimumFractionDigits: minD, maximumFractionDigits: maxD });
  }
  function pct(n, digits) {
    if (!isNum(n)) return "—";
    var d = digits == null ? (Math.abs(n) < 10 ? 2 : 1) : digits;
    return (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(d) + "%";
  }
  function apct(n) { return isNum(n) ? pct(Math.abs(n)).replace("+", "") : "—"; }
  function rel(target, price) { return isNum(target) && isNum(price) && price > 0 ? (target / price - 1) * 100 : null; }
  function ukTime(ms, withDate) {
    var o = { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false };
    if (withDate) { o.day = "numeric"; o.month = "short"; }
    return new Date(ms).toLocaleString("en-GB", o) + " UK";
  }
  function ukDate(iso) {
    if (!iso) return "—";
    var d = new Date(/T/.test(iso) ? iso : iso + "T12:00:00Z");
    return d.toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" });
  }

  /* ---------- Binance ---------- */
  var hostKnown = false, probe = null;
  function bget(path) {
    if (!hostKnown && probe) {
      var again = function () { return bget(path); };
      return probe.then(again, again);
    }
    var i = hostIdx, lastErr = null;
    function attempt() {
      if (i >= HOSTS.length) return Promise.reject(lastErr || new Error("Binance unreachable"));
      var host = HOSTS[i];
      return fetch(host + path, { cache: "no-store" }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " from " + host.replace("https://", ""));
        return r.json();
      }).then(function (j) { hostIdx = i; hostKnown = true; return j; }, function (e) { lastErr = e; i++; return attempt(); });
    }
    var p = attempt();
    if (!hostKnown) { probe = p; p.catch(function () { probe = null; }); }
    return p;
  }
  function toCandles(rows) {
    return rows.map(function (k) { return { time: Math.floor(k[0] / 1000), open: +k[1], high: +k[2], low: +k[3], close: +k[4] }; });
  }
  function klines(sym, iv, limit, startMs) {
    var q = "/api/v3/klines?symbol=" + encodeURIComponent(sym) + "&interval=" + iv + "&limit=" + limit + (startMs ? "&startTime=" + startMs : "");
    return bget(q).then(toCandles);
  }
  function hourlySince(sym, startMs) {
    var out = [];
    function page(from, n) {
      return klines(sym, "1h", 1000, from).then(function (c) {
        out = out.concat(c);
        if (c.length === 1000 && n < 4) return page((c[c.length - 1].time + 3600) * 1000, n + 1);
        return out;
      });
    }
    return page(startMs, 0);
  }
  function tickers(syms) {
    return bget("/api/v3/ticker/24hr?symbols=" + encodeURIComponent(JSON.stringify(syms))).then(function (rows) {
      var m = {};
      rows.forEach(function (r) { m[r.symbol] = { last: +r.lastPrice, ch: +r.priceChangePercent }; });
      return m;
    });
  }

  /* ---------- status logic (price vs levels only) ---------- */
  function scanHistory(s, candles) {
    /* Walk candles since the setup time; conservative: if stop and TP1 fall in the
       same candle, the stop is treated as first. */
    var ev = { stopAt: null, tp1At: null, tp2At: null, beAt: null };
    for (var i = 0; i < candles.length; i++) {
      var k = candles[i], t = k.time * 1000;
      if (!ev.tp1At) {
        if (k.low <= s.stop) { ev.stopAt = t; break; }
        if (k.high >= s.tp1) { ev.tp1At = t; if (k.high >= s.tp2) { ev.tp2At = t; break; } continue; }
      } else {
        if (k.high >= s.tp2) { ev.tp2At = t; break; }
        if (k.low <= s.entry) { ev.beAt = t; break; }
      }
    }
    return ev;
  }

  function evaluate(s, price, hist) {
    var z0 = s.zone[0], z1 = s.zone[1];
    var armed = isNum(s.entry) && isNum(s.stop) && isNum(s.tp1);
    var inZone = price >= z0 && price <= z1;
    var aboveTop = rel(price, z1) != null ? (price / z1 - 1) * 100 : null;
    var r = { kind: "amber", badge: "", line: "", rank: 1 };

    if (s.state === "invalidated") {
      r.kind = "grey"; r.badge = "Invalidated"; r.rank = 2;
      var when = s.invalidated_ts ? " on " + ukDate(s.invalidated_ts) : "";
      if (price > z1) r.line = "Setup invalidated" + when + ". Price is " + apct(aboveTop) + " above the old zone top (" + fmtP(z1) + "). Old levels shown greyed, don't chase.";
      else if (inZone) r.line = "Setup invalidated" + when + ". Price is back inside the old zone, but it is not re-armed: wait for a fresh scan.";
      else r.line = "Setup invalidated" + when + ". Price is below the old zone. Old levels are reference only.";
      return r;
    }

    if (!armed) {
      if (inZone) { r.kind = "green"; r.badge = "🔥 IN BUY ZONE"; r.rank = 0; r.line = "Price is inside the " + fmtP(z0) + "–" + fmtP(z1) + " zone. Not armed yet: no entry, stop or targets set."; }
      else if (price > z1) { r.badge = "⏳ ABOVE ZONE, wait"; r.line = "Price is " + apct(aboveTop) + " above the zone top (" + fmtP(z1) + "). Waiting for a pullback into the zone."; }
      else { r.badge = "⏳ BELOW ZONE, wait"; r.line = "Price is " + apct((price / z0 - 1) * 100) + " below the zone low (" + fmtP(z0) + "). Wait for it to stabilise."; }
      return r;
    }

    var ev = hist || {};
    if (ev.stopAt) {
      r.kind = "red"; r.badge = "🛑 STOP HIT"; r.rank = 0;
      r.line = "Price touched the stop (" + fmtP(s.stop) + ") around " + ukTime(ev.stopAt, true) + ", before reaching TP1.";
      return r;
    }
    if (ev.tp2At) {
      r.kind = "green"; r.badge = "🎯 TP2 HIT, done"; r.rank = 0;
      r.line = "Price reached TP2 (" + fmtP(s.tp2) + ") around " + ukTime(ev.tp2At, true) + ". Setup complete.";
      return r;
    }
    if (ev.tp1At) {
      r.kind = "green"; r.rank = 0;
      if (ev.beAt) {
        r.badge = "🎯 TP1 HIT, back to breakeven";
        r.line = "Price reached TP1 (" + fmtP(s.tp1) + ") around " + ukTime(ev.tp1At, true) + ", then came back to the entry level (" + fmtP(s.entry) + ") around " + ukTime(ev.beAt, true) + ".";
      } else {
        r.badge = "🎯 TP1 HIT, move stop to breakeven";
        r.line = "Price reached TP1 (" + fmtP(s.tp1) + ") around " + ukTime(ev.tp1At, true) + ". Plan: stop to breakeven (" + fmtP(s.entry) + "), trail. TP2 is " + pct(rel(s.tp2, price)) + " away.";
      }
      return r;
    }
    if (price <= s.stop) {
      r.kind = "red"; r.badge = "🛑 STOP HIT"; r.rank = 0;
      r.line = "Price is at or below the stop (" + fmtP(s.stop) + ") right now.";
      return r;
    }
    if (inZone) {
      r.kind = "green"; r.badge = "🔥 IN BUY ZONE"; r.rank = 0;
      var de = rel(s.entry, price);
      r.line = "Price is inside the " + fmtP(z0) + "–" + fmtP(z1) + " zone, " + (Math.abs(de) < 0.05 ? "right at" : apct((price / s.entry - 1) * 100) + (price > s.entry ? " above" : " below")) + " entry. Stop and TP1 not touched since setup.";
      return r;
    }
    if (price > z1) {
      r.kind = "amber"; r.badge = "⏳ ABOVE ZONE, wait"; r.rank = 1;
      r.line = "Price is " + apct(aboveTop) + " above the zone top (" + fmtP(z1) + "). Wait for a dip back into the zone, don't chase.";
      return r;
    }
    r.kind = "red"; r.badge = "⏳ BELOW ENTRY, near stop"; r.rank = 0;
    r.line = "Price is below the zone and only " + apct((price / s.stop - 1) * 100) + " above the stop (" + fmtP(s.stop) + ").";
    return r;
  }

  /* ---------- shaded buy-zone band (Lightweight Charts series primitive) ---------- */
  function BandPrimitive(lo, hi, fill) {
    var self = this;
    this.lo = lo; this.hi = hi; this.fill = fill; this.series = null;
    var renderer = {
      draw: function (target) {
        if (!self.series) return;
        var y1 = self.series.priceToCoordinate(self.hi), y2 = self.series.priceToCoordinate(self.lo);
        if (y1 == null || y2 == null) return;
        target.useBitmapCoordinateSpace(function (sc) {
          var top = Math.round(Math.min(y1, y2) * sc.verticalPixelRatio);
          var h = Math.max(1, Math.round(Math.abs(y2 - y1) * sc.verticalPixelRatio));
          sc.context.fillStyle = self.fill;
          sc.context.fillRect(0, top, sc.bitmapSize.width, h);
        });
      }
    };
    this._view = { renderer: function () { return renderer; }, zOrder: function () { return "bottom"; } };
  }
  BandPrimitive.prototype.attached = function (p) { this.series = p.series; };
  BandPrimitive.prototype.detached = function () { this.series = null; };
  BandPrimitive.prototype.updateAllViews = function () {};
  BandPrimitive.prototype.paneViews = function () { return [this._view]; };

  /* ---------- rendering ---------- */
  function levelsHtml(s) {
    var rows = [];
    var old = s.state === "invalidated" ? "Old " : "";
    function row(k, v) { rows.push("<dt>" + k + "</dt><dd>" + v + "</dd>"); }
    function withPct(v, base, extra) {
      var p = isNum(base) && isNum(v) ? ' <span class="dim">(' + pct((v / base - 1) * 100, 1) + (extra ? ", " + extra : "") + ")</span>" : "";
      return fmtP(v) + p;
    }
    row("🔥 " + (old ? "Old buy zone" : "Buy zone"), fmtP(s.zone[0]) + " – " + fmtP(s.zone[1]));
    if (isNum(s.entry)) row(old + "Entry", fmtP(s.entry));
    if (isNum(s.stop)) row("🛑 " + old + "Stop", withPct(s.stop, s.entry) + (isNum(s.stop_limit) ? ' <span class="dim">· limit ' + fmtP(s.stop_limit) + "</span>" : ""));
    if (isNum(s.tp1)) row("🎯 " + old + "TP1", withPct(s.tp1, s.entry, isNum(s.tp1_r) ? s.tp1_r.toFixed(1) + "R" : ""));
    if (isNum(s.tp2)) row("🎯 " + old + "TP2", withPct(s.tp2, s.entry, isNum(s.tp2_r) ? s.tp2_r.toFixed(1) + "R" : ""));
    if (isNum(s.swing_high)) row("Swing high", fmtP(s.swing_high) + (s.swing_high_date ? ' <span class="dim">(' + ukDate(s.swing_high_date).replace(/ \d{4}$/, "") + ")</span>" : ""));
    row("Setup date", s.setup_date ? ukDate(s.setup_date) : '<span class="dim">not armed</span>');
    return rows.join("");
  }

  function buildCard(s, idx) {
    var el = document.createElement("article");
    el.className = "ts-card";
    el.setAttribute("data-sym", s.symbol);
    var base = s.symbol.replace(/USDT$/, "");
    var pillCls = s.state === "invalidated" ? "s-invalidated" : s.state === "waiting" ? "s-waiting" : "s-live";
    el.innerHTML =
      '<div class="ts-badge loading" data-r="badge">Checking live price…</div>' +
      '<div class="ts-line" data-r="line">&nbsp;</div>' +
      '<div class="ts-head">' +
        '<div class="ts-title"><h3>' + esc(base) + "/USDT<small>" + esc(s.name || "") + "</small></h3>" +
        '<span class="ts-pill ' + pillCls + '">' + esc(s.status_label || s.state) + "</span></div>" +
        '<div class="ts-price"><div class="p" data-r="price">—</div><div class="c flat" data-r="ch">24h —</div></div>' +
      "</div>" +
      '<div class="ts-dists" data-r="dists"></div>' +
      '<div class="ts-chart" data-r="chart"><div class="ts-msg">Loading chart…</div></div>' +
      '<dl class="ts-levels">' + levelsHtml(s) + "</dl>" +
      (s.notes && s.notes.length ? '<ul class="ts-notes">' + s.notes.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>" : "") +
      '<div class="ts-foot-row"><a class="ts-tv" target="_blank" rel="noopener" href="https://www.tradingview.com/chart/?symbol=BINANCE:' + encodeURIComponent(s.symbol) + '">Full chart on TradingView ↗</a>' +
      '<span class="ts-since" data-r="since"></span></div>';
    var c = { s: s, el: el, idx: idx, chart: null, series: null, price: null, ch: null, hist: null, status: null };
    c.q = function (k) { return el.querySelector('[data-r="' + k + '"]'); };
    return c;
  }

  function distsHtml(c) {
    var s = c.s, p = c.price, items;
    if (isNum(s.entry)) {
      var pre = s.state === "invalidated" ? "Old " : "To ";
      items = [[pre + "entry", s.entry], [pre + "stop", s.stop], [pre + "TP1", s.tp1]];
    } else {
      items = [["To zone top", s.zone[1]], ["To zone low", s.zone[0]], ["To swing high", s.swing_high]];
    }
    return items.map(function (it) {
      var d = rel(it[1], p);
      var cls = d == null ? "na" : d > 0 ? "up" : d < 0 ? "down" : "";
      return '<div class="ts-dist"><div class="l">' + esc(it[0]) + '</div><div class="v ' + cls + '">' + pct(d) + "</div></div>";
    }).join("");
  }

  function paint(c) {
    if (!isNum(c.price)) return;
    var st = evaluate(c.s, c.price, c.hist);
    c.status = st;
    var b = c.q("badge");
    b.className = "ts-badge k-" + st.kind; b.textContent = st.badge;
    c.q("line").textContent = st.line;
    c.el.className = "ts-card k-" + st.kind;
    c.q("price").textContent = fmtP(c.price);
    var ch = c.q("ch");
    if (isNum(c.ch)) { ch.className = "c " + (c.ch > 0 ? "up" : c.ch < 0 ? "down" : "flat"); ch.textContent = (c.ch >= 0 ? "🟢📈 " : "🔴📉 ") + pct(c.ch) + " 24h"; }
    c.q("dists").innerHTML = distsHtml(c);
    c.q("since").textContent = c.s.setup_ts ? "Checked candles since " + ukTime(Date.parse(c.s.setup_ts), true) : "";
  }

  function sortCards() {
    var grid = $("tsGrid");
    var order = cards.slice().sort(function (a, b) {
      var ra = a.status ? a.status.rank : 1, rb = b.status ? b.status.rank : 1;
      return ra - rb || a.idx - b.idx;
    });
    var cur = Array.prototype.slice.call(grid.children);
    var same = order.every(function (c, i) { return cur[i] === c.el; });
    if (!same) order.forEach(function (c) { grid.appendChild(c.el); });
  }

  function chartLevels(s) {
    var v = [s.zone[0], s.zone[1], s.entry, s.stop, s.tp1, s.tp2, s.swing_high];
    return v.filter(isNum);
  }

  function makeChart(c, candles) {
    var s = c.s, host = c.q("chart"), LW = window.LightweightCharts;
    if (c.chart) { try { c.chart.remove(); } catch (e) {} c.chart = null; }
    host.innerHTML = "";
    var grey = s.state === "invalidated";
    var chart = LW.createChart(host, {
      autoSize: true,
      layout: { background: { type: "solid", color: "#12141c" }, textColor: C.muted, fontSize: 11, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" },
      grid: { vertLines: { color: "rgba(42,47,61,0.35)" }, horzLines: { color: "rgba(42,47,61,0.35)" } },
      rightPriceScale: { borderColor: "#2a2f3d", scaleMargins: { top: 0.06, bottom: 0.06 } },
      timeScale: { borderColor: "#2a2f3d", timeVisible: interval !== "1d", secondsVisible: false, rightOffset: 3 },
      crosshair: { mode: 0 },
      handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: false, pinch: true, axisPressedMouseMove: true },
      localization: { priceFormatter: function (p) { return fmtP(p, decimals(p)).replace("$", ""); } }
    });
    var d = decimals(candles.length ? candles[candles.length - 1].close : s.zone[1]);
    var lv = chartLevels(s), lo = Math.min.apply(null, lv), hi = Math.max.apply(null, lv);
    var series = chart.addCandlestickSeries({
      upColor: C.green, downColor: C.red, borderVisible: false, wickUpColor: C.green, wickDownColor: C.red,
      priceFormat: { type: "price", precision: d, minMove: Math.pow(10, -d) },
      autoscaleInfoProvider: function (orig) {
        var r = orig();
        if (!r || !r.priceRange) return r;
        r.priceRange.minValue = Math.min(r.priceRange.minValue, lo);
        r.priceRange.maxValue = Math.max(r.priceRange.maxValue, hi);
        return r;
      }
    });
    series.setData(candles);
    if (typeof series.attachPrimitive === "function") {
      series.attachPrimitive(new BandPrimitive(s.zone[0], s.zone[1], grey ? "rgba(139,147,167,0.10)" : "rgba(34,197,94,0.13)"));
    }
    function line(price, color, title, style, width) {
      if (!isNum(price)) return;
      series.createPriceLine({ price: price, color: grey ? C.grey : color, lineWidth: width || 1, lineStyle: style == null ? 0 : style, axisLabelVisible: true, title: title });
    }
    var pre = grey ? "old " : "";
    line(s.zone[1], C.green, "🔥 " + (grey ? "Old buy zone" : "Buy zone"), 2);
    line(s.zone[0], C.green, "", 2);
    line(s.entry, C.blue, pre + "Entry", 0, 2);
    line(s.stop, C.red, "🛑 " + pre + "Stop", 0, 2);
    line(s.tp1, C.green, "🎯 " + pre + "TP1", 0, 2);
    line(s.tp2, C.green, "🎯 " + pre + "TP2", 0, 2);
    if (isNum(s.swing_high) && !near(s.swing_high, s.tp1) && !near(s.swing_high, s.tp2)) line(s.swing_high, C.muted, "Swing high", 1);
    chart.timeScale().fitContent();
    c.chart = chart; c.series = series;
  }
  function near(a, b) { return isNum(a) && isNum(b) && Math.abs(a / b - 1) < 0.003; }

  function limitFor(iv) {
    var ch = (cfg && cfg.chart) || {};
    return iv === "1d" ? (ch.daily_limit || 120) : (ch.h4_limit || 180);
  }

  function loadCharts() {
    return Promise.all(cards.map(function (c) {
      return klines(c.s.symbol, interval, limitFor(interval)).then(function (cd) {
        makeChart(c, cd);
        if (!isNum(c.price) && cd.length) c.price = cd[cd.length - 1].close;
      }).catch(function (e) {
        c.q("chart").innerHTML = '<div class="ts-msg">Chart unavailable (' + esc(e.message) + ").<br>Use the TradingView link below.</div>";
      });
    }));
  }

  function refreshStatus() {
    if (busy) return Promise.resolve();
    busy = true;
    var syms = cards.map(function (c) { return c.s.symbol; });
    return tickers(syms).then(function (m) {
      cards.forEach(function (c) { var t = m[c.s.symbol]; if (t) { c.price = t.last; c.ch = t.ch; } });
    }).catch(function () { /* fall back to last candle close below */ }).then(function () {
      return Promise.all(cards.map(function (c) {
        var jobs = [];
        if (c.series) {
          jobs.push(klines(c.s.symbol, interval, 2).then(function (cd) {
            cd.forEach(function (k) { try { c.series.update(k); } catch (e) {} });
            if (!isNum(c.price) && cd.length) c.price = cd[cd.length - 1].close;
          }).catch(function () {}));
        }
        if (c.s.setup_ts && isNum(c.s.stop) && isNum(c.s.tp1) && c.s.state !== "invalidated") {
          jobs.push(hourlySince(c.s.symbol, Date.parse(c.s.setup_ts)).then(function (h) { c.hist = scanHistory(c.s, h); }).catch(function () {}));
        }
        return Promise.all(jobs);
      }));
    }).then(function () {
      cards.forEach(paint);
      sortCards();
      lastRefresh = Date.now();
      var ok = cards.some(function (c) { return isNum(c.price); });
      $("tsMeta").innerHTML = ok
        ? '<span class="status-dot live"></span>Live Binance Spot · prices ' + esc(ukTime(lastRefresh)) + " · auto-refresh 60s"
        : '<span class="status-dot error"></span>Could not reach Binance. Retrying in 60s.';
    }).then(function () { busy = false; }, function () { busy = false; });
  }

  function loadLib() {
    if (window.LightweightCharts) return Promise.resolve();
    return new Promise(function (res, rej) {
      var sc = document.createElement("script");
      sc.src = LWC_SRC; sc.integrity = LWC_SRI; sc.crossOrigin = "anonymous"; sc.async = true;
      sc.onload = function () { res(); };
      sc.onerror = function () { rej(new Error("Chart library failed to load")); };
      document.head.appendChild(sc);
    });
  }

  function start() {
    if (started) return;
    started = true;
    $("tsMeta").textContent = "Loading setups…";
    fetch("setups.json", { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("setups.json HTTP " + r.status);
      return r.json();
    }).then(function (j) {
      cfg = j;
      $("tsUpdated").textContent = "Last updated: " + (j.updated_label || (j.updated ? new Date(j.updated).toLocaleString("en-GB", { timeZone: "Europe/London" }) + " UK" : "—"));
      var grid = $("tsGrid");
      grid.innerHTML = "";
      cards = (j.setups || []).map(buildCard);
      cards.forEach(function (c) { grid.appendChild(c.el); });
      /* status first (works even if the chart library is slow), then charts */
      var st = refreshStatus();
      var ch = loadLib().then(loadCharts, function (e) {
        cards.forEach(function (c) { c.q("chart").innerHTML = '<div class="ts-msg">' + esc(e.message) + ".<br>Use the TradingView link below.</div>"; });
      });
      return Promise.all([st, ch]).then(function () { cards.forEach(paint); });
    }).then(function () {
      timer = setInterval(function () { if (!document.hidden) refreshStatus(); }, REFRESH_MS);
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden && lastRefresh && Date.now() - lastRefresh > REFRESH_MS) refreshStatus();
      });
    }).catch(function (e) {
      $("tsGrid").innerHTML = '<div class="ts-error">Could not load setups: ' + esc(e.message) + "</div>";
      $("tsMeta").textContent = "";
      started = false;
    });
  }

  /* interval toggle */
  Array.prototype.forEach.call(VIEW.querySelectorAll(".ts-seg button"), function (b) {
    b.addEventListener("click", function () {
      var iv = b.getAttribute("data-iv");
      if (iv === interval) return;
      interval = iv;
      Array.prototype.forEach.call(VIEW.querySelectorAll(".ts-seg button"), function (x) { var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
      if (cards.length && window.LightweightCharts) loadCharts();
    });
  });

  /* tab wiring + #setups deep link (existing switchView handles show/hide) */
  var tab = document.querySelector('.nav-tab[data-view="setups"]');
  Array.prototype.forEach.call(document.querySelectorAll(".nav-tab"), function (t) {
    t.addEventListener("click", function () {
      var isSetups = t === tab;
      try {
        if (isSetups && location.hash !== "#setups") history.replaceState(null, "", location.pathname + location.search + "#setups");
        else if (!isSetups && location.hash === "#setups") history.replaceState(null, "", location.pathname + location.search);
      } catch (e) {}
      if (isSetups) start();
    });
  });
  var rb = $("refreshBtn");
  if (rb) rb.addEventListener("click", function () { if (started && cards.length) refreshStatus(); });
  if (/^#(setups|trade-setups)$/.test(location.hash) && tab) tab.click();
  window.addEventListener("hashchange", function () { if (/^#(setups|trade-setups)$/.test(location.hash) && tab) tab.click(); });
})();
