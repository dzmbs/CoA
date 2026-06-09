# CoA — intent-based credit on Monad

**Coincidence of agents** for lending/borrowing. Where CoW matches a buyer and seller of
the same pair directly (coincidence of wants) and falls back to AMMs, CoA does the same for
**credit**: you sign a credit intent + a *risk mandate*, and a network of solver agents
competes to fill it — peer-to-peer, OTC desk, or routed to real Monad lending markets.

The differentiator vs a trading order is the **mandate**: objective constraints (forced-close
floor, grace period, premium you'll pay) that a winning solver posts a **bond** against. Break
the mandate → bond is slashed to you. That's the part an *agent* handles that an algorithm can't:
multidimensional, personalized credit terms.

## Three fulfillment lanes

1. **P2P — coincidence of agents.** Another user's opposite intent matches yours directly. The
   matching agent can keep the spread as upside (CoW's surplus model).
2. **OTC solver.** A market-making desk agent fills the other side from inventory.
3. **Open market.** Fall back to real Monad lending protocols (Morpho / Euler / Neverland / Curvance).

## Monorepo layout

```
packages/
  shared/   @mfi/shared — credit-intent EIP-712 schema + the verified address book
  app/      @mfi/app    — Vite + React frontend, Privy + wagmi + viem on Monad
  server/   @mfi/server — off-chain orderbook + matching auction + solver agents (WIP)
contracts/  Foundry — IntentEscrow + SolverBond (WIP)
design/     original prototype (source of truth for the UI)
cow/        CoW Protocol reference (architecture we model on)
```

## Run the full stack

```bash
pnpm install
pnpm dev:all      # frontend (:5173) + orderbook/solver service (:8787) together
# or separately:
pnpm dev          # frontend only
pnpm dev:server   # orderbook + solver network only
```

- Frontend env is already wired in `packages/app/.env` (Privy app id set). Server env in
  `packages/server/.env`.
- **Connect Wallet is real** (MetaMask / embedded / WalletConnect) on Monad mainnet.
- `VITE_CHAIN=monad` (mainnet 143) or `monadTestnet` (10143).
- **Enable the real Claude negotiator:** add `ANTHROPIC_API_KEY=` to `packages/server/.env`.
  Without it, the `Atlas` solver uses a deterministic fallback.

### Run a solver agent (human or bot)

The solver network is open — anyone can point an agent at the orderbook and quote:

```bash
pnpm --filter @mfi/server agent -- --name "MyDesk" --lane otc --edge -15
```

It polls resting intents and posts quotes into their auctions — the same loop the built-in
solvers run.

### Deploy the contracts (needs your key + MON for mainnet gas)

```bash
cd contracts
forge test                                   # 4 passing tests
export PK=0x<deployer-private-key>
forge script script/Deploy.s.sol --rpc-url monad --broadcast --private-key $PK
```

Copy the printed address into `packages/shared/src/addresses.ts` → `MFI_CONTRACTS.escrow`.
Once set, "Create position" settles the collateral leg **on-chain** (approve + `openLoan`) for
verified collateral tokens; until then it records the position off-chain.

## Regenerating the UI module

The screens live in `design/*.jsx` (the prototype). `packages/app/src/mfi/App.jsx` is
**auto-assembled** from them — edit the design files and re-run:

```bash
node scripts/assemble.mjs
```

## Status — all layers built

- [x] **Frontend** — Vite + React, Privy + wagmi + viem, Monad mainnet, design migrated, real Connect Wallet + EIP-712 intent signing.
- [x] **Shared** — credit-intent EIP-712 schema + verified address book (no faked addresses).
- [x] **Orderbook + matching auction + monitor** — `packages/server`, the CoW-autopilot analog; mandate-breach monitor that flags slashable bonds.
- [x] **Solver agents** — 6 scripted desks + the `Atlas` Claude negotiator + a human/bot quote API + a standalone agent CLI loop.
- [x] **Contracts** — `MfiEscrow` (escrow + bond + slash), 4 passing Foundry tests, deploy script.
- [x] **Real rates** — live USDC borrow APR read from Neverland (Aave-v3 fork) on Monad; Morpho/Euler correctly gated off as unverified.
- [x] **On-chain settlement** — real supply+borrow on Neverland (Aave V3) on Monad mainnet: wrap MON → supply WMON → borrow USDC, sized to live borrowing power.

See [ADDRESSES.md](./ADDRESSES.md) for exactly what is and isn't on-chain-verified.
