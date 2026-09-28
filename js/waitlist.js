/**
 * Waitlist form (waitlist.html): client-side validation + JSON POST.
 *
 * Submits to window.SEC_CONFIG.WAITLIST_ENDPOINT (js/config.js).
 * If that is empty, NOTHING is sent and the page shows a clear
 * "Sign-ups aren't connected yet" notice. It never pretends to succeed.
 */
(function () {
  var form = document.getElementById("waitlist-form");
  if (!form) return;

  var statusEl = document.getElementById("waitlist-status");
  var successEl = document.getElementById("waitlist-success");
  var submitBtn = document.getElementById("waitlist-submit");
  var submitLabel = submitBtn ? submitBtn.textContent : "Join the waitlist";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var FALLBACK_CONTACT = "1secfreelance@gmail.com";

  function endpoint() {
    var cfg = window.SEC_CONFIG || {};
    return String(cfg.WAITLIST_ENDPOINT || "").trim();
  }

  function fieldError(input, message) {
    var errId = input.id + "-error";
    var errEl = document.getElementById(errId);
    var wrap = input.closest(".waitlist-field");
    if (message) {
      input.setAttribute("aria-invalid", "true");
      if (wrap) wrap.classList.add("waitlist-field--invalid");
      if (errEl) {
        errEl.textContent = message;
        errEl.hidden = false;
      }
    } else {
      input.removeAttribute("aria-invalid");
      if (wrap) wrap.classList.remove("waitlist-field--invalid");
      if (errEl) {
        errEl.textContent = "";
        errEl.hidden = true;
      }
    }
  }

  function validateField(input) {
    var v = input.type === "checkbox" ? input.checked : String(input.value || "").trim();
    switch (input.name) {
      case "name":
        if (!v) return "Please enter your name.";
        if (v.length < 2) return "Please enter at least 2 characters.";
        return "";
      case "email":
        if (!v) return "Please enter your email address.";
        if (!EMAIL_RE.test(v)) return "Please enter a valid email address, like name@company.com.";
        return "";
      case "businessType":
        return v ? "" : "Please choose your business type.";
      case "teamSize":
        return v ? "" : "Please choose your team size.";
      case "launchEmailsOptIn":
        return v ? "" : "Please tick this box so we can email you when SEC Billing launches.";
      default:
        return "";
    }
  }

  var validated = ["name", "email", "businessType", "teamSize", "launchEmailsOptIn"].map(function (n) {
    return form.elements[n];
  });

  function validateAll() {
    var firstInvalid = null;
    validated.forEach(function (input) {
      var msg = validateField(input);
      fieldError(input, msg);
      if (msg && !firstInvalid) firstInvalid = input;
    });
    return firstInvalid;
  }

  // Re-validate a field once the user has interacted with it.
  validated.forEach(function (input) {
    var evt = input.tagName === "SELECT" || input.type === "checkbox" ? "change" : "blur";
    input.addEventListener(evt, function () {
      fieldError(input, validateField(input));
    });
    if (input.tagName === "INPUT" && input.type !== "checkbox") {
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") fieldError(input, validateField(input));
      });
    }
  });

  function showStatus(kind, html) {
    if (!statusEl) return;
    statusEl.className = "waitlist-status waitlist-status--" + kind;
    statusEl.innerHTML = html;
    statusEl.hidden = false;
  }

  function clearStatus() {
    if (!statusEl) return;
    statusEl.hidden = true;
    statusEl.innerHTML = "";
    statusEl.className = "waitlist-status";
  }

  function setBusy(busy) {
    if (!submitBtn) return;
    submitBtn.disabled = busy;
    submitBtn.setAttribute("aria-busy", busy ? "true" : "false");
    submitBtn.textContent = busy ? "Joining…" : submitLabel;
  }

  function showSuccess() {
    form.hidden = true;
    var head = document.querySelector(".waitlist-card__head");
    if (head) head.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      successEl.focus();
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearStatus();

    var firstInvalid = validateAll();
    if (firstInvalid) {
      showStatus("error", "Please fix the highlighted fields and try again.");
      firstInvalid.focus();
      return;
    }

    var payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim().toLowerCase(),
      businessType: form.elements.businessType.value,
      teamSize: form.elements.teamSize.value,
      notes: form.elements.notes.value.trim(),
      launchEmailsOptIn: form.elements.launchEmailsOptIn.checked,
      website: form.elements.website.value, // honeypot, should be empty
      source: "billingdetails.secfreelance.com/waitlist",
      submittedAt: new Date().toISOString(),
    };

    // Honeypot filled: quietly drop (likely a bot) without contacting any server.
    if (payload.website) {
      console.warn("[waitlist] Honeypot field filled; submission ignored.");
      return;
    }

    var url = endpoint();
    if (!url) {
      // NOT CONNECTED: do not fake success.
      console.warn(
        "[waitlist] WAITLIST_ENDPOINT is empty in js/config.js; sign-up was NOT sent or stored.",
        payload
      );
      showStatus(
        "notice",
        "<strong>Sign-ups aren’t connected yet.</strong> This is a preview of the waitlist form, " +
          "so your details were not sent or saved. Please check back soon, or email " +
          '<a href="mailto:' + FALLBACK_CONTACT + '">' + FALLBACK_CONTACT + "</a> to be added manually."
      );
      return;
    }

    setBusy(true);
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return null;
          })
          .then(function (data) {
            return { ok: res.ok, status: res.status, data: data };
          });
      })
      .then(function (result) {
        setBusy(false);
        if (!result.ok) {
          var msg =
            (result.data && result.data.error) ||
            (result.status === 429
              ? "Too many attempts. Please wait a little and try again."
              : "We couldn’t add you to the waitlist just now.");
          showStatus(
            "error",
            escapeHtml(msg) + ' If this keeps happening, email <a href="mailto:' + FALLBACK_CONTACT + '">' + FALLBACK_CONTACT + "</a>."
          );
          return;
        }
        showSuccess();
      })
      .catch(function (err) {
        setBusy(false);
        console.error("[waitlist] Network error:", err);
        showStatus("error", "Network error. Please check your connection and try again.");
      });
  });

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
