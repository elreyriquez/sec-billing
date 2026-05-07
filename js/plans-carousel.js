(function () {
  var root = document.querySelector("[data-plans-carousel]");
  if (!root) return;

  var track = root.querySelector("[data-plans-track]");
  var slides = root.querySelectorAll(".billing-plans-carousel__slide");
  var prevBtn = root.querySelector("[data-plans-prev]");
  var nextBtn = root.querySelector("[data-plans-next]");
  var dots = root.querySelectorAll("[data-plan-dot]");
  var caption = root.querySelector("[data-plans-caption]");

  var titles = ["Studio & Agency", "Solo"];
  var index = 0;
  var n = slides.length;
  if (!n) return;

  function go(nextIndex) {
    index = ((nextIndex % n) + n) % n;
    if (track) {
      track.style.transform = "translateX(-" + index * 100 + "%)";
    }
    for (var i = 0; i < slides.length; i++) {
      slides[i].setAttribute("aria-hidden", i === index ? "false" : "true");
    }
    for (var d = 0; d < dots.length; d++) {
      var on = d === index;
      dots[d].setAttribute("aria-selected", on ? "true" : "false");
      dots[d].setAttribute("tabindex", on ? "0" : "-1");
    }
    if (caption && titles[index]) caption.textContent = titles[index];
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { go(index - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { go(index + 1); });

  function focusActiveDot() {
    var t = root.querySelectorAll("[data-plan-dot]")[index];
    if (t && typeof t.focus === "function") t.focus();
  }

  for (var di = 0; di < dots.length; di++) {
    (function (j) {
      dots[j].addEventListener("click", function () {
        go(parseInt(dots[j].getAttribute("data-plan-dot"), 10));
      });
      dots[j].addEventListener("keydown", function (ev) {
        if (ev.key === "ArrowRight") {
          ev.preventDefault();
          go(index + 1);
          focusActiveDot();
        } else if (ev.key === "ArrowLeft") {
          ev.preventDefault();
          go(index - 1);
          focusActiveDot();
        }
      });
    })(di);
  }

  go(0);
})();
