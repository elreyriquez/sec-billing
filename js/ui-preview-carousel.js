(function () {
  var root = document.querySelector("[data-ui-carousel]");
  if (!root) return;

  var track = root.querySelector("[data-ui-carousel-track]");
  var slides = root.querySelectorAll(".marketing-ui-previews__slide");
  var prevBtn = root.querySelector("[data-carousel-prev]");
  var nextBtn = root.querySelector("[data-carousel-next]");
  var dots = root.querySelectorAll("[data-carousel-dot]");
  var caption = root.querySelector("[data-carousel-caption]");

  var titles = ["Dashboard", "Clients", "Invoices"];
  var index = 0;
  var n = slides.length;

  function go(nextIndex) {
    index = ((nextIndex % n) + n) % n;
    if (track) {
      track.style.transform = "translateX(-" + index * 100 + "%)";
    }
    for (var i = 0; i < slides.length; i++) {
      var on = i === index;
      slides[i].setAttribute("aria-hidden", on ? "false" : "true");
    }
    for (var d = 0; d < dots.length; d++) {
      dots[d].setAttribute("aria-selected", d === index ? "true" : "false");
    }
    if (caption && titles[index]) caption.textContent = titles[index];
  }

  function prev() {
    go(index - 1);
  }

  function next() {
    go(index + 1);
  }

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);

  for (var di = 0; di < dots.length; di++) {
    (function (j) {
      dots[j].addEventListener("click", function () {
        go(parseInt(dots[j].getAttribute("data-carousel-dot"), 10));
      });
    })(di);
  }

  /* Collapsible invoice group (optional motion) */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-inv-group-toggle]");
    if (!btn || !root.contains(btn)) return;
    var expanded = btn.getAttribute("aria-expanded") === "true";
    var nextExpanded = !expanded;
    btn.setAttribute("aria-expanded", nextExpanded ? "true" : "false");
    var panel = document.getElementById(btn.getAttribute("aria-controls") || "");
    if (panel) {
      panel.classList.toggle("sec-billing-inv-preview__nested-wrap--collapsed", !nextExpanded);
      btn.classList.toggle("is-collapsed", !nextExpanded);
    }
  });

  go(0);
})();
