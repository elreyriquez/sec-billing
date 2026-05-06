(function () {
  var root = document.querySelector("[data-dashboard-preview]");
  if (!root) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function formatMonthDay(d) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function monthRangeLabel() {
    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), 1);
    var end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return formatMonthDay(start) + " - " + formatMonthDay(end);
  }

  var elSubtitle = root.querySelector("[data-preview-subtitle-date]");
  var elMonthRange = root.querySelector("[data-preview-month-range]");
  var today = new Date();
  if (elSubtitle) {
    elSubtitle.textContent = formatMonthDay(today);
    elSubtitle.setAttribute("datetime", today.toISOString().slice(0, 10));
  }
  if (elMonthRange) elMonthRange.textContent = monthRangeLabel();

  var dayLabelEls = root.querySelectorAll("[data-preview-day-label]");
  for (var di = 0; di < dayLabelEls.length; di++) {
    var d = new Date();
    d.setDate(d.getDate() - (6 - di));
    dayLabelEls[di].textContent = d.toLocaleDateString("en-US", { weekday: "short" });
  }

  /** Mirrors billing app dashboard aggregates + time insights (preview values only). */
  var base = {
    outstanding: 21871.32,
    overdue: 12000,
    collected: 0,
    billablePct: 52,
    barHeights: [0.35, 0.22, 0.48, 0.15, 0.55, 0.28, 0.4],
    thisWeekMin: 0,
    lastWeekMin: 180,
  };

  var current = {
    outstanding: 0,
    overdue: 0,
    collected: 0,
    billablePct: 0,
    barHeights: [0, 0, 0, 0, 0, 0, 0],
    thisWeekMin: base.thisWeekMin,
    lastWeekMin: base.lastWeekMin,
  };

  var els = {
    out: root.querySelector("[data-preview-outstanding]"),
    ovd: root.querySelector("[data-preview-overdue]"),
    col: root.querySelector("[data-preview-collected]"),
    meter: root.querySelector("[data-preview-meter-bill]"),
    billLegend: root.querySelector("[data-preview-bill-legend]"),
    nonLegend: root.querySelector("[data-preview-non-legend]"),
    weekThis: root.querySelector("[data-preview-week-this]"),
    weekLast: root.querySelector("[data-preview-week-last]"),
    delta: root.querySelector("[data-preview-week-delta]"),
    bars: root.querySelectorAll("[data-preview-bar-fill]"),
    barTips: root.querySelectorAll("[data-preview-bar-tip]"),
  };

  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  function fmtShortMins(mins) {
    if (mins <= 0) return "0m";
    if (mins < 60) return mins + "m";
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    return m > 0 ? h + "h " + m + "m" : h + "h";
  }

  function fmtHoursFromMin(mins) {
    if (mins <= 0) return "0h";
    var h = mins / 60;
    return h >= 10 ? Math.round(h) + "h" : h.toFixed(1) + "h";
  }

  function renderMoney() {
    if (els.out) els.out.textContent = formatCurrency(current.outstanding);
    if (els.ovd) els.ovd.textContent = formatCurrency(current.overdue);
    if (els.col) els.col.textContent = formatCurrency(current.collected);
  }

  function renderMeter() {
    var pct = clamp(current.billablePct, 8, 92);
    if (els.meter) els.meter.style.width = pct + "%";
    var totalSynth = 960;
    var billMin = Math.round((pct / 100) * totalSynth);
    var nonMin = Math.round(((100 - pct) / 100) * totalSynth);
    if (els.billLegend) els.billLegend.textContent = fmtShortMins(billMin);
    if (els.nonLegend) els.nonLegend.textContent = fmtShortMins(nonMin);
  }

  function renderBars() {
    var maxH = Math.max.apply(
      null,
      current.barHeights.concat([0.001])
    );
    for (var i = 0; i < els.bars.length; i++) {
      var raw = current.barHeights[i] !== undefined ? current.barHeights[i] : 0;
      var pct = maxH > 0 ? clamp((raw / maxH) * 100, 6, 100) : 6;
      var bar = els.bars[i];
      bar.style.height = pct + "%";
      var mins = Math.round(raw * 420);
      bar.classList.toggle("sec-billing-dash-preview__bar-fill--on", mins > 0);
      if (els.barTips[i]) {
        els.barTips[i].textContent =
          mins > 0 ? (mins >= 60 ? Math.round(mins / 60) + "h" : mins + "m") : "-";
      }
    }
  }

  function renderWeek() {
    if (els.weekThis) els.weekThis.textContent = fmtHoursFromMin(current.thisWeekMin);
    if (els.weekLast) els.weekLast.textContent = fmtHoursFromMin(current.lastWeekMin);
    if (!els.delta) return;
    var delta = current.thisWeekMin - current.lastWeekMin;
    if (current.lastWeekMin <= 0 && current.thisWeekMin <= 0) {
      els.delta.textContent = "No comparison yet";
    } else if (delta === 0) {
      els.delta.textContent = "Same as last week";
    } else if (delta > 0) {
      els.delta.innerHTML =
        '<span style="color:#15803d">\u2191 ' +
        fmtShortMins(delta) +
        " more than last week</span>";
    } else {
      els.delta.innerHTML =
        "<span>\u2193 " + fmtShortMins(-delta) + " less than last week</span>";
    }
  }

  function fluctuate() {
    function wobble(v, pct) {
      return v * (1 + (Math.random() - 0.5) * pct);
    }
    current.outstanding = wobble(base.outstanding, 0.012);
    current.overdue = clamp(wobble(base.overdue, 0.014), 7500, 15500);
    current.collected = clamp(
      Math.abs(wobble(Math.max(120, base.collected + 450), 0.22)),
      0,
      3200
    );
    current.billablePct = clamp(wobble(base.billablePct, 0.055), 32, 78);
    current.barHeights = base.barHeights.map(function (h) {
      return clamp(wobble(h, 0.22), 0.12, 0.95);
    });
    current.thisWeekMin = Math.round(clamp(wobble(base.thisWeekMin + 35, 0.55), 0, 520));
    current.lastWeekMin = Math.round(clamp(wobble(base.lastWeekMin, 0.14), 130, 230));
    renderMoney();
    renderMeter();
    renderBars();
    renderWeek();
  }

  var started = false;
  function startAnimations() {
    if (started) return;
    started = true;

    if (reduced) {
      current.outstanding = base.outstanding;
      current.overdue = base.overdue;
      current.collected = base.collected;
      current.barHeights = base.barHeights.slice();
      current.billablePct = base.billablePct;
      renderMoney();
      renderMeter();
      renderBars();
      renderWeek();
      return;
    }

    var t0 = performance.now();
    var dur = 620;

    function loop(now) {
      var p = Math.min(1, (now - t0) / dur);
      var easeMoney = 1 - Math.pow(1 - p, 3);
      var easeBars = 1 - Math.pow(1 - p, 2);

      current.outstanding = base.outstanding * easeMoney;
      current.overdue = base.overdue * easeMoney;
      current.collected = base.collected * easeMoney;
      current.billablePct = base.billablePct * easeBars;
      for (var i = 0; i < base.barHeights.length; i++) {
        current.barHeights[i] = base.barHeights[i] * easeBars;
      }

      renderMoney();
      renderMeter();
      renderBars();

      if (p < 1) {
        requestAnimationFrame(loop);
      } else {
        current.outstanding = base.outstanding;
        current.overdue = base.overdue;
        current.collected = base.collected;
        current.billablePct = base.billablePct;
        current.barHeights = base.barHeights.slice();
        renderMoney();
        renderMeter();
        renderBars();
        fluctuate();
        setInterval(fluctuate, 2200);
      }
    }
    requestAnimationFrame(loop);
  }

  renderMeter();
  renderBars();
  renderWeek();

  var carouselViewport = root.closest("[data-ui-carousel-viewport]");
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          startAnimations();
          io.disconnect();
        }
      });
    },
    carouselViewport
      ? { root: carouselViewport, rootMargin: "0px", threshold: 0.22 }
      : { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );
  io.observe(root);
})();

