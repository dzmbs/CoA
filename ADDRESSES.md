# Address book & verification status

Researched June 2026. The machine-readable source of truth is
[`packages/shared/src/addresses.ts`](./packages/shared/src/addresses.ts) — this file is the
human summary. **Nothing is invented**: every address has a source; gaps are flagged, not faked.

## Networks

| | Chain ID | RPC | Explorer | Native |
|---|---|---|---|---|
| Monad mainnet | `143` | https://rpc.monad.xyz | https://monadscan.com | MON |
| Monad testnet | `10143` | https://testnet-rpc.monad.xyz | https://testnet.monadexplorer.com | MON (faucet) |

## ✅ Verified (mainnet, chain 143)

| What | Address | Source |
|---|---|---|
| USDC | `0x754704Bc059F8C67012fEd69BC8A327a5aafb603` | monadscan |
| WBTC | `0x0555E30da8f98308EdB960aa94C0Db47230d2B9c` | monadscan |
| aprMON (aPriori LST) | `0xb2f82D0f38dc453D596Ad40A37799446Cc89274A` | apriori docs |
| Neverland Pool (Aave-v3 proxy) | `0x80F00661b13CC5F6ccd3885bE7b4C9c67545D585` | docs.neverland.money |
| Neverland PoolDataProvider | `0xfd0b6b6F736376F7B99ee989c749007c7757fDba` | docs.neverland.money |
| Curvance CentralRegistry | `0x1310f352f1389969Ece6741671c4B919523912fF` | docs.curvance.com |
| Curvance Market Manager (caprMON/cWMON) | `0x5EA0a1Cf3501C954b64902c5e92100b8A2CaB1Ac` | docs.curvance.com |

## ⚠️ Needs confirmation before use

| What | Status | Action |
|---|---|---|
| **Morpho Blue singleton** | research returned `0xBBBB…FFCb` — **same address as Euler EVC**, which is suspicious | Open the Monad selector at docs.morpho.org/get-started/resources/addresses and confirm |
| **Euler V2 EVC + EVK vaults** | not found for Monad | docs.euler.finance address selector → choose Monad |

## ❌ Could NOT find — paths disabled until filled

| What | Note |
|---|---|
| **WETH (mainnet)** | testnet WETH = `0xb5a30b0fdc5ea94a52fdc42e3e9760cb8449fb37`; mainnet unknown. Blocks ETH/WETH collateral. |
| **USDT (mainnet)** | unconfirmed |
| **DAI (mainnet)** | unconfirmed |
| **aPriori staking vault** | only the aprMON token is known |

## Logos to download

Already present in `design/assets/` (→ copied to `packages/app/public/assets/`): Monad mark,
MON, WMON, Monad logos/avatar.

**Still needed** (currently rendered as colored-glyph fallbacks):
- Protocol marks: **Morpho, Euler, Neverland, Curvance, aPriori**
- Token marks: **USDC, USDT, DAI, WBTC, WETH, stETH**

OTC desk names (Keyrock / Wintermute / Flow Traders) are illustrative text avatars — no logos needed.

## Our own contracts

`IntentEscrow` and `SolverBond` are deployed by us (`contracts/script/Deploy.s.sol`). Their
addresses get written into `MFI_CONTRACTS` in `addresses.ts` after deploy. **Mainnet deploy
needs your deployer key + real MON for gas** — that step can't be automated here.
