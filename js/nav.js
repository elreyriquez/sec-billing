(function () {
  var header = document.querySelector(".sec-billing-header");
  var toggle = document.querySelector(".sec-billing-menu-toggle");
  if (!header || !toggle) return;

  toggle.addEventListener("click", function () {
    var open = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  header.querySelectorAll(".sec-billing-header__cta a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 820px)").matches) {
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });
})();
