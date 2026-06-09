import type { CreditIntent, Lane, Quote } from "@mfi/shared/intent";

export type IntentStatus = "resting" | "matching" | "filled" | "expired";

export interface StoredIntent {
  id: string;
  intent: CreditIntent;
  signature: `0x${string}` | null;
  status: IntentStatus;
  createdAt: number;
  /** all quotes seen for this intent (scripted + llm + open + human) */
  quotes: Quote[];
  /** winning quote once solved */
  winner?: Quote;
}

export interface SolveResult {
  intentId: string;
  quotes: Quote[];
  winner: Quote;
  /** bps the winner beats the ceiling by */
  savedBps: number;
  /** true if the winner is a P2P coincidence-of-agents match with captured upside */
  upside: boolean;
  marketBaseBps: number;
}

export interface Position {
  id: string;
  owner: string;
  borrow: number;
  asset: string;
  coll: string;
  collAmt: number;
  rate: number; // % APR
  max: number; // % ceiling
  lane: Lane;
  filler: string;
  maturityDays: number;
  floorPrice: number;
  entryPrice: number;
  curPrice: number;
  bond: number;
  bondHealth: "safe" | "watch" | "open" | "breached";
  createdAt: number;
}
