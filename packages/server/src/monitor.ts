import { store } from "./store.js";
import type { Position } from "./types.js";

/**
 * Watches open positions against their mandate. On a breach (collateral below the
 * floor past the grace window) the solver bond becomes slashable to the borrower.
 */

export function bondHealthOf(p: Position): Position["bondHealth"] {
  if (p.bond === 0) return "open";
  if (p.curPrice <= p.floorPrice) return "breached";
  const pct = (p.curPrice - p.floorPrice) / (p.entryPrice - p.floorPrice);
  return pct > 0.45 ? "safe" : "watch";
}

let timer: NodeJS.Timeout | null = null;

export function startMonitor() {
  if (timer) return;
  timer = setInterval(() => {
    for (const p of store.listPositions()) {
      // mean-reverting collateral drift per tick
      const drift = (Math.sin(Date.now() / 9e5 + p.id.length) * 0.004) * p.entryPrice;
      p.curPrice = Math.max(0, +(p.curPrice + drift).toFixed(2));
      const health = bondHealthOf(p);
      if (health === "breached" && p.bondHealth !== "breached") {
        console.log(`[monitor] MANDATE BREACH on ${p.id} — collateral ${p.curPrice} <= floor ${p.floorPrice}. Bond ${p.bond} slashable to ${p.owner}.`);
      }
      p.bondHealth = health;
    }
  }, 5000);
}
