import type { Quote } from "@mfi/shared/intent";
import { type Solver, bondFor, ceilingBps } from "./types.js";
import { PROTOCOLS } from "@mfi/shared/addresses";

/**
 * The open-market lane: routes to real Monad lending protocols. These quote the
 * live floating rate (no bond — there's no mandate guarantee on a public market).
 */

interface Venue {
  id: string;
  name: string;
  /** bps premium over the live market base */
  spread: number;
  verified: boolean;
}

const VENUES: Venue[] = [
  { id: "neverland", name: "Neverland", spread: 0, verified: PROTOCOLS.neverland.pool.verified },
  { id: "curvance", name: "Curvance", spread: 14, verified: PROTOCOLS.curvance.marketManager.verified },
  { id: "morpho", name: "Morpho Blue", spread: 8, verified: PROTOCOLS.morpho.singleton.verified },
  { id: "euler", name: "Euler", spread: 19, verified: PROTOCOLS.euler.evc.verified },
];

export const openMarketSolvers: Solver[] = VENUES.map((v) => ({
  id: v.id,
  name: v.name,
  lane: "open" as const,
  async quote(ctx): Promise<Quote | null> {
    const { intent, marketBaseBps } = ctx;
    if (!intent.lanes.includes("open")) return null;
    // only quote venues with confirmed contracts
    if (!v.verified) return null;

    const rateBps = marketBaseBps + v.spread;

    return {
      intentId: ctx.intentId,
      solverId: v.id,
      solverName: v.name,
      lane: "open",
      rateBps,
      bond: bondFor(intent, "open"),
      valid: rateBps <= ceilingBps(intent),
      rationale: `Open-market floating rate on ${v.name}. No bond — public market, no mandate guarantee.`,
      ts: Date.now(),
    };
  },
}));
