/**
 * The CoA (Coincidence of Agents) credit intent — adapts CoW's GPv2Order to lending/borrowing.
 *
 * A user signs this EIP-712 struct. It rests in the orderbook until a solver
 * (P2P peer agent / OTC desk / open-market router) fills it. The `mandate`
 * fields are the objective constraints a solver's bond is slashed against —
 * the part a plain trading order does not have.
 */

export type Side = "borrow" | "lend";
export type Lane = "p2p" | "otc" | "open";

export interface CreditMandate {
  /** Forced-close only if collateral drops at least this % from entry (drawdown buffer). */
  floorPct: number;
  /** Hours of grace at the floor before any liquidation. */
  graceHours: number;
  /** Extra APR (in %) the borrower will pay for the above guarantees. */
  premiumPct: number;
}

export interface CreditIntent {
  /** EIP-712 nonce / uniqueness. */
  salt: `0x${string}`;
  owner: `0x${string}`;
  side: Side;

  collateralToken: `0x${string}`;
  collateralAmount: string; // base units (string to survive JSON)
  debtToken: `0x${string}`;
  debtAmount: string; // base units

  termDays: number;
  /** Max acceptable APR in basis points (e.g. 814 = 8.14%). Integer for on-chain friendliness. */
  maxRateBps: number;

  /** Which lanes this intent may fill through. */
  lanes: Lane[];

  mandate: CreditMandate;

  /** Unix seconds; intent invalid after this. */
  validTo: number;
}

/** A solver's quote against an intent. */
export interface Quote {
  intentId: string;
  solverId: string;
  solverName: string;
  lane: Lane;
  /** Offered APR in basis points; must be <= intent.maxRateBps (+ premium) to be valid. */
  rateBps: number;
  /** Bond the solver will post, in debt-token base units. */
  bond: string;
  /** Free-text rationale — for LLM solvers this is the negotiation message. */
  rationale?: string;
  /** true if the quote is at/under the borrower's ceiling (eligible to win). */
  valid?: boolean;
  ts: number;
}

/* --------------------------- EIP-712 typed data --------------------------- */

export const EIP712_DOMAIN_NAME = "CoA Credit";
export const EIP712_DOMAIN_VERSION = "v1";

/** Domain is bound to chain + the IntentEscrow verifying contract (set at runtime). */
export function creditIntentDomain(chainId: number, verifyingContract: `0x${string}`) {
  return {
    name: EIP712_DOMAIN_NAME,
    version: EIP712_DOMAIN_VERSION,
    chainId,
    verifyingContract,
  } as const;
}

export const CREDIT_INTENT_TYPES = {
  Mandate: [
    { name: "floorPct", type: "uint16" },
    { name: "graceHours", type: "uint16" },
    { name: "premiumPct", type: "uint16" }, // stored as bps-of-percent *100 if needed; see encode helper
  ],
  CreditIntent: [
    { name: "salt", type: "bytes32" },
    { name: "owner", type: "address" },
    { name: "side", type: "string" },
    { name: "collateralToken", type: "address" },
    { name: "collateralAmount", type: "uint256" },
    { name: "debtToken", type: "address" },
    { name: "debtAmount", type: "uint256" },
    { name: "termDays", type: "uint16" },
    { name: "maxRateBps", type: "uint16" },
    { name: "validTo", type: "uint64" },
    { name: "mandate", type: "Mandate" },
  ],
} as const;

/** Build the EIP-712 `message` from a CreditIntent (numbers -> uint-safe values). */
export function toTypedMessage(intent: CreditIntent) {
  return {
    salt: intent.salt,
    owner: intent.owner,
    side: intent.side,
    collateralToken: intent.collateralToken,
    collateralAmount: BigInt(intent.collateralAmount),
    debtToken: intent.debtToken,
    debtAmount: BigInt(intent.debtAmount),
    termDays: intent.termDays,
    maxRateBps: intent.maxRateBps,
    validTo: BigInt(intent.validTo),
    mandate: {
      floorPct: intent.mandate.floorPct,
      graceHours: intent.mandate.graceHours,
      // premium stored as integer percent*100 (so 0.40% -> 40)
      premiumPct: Math.round(intent.mandate.premiumPct * 100),
    },
  };
}

/** Deterministic id for an intent (used as orderbook key before on-chain UID exists). */
export function intentKey(intent: Pick<CreditIntent, "owner" | "salt">): string {
  return `${intent.owner.toLowerCase()}:${intent.salt}`;
}
