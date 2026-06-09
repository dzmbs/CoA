# Deploying CoA

Two pieces:
- **Server** (`packages/server`) — orderbook + solver network (always-on Node service).
- **Frontend** (`packages/app`) — Vite app, built and served as a static site.

Both run great on **Railway** as two services in one project. The submission URL is the frontend service's public domain.

---

## Railway (both services, one project)

Push the repo to GitHub, then in Railway: **New Project → Deploy from GitHub repo**. Add **two services** from the same repo.

### Service 1 — `coa-server`
- **Settings → Build:** `corepack enable && pnpm install`
- **Settings → Deploy / Start command:** `pnpm --filter @mfi/server start`
- **Variables:**
  - `CHAIN=monad`
  - `PRIVY_APP_ID=` (your Privy app id)
  - `PRIVY_APP_SECRET=` (your Privy secret)
  - `ANTHROPIC_API_KEY=` (optional — enables the Claude solver)
- Railway injects `PORT` automatically; the server reads it.
- **Networking → Generate Domain.** Copy it, e.g. `https://coa-server.up.railway.app`.
- Verify: open `…/health` → `{"ok":true, ... "live":true}`.

### Service 2 — `coa-web`
- **Settings → Build:** `corepack enable && pnpm install && pnpm --filter @mfi/app build`
- **Settings → Start command:** `pnpm --filter @mfi/app preview`
  (serves `dist` on `$PORT`, any host — already configured in `vite.config.ts`).
- **Variables** (these are read at **build time**, so set them before/redeploy after):
  - `VITE_PRIVY_APP_ID=` (your Privy app id)
  - `VITE_CHAIN=monad`
  - `VITE_API_URL=` (the `coa-server` domain from above, no trailing slash)
- **Networking → Generate Domain** → this is your demo URL.

### Privy dashboard
dashboard.privy.io → your app → **Allowed origins** → add the `coa-web` domain
(`https://coa-web.up.railway.app`). Wallet login fails on unlisted origins.

### Checklist
- [ ] `coa-server` up, `/health` returns `live:true`
- [ ] `coa-web` built with `VITE_API_URL` pointing at `coa-server`
- [ ] `coa-web` domain added to Privy allowed origins
- [ ] Open the `coa-web` URL → landing loads, Connect Wallet works, arena solves

> Tip: if you change a `VITE_*` variable, redeploy `coa-web` — Vite bakes them in at build time.

---

## Alternative: Vercel (frontend) + Railway (server)

`vercel.json` is included if you'd rather host the static frontend on Vercel's CDN:
import the repo on Vercel (build is preconfigured), set the same `VITE_*` env vars, and point
`VITE_API_URL` at the Railway `coa-server`. Add the `*.vercel.app` domain to Privy allowed origins.
