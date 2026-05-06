(function () {
  var header = document.querySelector(".sec-billing-header");
  var toggle = document.querySelector(".sec-billing-menu-toggle");
  if (!header || !toggle) return;

  toggle.addEventListener("click", function () {
    var open = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  function closeMobileMenu() {
    if (window.matchMedia("(max-width: 820px)").matches) {
      header.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  }

  header.querySelectorAll(".sec-billing-header__cta a").forEach(function (link) {
    link.addEventListener("click", closeMobileMenu);
  });

  header.querySelectorAll('.sec-billing-nav a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", closeMobileMenu);
  });
})();
