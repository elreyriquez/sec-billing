(function () {
  var root = document.querySelector(".sec-billing-marquee");
  if (!root) return;

  var track = root.querySelector(".sec-billing-marquee__track");
  if (!track) return;

  var template = track.querySelector(".sec-billing-marquee__group");
  if (!template) return;

  var maxGroups = 24;
  var resizeTimer;
  var layoutRetries = 0;

  function groupShiftPx() {
    var groups = track.querySelectorAll(".sec-billing-marquee__group");
    if (groups.length >= 2) {
      return groups[1].offsetLeft - groups[0].offsetLeft;
    }
    var gap = parseFloat(getComputedStyle(track).gap || "0") || 0;
    return groups[0].offsetWidth + gap;
  }

  function ensureCoverage() {
    var viewportWidth = root.clientWidth;
    var shift = groupShiftPx();
    if (!shift) {
      if (layoutRetries < 12) {
        layoutRetries += 1;
        window.requestAnimationFrame(ensureCoverage);
      }
      return;
    }

    layoutRetries = 0;
    var requiredTrackWidth = viewportWidth + shift;
    var count = track.querySelectorAll(".sec-billing-marquee__group").length;

    while (track.scrollWidth < requiredTrackWidth && count < maxGroups) {
      var clone = template.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
      count += 1;
    }

    track.style.setProperty("--marquee-shift", groupShiftPx() + "px");
  }

  function scheduleEnsure() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(ensureCoverage, 150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureCoverage);
  } else {
    ensureCoverage();
  }

  window.addEventListener("resize", scheduleEnsure);
  window.addEventListener("load", ensureCoverage);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(ensureCoverage);
  }

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(scheduleEnsure).observe(root);
  }
})();
