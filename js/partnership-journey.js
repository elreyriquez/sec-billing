/**
 * Partnership journey: scroll reveals + active section nav highlighting.
 */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function markRevealed(el) {
    el.classList.add("is-revealed");
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        markRevealed(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
  );

  function observeReveals() {
    document.querySelectorAll(".page-partnership .scroll-reveal").forEach(function (el) {
      if (reduced) {
        markRevealed(el);
        return;
      }
      if (!el.classList.contains("is-revealed")) observer.observe(el);
    });
  }

  var sectionIds = ["welcome", "purpose", "explore", "strategy", "structure", "agreement"];
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".partnership-nav .sec-billing-nav a[href^='#']")
  );

  function setActiveNav(id) {
    navLinks.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var match = href === "#" + id;
      a.classList.toggle("is-active", match);
      if (match) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  var sectionObserver = new IntersectionObserver(
    function (entries) {
      var visible = entries
        .filter(function (e) {
          return e.isIntersecting;
        })
        .sort(function (a, b) {
          return b.intersectionRatio - a.intersectionRatio;
        });
      if (visible[0]) setActiveNav(visible[0].target.id);
    },
    { root: null, rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.15, 0.35] }
  );

  sectionIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  window.partnershipObserveReveals = observeReveals;
  observeReveals();
})();
