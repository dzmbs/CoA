import type { Quote } from "@mfi/shared/intent";
import { type Solver, type SolveContext, bondFor, ceilingBps, saltJitter } from "./types.js";

/**
 * The competing market-making desks. Each prices off the live market base with a
 * reputation-driven edge and a term adjustment; some land above the borrower's
 * ceiling and lose (matching marks them invalid).
 */

interface Bot {
  id: string;
  name: string;
  lane: "p2p" | "otc";
  /** bps offset from market base (negative = aggressive undercut) */
  edge: number;
  declineProb: number;
}

const BOTS: Bot[] = [
  // P2P peer agents
  { id: "velvet", name: "Velvet", lane: "p2p", edge: -34, declineProb: 0.04 },
  { id: "solver-delta", name: "Solver-Δ", lane: "p2p", edge: -19, declineProb: 0.04 },
  { id: "cobalt", name: "Cobalt", lane: "p2p", edge: -8, declineProb: 0.06 },
  { id: "halo", name: "Halo", lane: "p2p", edge: 6, declineProb: 0.08 },
  { id: "nyx", name: "Nyx", lane: "p2p", edge: 42, declineProb: 0.03 },
  // OTC desks
  { id: "keyrock", name: "Keyrock", lane: "otc", edge: -27, declineProb: 0.04 },
  { id: "wintermute", name: "Wintermute", lane: "otc", edge: -12, declineProb: 0.04 },
  { id: "gsr", name: "GSR", lane: "otc", edge: -3, declineProb: 0.06 },
  { id: "flowtraders", name: "Flow Traders", lane: "otc", edge: 9, declineProb: 0.08 },
  { id: "amber", name: "Amber", lane: "otc", edge: 52, declineProb: 0.03 },
];

function priceQuote(bot: Bot, ctx: SolveContext): Quote | null {
  const { intent, marketBaseBps } = ctx;
  if (!intent.lanes.includes(bot.lane)) return null;

  const j = saltJitter(intent, bot.id.length);
  if (j < bot.declineProb) return null; // occasionally declines

  const termAdj = Math.round((intent.termDays - 30) * 0.25);
  const jitter = Math.round((j - 0.5) * 12); // ±6 bps
  const rateBps = Math.max(300, marketBaseBps + bot.edge + termAdj + jitter);

  // ceiling validity is flagged here; matching.ts selects the winning quote.
  const valid = rateBps <= ceilingBps(intent);

  return {
    intentId: ctx.intentId,
    solverId: bot.id,
    solverName: bot.name,
    lane: bot.lane,
    rateBps,
    bond: bondFor(intent, bot.lane),
    valid,
    rationale:
      bot.lane === "p2p"
        ? `Matched the other side of your trade — keeping ${Math.max(0, marketBaseBps - rateBps)}bps of the spread as upside.`
        : `Desk fill from inventory at ${(rateBps / 100).toFixed(2)}%.`,
    ts: Date.now(),
  };
}

export const scriptedSolvers: Solver[] = BOTS.map((bot) => ({
  id: bot.id,
  name: bot.name,
  lane: bot.lane,
  async quote(ctx) {
    return priceQuote(bot, ctx);
  },
}));
