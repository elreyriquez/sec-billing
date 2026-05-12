(function () {
  var header = document.querySelector(".sec-billing-header");
  var toggle = document.querySelector(".sec-billing-menu-toggle");

  function closeMobileMenu() {
    if (!header || !toggle) return;
    if (window.matchMedia("(max-width: 820px)").matches) {
      header.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  }

  /**
   * Open any <details> that lives inside the section with the given id (or that
   * is itself the target element). Used so a nav click on e.g. "#specifications"
   * auto-expands its collapsible instead of landing on a closed accordion.
   */
  function openCollapsibleFor(id) {
    if (!id) return false;
    var target = document.getElementById(id);
    if (!target) return false;
    var opened = false;
    if (target.tagName === "DETAILS" && !target.open) {
      target.open = true;
      opened = true;
    }
    var nested = target.querySelectorAll("details");
    nested.forEach(function (d) {
      if (!d.open) {
        d.open = true;
        opened = true;
      }
    });
    return opened;
  }

  function scrollIntoSection(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleHashTarget(hash, options) {
    if (!hash || hash.charAt(0) !== "#" || hash.length < 2) return;
    var id = hash.slice(1);
    var wasOpened = openCollapsibleFor(id);
    if (options && options.scroll) {
      if (wasOpened) {
        // Defer scroll so the just-expanded content has a height before we scroll.
        window.requestAnimationFrame(function () {
          scrollIntoSection(id);
        });
      }
    }
  }

  if (header && toggle) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    header.querySelectorAll(".sec-billing-header__cta a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });

    header.querySelectorAll('.sec-billing-nav a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  // Any in-page anchor (header nav, footer nav, inline CTA) should pop open the
  // collapsible at its destination so users don't land on a closed section.
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      var href = link.getAttribute("href");
      handleHashTarget(href, { scroll: false });
    });
  });

  // Direct loads (or back/forward navigation) that include a hash should also
  // expand the collapsible and scroll to it.
  if (window.location.hash) {
    handleHashTarget(window.location.hash, { scroll: true });
  }
  window.addEventListener("hashchange", function () {
    handleHashTarget(window.location.hash, { scroll: true });
  });
})();
