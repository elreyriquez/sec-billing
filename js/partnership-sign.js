/**
 * Partnership signature pad + submit to billing app API.
 */
(function () {
  var body = document.body;
  var partnerSlug = body.getAttribute("data-partner-slug") || "anna";
  var agreementVersion = body.getAttribute("data-agreement-version") || "anna-v1-2026-05";

  var form = document.getElementById("partnership-sign-form");
  var panel = document.getElementById("partnership-sign-panel");
  var canvas = document.getElementById("signature-canvas");
  var clearBtn = document.getElementById("signature-clear");
  var errorEl = document.getElementById("partnership-sign-error");
  var submitBtn = document.getElementById("partnership-sign-submit");
  var successEl = document.getElementById("partnership-sign-success");
  var successMeta = document.getElementById("partnership-sign-success-meta");

  if (!form || !canvas) return;

  var ctx = canvas.getContext("2d");
  var drawing = false;
  var hasStroke = false;
  var dpr = window.devicePixelRatio || 1;

  function resizeCanvas() {
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(300, Math.floor(rect.width));
    var h = 140;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.strokeStyle = "#102030";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function pointerPos(e) {
    var rect = canvas.getBoundingClientRect();
    var clientX = e.clientX;
    var clientY = e.clientY;
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e) {
    e.preventDefault();
    drawing = true;
    var p = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function moveDraw(e) {
    if (!drawing) return;
    e.preventDefault();
    var p = pointerPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    hasStroke = true;
  }

  function endDraw() {
    drawing = false;
  }

  function clearSignature() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStroke = false;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", moveDraw);
  canvas.addEventListener("mouseup", endDraw);
  canvas.addEventListener("mouseleave", endDraw);
  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", moveDraw, { passive: false });
  canvas.addEventListener("touchend", endDraw);

  if (clearBtn) clearBtn.addEventListener("click", clearSignature);

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
  }

  function apiBase() {
    var cfg = window.SEC_CONFIG || {};
    return String(cfg.BILLING_APP_BASE || "").replace(/\/$/, "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    showError("");

    var name = (form.signerName && form.signerName.value) || "";
    var email = (form.signerEmail && form.signerEmail.value) || "";
    var website = (form.website && form.website.value) || "";

    if (!name.trim() || name.trim().length < 2) {
      showError("Please enter your full legal name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showError("Please enter a valid email address.");
      return;
    }
    if (!form.readTerms || !form.readTerms.checked) {
      showError("Please confirm you have read the terms.");
      return;
    }
    if (!form.authorityToSign || !form.authorityToSign.checked) {
      showError("Please confirm you have authority to sign.");
      return;
    }
    if (!form.agreeRevenueShare || !form.agreeRevenueShare.checked) {
      showError("Please agree to the revenue share structure.");
      return;
    }
    if (!hasStroke) {
      showError("Please draw your signature on the pad.");
      return;
    }

    var base = apiBase();
    if (!base) {
      showError("App URL is not configured. Contact SEC to complete signing.");
      return;
    }

    var signatureDataUri = canvas.toDataURL("image/png");

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    fetch(base + "/api/partnership/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerSlug: partnerSlug,
        agreementVersion: agreementVersion,
        signerName: name.trim(),
        signerEmail: email.trim(),
        signatureDataUri: signatureDataUri,
        acknowledgments: {
          readTerms: true,
          authorityToSign: true,
          agreeRevenueShare: true,
        },
        website: website,
      }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          var msg =
            (result.data && result.data.error) ||
            "Submission failed. Please try again or email 1secfreelance@gmail.com.";
          showError(msg);
          submitBtn.disabled = false;
          submitBtn.textContent = "Sign and submit";
          return;
        }
        if (panel) panel.classList.add("partnership-form--signed");
        if (successEl) successEl.hidden = false;
        if (successMeta && result.data && result.data.acknowledgedAt) {
          successMeta.textContent =
            "Recorded at " + new Date(result.data.acknowledgedAt).toLocaleString() + ". Reference: " + (result.data.id || "");
        }
        var agreement = document.getElementById("agreement");
        if (agreement) agreement.scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch(function () {
        showError("Network error. Check your connection and try again.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign and submit";
      });
  });
})();
