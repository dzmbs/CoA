/* Client for the m.fi orderbook + solver network. */
import { TOKENS } from "@mfi/shared/addresses";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8787";
const ZERO = "0x0000000000000000000000000000000000000000";

// decimals for symbols the UI uses but the address book may not list
const DECIMALS = { USDC: 6, USDT: 6, DAI: 18, WBTC: 8, WETH: 18, ETH: 18, stETH: 18, MON: 18, BTC: 8, USD: 6, aprMON: 18 };

export function tokenAddress(sym) {
  const t = TOKENS[sym];
  return t?.address || ZERO;
}
export function decimalsOf(sym) {
  return TOKENS[sym]?.decimals ?? DECIMALS[sym] ?? 18;
}
function toBaseUnits(amount, sym) {
  const d = decimalsOf(sym);
  // integer math to avoid float dust
  const [whole, frac = ""] = String(amount).split(".");
  const fracPadded = (frac + "0".repeat(d)).slice(0, d);
  return (BigInt(whole || "0") * 10n ** BigInt(d) + BigInt(fracPadded || "0")).toString();
}
function randomSalt() {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return "0x" + [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/** Convert the UI's intent object into a signable CreditIntent. */
export function toCreditIntent(intent, owner) {
  return {
    salt: randomSalt(),
    owner: owner || ZERO,
    side: "borrow",
    collateralToken: tokenAddress(intent.collateralAsset),
    collateralAmount: toBaseUnits(intent.collAmount, intent.collateralAsset),
    debtToken: tokenAddress(intent.borrowAsset),
    debtAmount: toBaseUnits(intent.borrowAmount, intent.borrowAsset),
    termDays: intent.termDays,
    maxRateBps: Math.round(intent.maxRate * 100),
    lanes: intent.routes,
    mandate: {
      floorPct: intent.floorPct,
      graceHours: intent.grace,
      premiumPct: intent.payMore,
    },
    validTo: Math.floor(Date.now() / 1000) + intent.termDays * 86400 + 86400,
  };
}

async function jpost(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return r.json();
}
async function jget(path) {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return r.json();
}

export const api = {
  base: BASE,
  health: () => jget("/health"),
  rates: () => jget("/rates"),
  submitIntent: (creditIntent, signature) => jpost("/intents", { intent: creditIntent, signature: signature || null }),
  solve: (id) => jpost(`/intents/${encodeURIComponent(id)}/solve`, {}),
  openIntents: () => jget("/intents"),
  listPositions: (owner) => jget(`/positions${owner ? `?owner=${owner}` : ""}`),
  createPosition: (p) => jpost("/positions", p),
  postQuote: (id, q) => jpost(`/intents/${encodeURIComponent(id)}/quotes`, q),
};
