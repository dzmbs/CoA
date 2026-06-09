# CoA — demo runbook

## 0. One-time setup (5 min)

```bash
pnpm install
```

Env is already wired:
- `packages/app/.env` — Privy app id set, `VITE_CHAIN=monad`, API at :8787.
- `packages/server/.env` — Privy secret set, `CHAIN=monad`.

**Optional but recommended for the "agents negotiate" story:**
- Add `ANTHROPIC_API_KEY=sk-ant-...` to `packages/server/.env` → the `Atlas` solver becomes a
  real Claude negotiator instead of a deterministic fallback.

**Wallet:** install MetaMask (or use Privy's embedded wallet via email). For the on-chain finale
fund the wallet with a few **MON** (gas + collateral) on Monad mainnet.

## 1. Start everything

```bash
pnpm dev:all     # app on http://localhost:5173, solver service on :8787
```

Sanity check the service is reading a live rate:
```bash
curl -s localhost:8787/health     # expect "live":true and a usdcBorrowBps
```

## 2. The two demo modes

### Mode A — off-chain (bulletproof, zero gas) ← default, use this for the main run
Everything is real except the settlement transaction: real wallet, real EIP-712 signature, real
solver auction (13 agents incl. Claude), real Neverland rate, real balance reads. Positions are
recorded in the service. **Nothing can fail live.**

### Mode B — real on-chain borrow on Neverland (Aave V3, live on Monad)
No deploy needed — Neverland is already live with liquidity (~12M USDC borrowable, 46M WMON
supplied). Pick **MON** collateral + **USDC** borrow, connect a funded wallet, and "Create
position" runs the real flow: wrap MON → WMON, `supply` as collateral, `borrow` USDC.

**Setup:** fund the connected wallet with a few **MON** (gas + collateral). That's it.

Verify the path headless before the demo:
```bash
PRIVATE_KEY=0x<funded-key> MON_COLLATERAL=3 USDC_BORROW=1 node scripts/neverland-borrow.mjs
```
This wraps 3 MON, supplies it, borrows 1 USDC on Neverland mainnet, and prints the tx hashes.

## 3. The script (≈4 min)

1. **Land.** Open `:5173` → the landing page. One line: *"Credit that negotiates itself."* Point at
   the live stat strip — **the market rate is read on-chain from Neverland right now**. Hit **Launch app**.
2. **Connect.** Connect Wallet (real Privy). Show the **real MON balance** appear in the nav.
3. **Build the intent.** 100k USDC, ETH/WBTC collateral, 45 days, max 8.14%. Note the collateral
   "max" shows your **real wallet balance** for verified tokens.
4. **Set the mandate.** This is the pitch: forced-close floor, grace, premium. *"This is what a
   trading order doesn't have — and why it needs an agent, not an algorithm."*
5. **Find best fill →** the **Agent Arena**. ~13 solver agents quote in real time: P2P peers, OTC
   desks, open-market venues (real Morpho/Euler logos). A couple quote **above your ceiling and get
   struck out**. The winner — usually a P2P peer — emerges *under* your max, capturing the spread.
6. **The fill.** Show the bond the winner posts and the mandate clauses it's slashable against.
7. **Create position.** (Mode B: approve + on-chain escrow tx; Mode A: recorded off-chain.) → it
   appears in **Positions** with live mandate-health.

### Optional live flourish — spin up a solver on stage
In a second terminal, *while an intent is resting*, run your own agent and watch it post a quote
that can win the auction:
```bash
pnpm --filter @mfi/server agent -- --name "JudgesDesk" --lane otc --edge -40
```
*"The solver network is open — anyone, human or bot, can compete to fill intents."*

## 4. Scope

On-chain / live: wallet + EIP-712 signing, the orderbook + solver auction, the solver agents
(incl. the Claude negotiator), the open-market borrow rate (read from Neverland), MON/ERC-20
balance reads, and the Mode-B supply+borrow on Neverland. Token + protocol + firm logos load from
their official sources.

Seeded for the walkthrough: the Open-Intents book and Dashboard rows (Positions is live), and the
display prices used for LTV/health bars. The Mode-B on-chain path uses MON/WMON collateral against
USDC.

## 5. Troubleshooting
- **Arena shows few/odd nodes or `valid=undefined`:** a stale server is bound to :8787 —
  `lsof -ti:8787 | xargs kill -9` then restart.
- **Rate shows fallback (`live:false`):** RPC blip; the auction still runs on the fallback base.
- **Wrong network in wallet:** the nav shows a "Switch to Monad" button — click it.
- **No Claude negotiation:** `ANTHROPIC_API_KEY` not set — Atlas uses its deterministic fallback.
