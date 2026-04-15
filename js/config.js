/**
 * SEC Billing marketing site — minimal config for this repo only.
 * Set BILLING_APP_BASE to your deployed Next app (no trailing slash).
 */
window.SEC_CONFIG = {
  /** How many JMD equal 1 USD — used by currency toggle if shown. */
  JMD_PER_USD: 156,
  /**
   * SEC Billing (Next.js app). Public site root URL, no trailing slash.
   * Sign up / Sign in on this site use this base.
   * Local: http://127.0.0.1:3000 with billing-invoice-system running.
   * Production: https://your-app.up.railway.app
   */
  BILLING_APP_BASE: "http://127.0.0.1:3000",
};
