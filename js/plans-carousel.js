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
        go(parseInt(dots[j].getAttribute("data-plan-dot"), 10));
      });
    })(di);
  }

  go(0);
})();
