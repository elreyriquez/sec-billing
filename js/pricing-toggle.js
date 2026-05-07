(function () {
  var toggle = document.querySelector("[data-cycle-toggle]");
  var grid = document.querySelector("[data-pricing-grid]");
  if (!toggle || !grid) return;

  var buttons = toggle.querySelectorAll("[data-cycle]");

  function setCycle(cycle) {
    grid.setAttribute("data-cycle", cycle);
    document.body.setAttribute("data-pricing-cycle", cycle);
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var on = btn.getAttribute("data-cycle") === cycle;
      btn.classList.toggle("billing-cycle-toggle__btn--active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  for (var i = 0; i < buttons.length; i++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        setCycle(btn.getAttribute("data-cycle"));
      });
    })(buttons[i]);
  }

  setCycle(grid.getAttribute("data-cycle") || "monthly");
})();
