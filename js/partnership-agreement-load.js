/**
 * Loads the Anna founding partner agreement HTML from the billing app API.
 */
(function () {
  var wrap = document.getElementById("partnership-legal-wrap");
  var loading = document.getElementById("partnership-legal-loading");
  var errorEl = document.getElementById("partnership-legal-error");
  var docEl = document.getElementById("partnership-legal-document");
  if (!wrap || !docEl) return;

  function showError(msg) {
    if (loading) loading.hidden = true;
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.hidden = false;
    }
    docEl.hidden = true;
  }

  function showDoc(html) {
    if (loading) loading.hidden = true;
    if (errorEl) errorEl.hidden = true;
    docEl.innerHTML = html;
    docEl.hidden = false;
    if (window.partnershipObserveReveals) window.partnershipObserveReveals();
  }

  var cfg = window.SEC_CONFIG || {};
  var base = String(cfg.BILLING_APP_BASE || "").replace(/\/$/, "");
  if (!base) {
    showError(
      "Agreement could not load (app URL not configured). Contact 1secfreelance@gmail.com for a PDF or copy."
    );
    return;
  }

  fetch(base + "/api/partnership/agreement/anna", { method: "GET", headers: { Accept: "application/json" } })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!data || typeof data.html !== "string" || !data.html.trim()) {
        throw new Error("Empty agreement");
      }
      showDoc(data.html);
    })
    .catch(function () {
      showError(
        "Agreement could not load right now. Refresh the page or email 1secfreelance@gmail.com and the SEC team will send you a copy."
      );
    });
})();
