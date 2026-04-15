# SEC Billing — marketing site

Static **pricing & features** page for [SEC Billing](https://github.com/elreyriquez/billing-invoice-system), hosted separately from the freelance [SEC services / quotation](https://github.com/elreyriquez/sec-services) site.

**Live (after GitHub Pages is enabled):** `https://elreyriquez.github.io/sec-billing/`

## Setup

1. Create the GitHub repo **`sec-billing`** (or use this folder as the repo root) and push.
2. **GitHub → Settings → Pages:** Source **Deploy from a branch**, branch **`main`**, folder **`/` (root)**.
3. Edit **`js/config.js`:** set **`BILLING_APP_BASE`** to your production billing app URL (same value you use in Railway for `NEXTAUTH_URL` / app root).

The billing app and [sec-services `software.html`](https://elreyriquez.github.io/sec-services/software.html) link to this site for plans and sign-up.

## Local preview

From this directory:

```bash
npx --yes serve -p 5050
```

Open `http://127.0.0.1:5050` and set `BILLING_APP_BASE` to `http://127.0.0.1:3000` while the Next app runs locally.
