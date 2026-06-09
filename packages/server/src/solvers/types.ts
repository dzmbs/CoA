import type { CreditIntent, Lane, Quote } from "@mfi/shared/intent";

export interface SolveContext {
  intentId: string;
  intent: CreditIntent;
  /** market base borrow rate in bps (from the open-market read) */
  marketBaseBps: number;
}

export interface Solver {
  id: string;
  name: string;
  lane: Lane;
  /** returns a quote, or null if this solver declines the intent */
  quote(ctx: SolveContext): Promise<Quote | null>;
}

/** ceiling the quote must beat = max rate + the premium the borrower will pay */
export function ceilingBps(intent: CreditIntent): number {
  return intent.maxRateBps + Math.round(intent.mandate.premiumPct * 100);
}

/** deterministic 0..1 jitter from the intent salt so quotes are stable per-intent */
export function saltJitter(intent: CreditIntent, seed = 0): number {
  const hex = intent.salt.slice(2, 10);
  const n = parseInt(hex || "0", 16) + seed * 2654435761;
  return ((n >>> 0) % 1000) / 1000;
}

export function bondFor(intent: CreditIntent, lane: Lane): string {
  if (lane === "open") return "0";
  // 12% of debt notional, in debt-token base units
  return (BigInt(intent.debtAmount) * 12n) / 100n + "";
}
