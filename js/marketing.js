(function () {
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initCarousel(root, options) {
    var track = root.querySelector("[data-carousel-track]");
    var viewport = root.querySelector("[data-carousel-viewport]");
    var slides = track ? track.querySelectorAll("[data-carousel-slide]") : [];
    var btnPrev = root.querySelector("[data-carousel-prev]");
    var btnNext = root.querySelector("[data-carousel-next]");
    var dotsRoot = root.querySelector("[data-carousel-dots]");
    if (!track || !slides.length) return;

    var dotClass = root.hasAttribute("data-bubble-carousel")
      ? "feature-bubble-carousel__dot"
      : "marketing-carousel__dot";

    var index = 0;
    var autoplayMs = options.autoplayMs || 0;
    var timer = null;

    function slideWidth() {
      return viewport ? viewport.getBoundingClientRect().width : slides[0].getBoundingClientRect().width;
    }

    function updateDots() {
      if (!dotsRoot) return;
      var dots = dotsRoot.querySelectorAll("button");
      dots.forEach(function (d, i) {
        d.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    function applyTransform() {
      var w = slideWidth();
      track.style.transform = "translateX(" + -index * w + "px)";
      if (btnPrev) btnPrev.disabled = index <= 0;
      if (btnNext) btnNext.disabled = index >= slides.length - 1;
      updateDots();
    }

    function go(delta) {
      var next = index + delta;
      next = Math.max(0, Math.min(slides.length - 1, next));
      if (next === index) return;
      index = next;
      applyTransform();
    }

    function goTo(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      applyTransform();
    }

    function scheduleAutoplay() {
      if (!autoplayMs || prefersReducedMotion()) return;
      clearInterval(timer);
      timer = setInterval(function () {
        if (index >= slides.length - 1) goTo(0);
        else go(1);
      }, autoplayMs);
    }

    if (dotsRoot && slides.length) {
      dotsRoot.innerHTML = "";
      for (var i = 0; i < slides.length; i++) {
        (function (ii) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = dotClass;
          b.setAttribute("aria-label", "Go to slide " + (ii + 1));
          b.addEventListener("click", function () {
            goTo(ii);
            scheduleAutoplay();
          });
          dotsRoot.appendChild(b);
        })(i);
      }
    }

    if (btnPrev) btnPrev.addEventListener("click", function () { go(-1); scheduleAutoplay(); });
    if (btnNext) btnNext.addEventListener("click", function () { go(1); scheduleAutoplay(); });

    window.addEventListener(
      "resize",
      function () {
        applyTransform();
      },
      { passive: true }
    );

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
        scheduleAutoplay();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
        scheduleAutoplay();
      }
    });

    applyTransform();
    scheduleAutoplay();

    root.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });
    root.addEventListener("mouseleave", function () {
      scheduleAutoplay();
    });
  }

  document.querySelectorAll("[data-ui-carousel]").forEach(function (el) {
    initCarousel(el, { autoplayMs: 6500 });
  });

  document.querySelectorAll("[data-bubble-carousel]").forEach(function (el) {
    initCarousel(el, { autoplayMs: 5500 });
  });

  document.querySelectorAll("[data-hero-carousel]").forEach(function (el) {
    initCarousel(el, { autoplayMs: 6000 });
  });
})();
