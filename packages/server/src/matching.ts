import type { Quote } from "@mfi/shared/intent";
import type { SolveResult, StoredIntent } from "./types.js";
import { scriptedSolvers } from "./solvers/scripted.js";
import { openMarketSolvers } from "./solvers/openmarket.js";
import { llmSolver } from "./solvers/llm.js";
import { ceilingBps } from "./solvers/types.js";
import { getOpenMarketRate } from "./rates.js";
import { store } from "./store.js";

const allSolvers = [llmSolver, ...scriptedSolvers, ...openMarketSolvers];

/** Look for a resting opposite intent that matches — a true coincidence of agents. */
function findCoincidence(s: StoredIntent, marketBaseBps: number): Quote | null {
  const want = s.intent;
  const opp = store
    .listIntents()
    .find(
      (o) =>
        o.id !== s.id &&
        o.status === "resting" &&
        o.intent.side !== want.side &&
        o.intent.debtToken.toLowerCase() === want.debtToken.toLowerCase() &&
        Math.abs(o.intent.termDays - want.termDays) <= 15,
    );
  if (!opp) return null;
  // the peer's max rate becomes the meeting point; split the difference for upside
  const peerRate = opp.intent.maxRateBps;
  const rateBps = Math.min(ceilingBps(want), Math.round((peerRate + want.maxRateBps) / 2) - 20);
  return {
    intentId: s.id,
    solverId: "coincidence:" + opp.id,
    solverName: "Monfi Peer",
    lane: "p2p",
    rateBps: Math.max(300, rateBps),
    bond: (BigInt(want.debtAmount) * 12n) / 100n + "",
    valid: true,
    rationale: `Direct match with resting intent ${opp.id} — coincidence of agents, no desk in the middle.`,
    ts: Date.now(),
  };
}

export async function solve(s: StoredIntent): Promise<SolveResult> {
  const rate = await getOpenMarketRate();
  const marketBaseBps = rate.usdcBorrowBps;
  const ctx = { intentId: s.id, intent: s.intent, marketBaseBps };

  const results = await Promise.all(allSolvers.map((solver) => solver.quote(ctx).catch(() => null)));
  const solverQuotes = results.filter((q): q is Quote => q != null);

  // human/external quotes already posted to this intent (kept even if over ceiling)
  const ceiling = ceilingBps(s.intent);
  const humanQuotes = s.quotes
    .filter((q) => q.solverId.startsWith("human:"))
    .map((q) => ({ ...q, valid: q.rateBps <= ceiling }));

  const coincidence = findCoincidence(s, marketBaseBps);

  const all = [...solverQuotes, ...humanQuotes, ...(coincidence ? [coincidence] : [])];
  // dedupe by solverId, keep best
  const byId = new Map<string, Quote>();
  for (const q of all) {
    const prev = byId.get(q.solverId);
    if (!prev || q.rateBps < prev.rateBps) byId.set(q.solverId, q);
  }
  // full field, sorted best-rate first; winner = best quote at/under the ceiling
  const quotes = [...byId.values()].sort((a, b) => a.rateBps - b.rateBps);
  const winner = quotes.find((q) => q.valid);

  if (!winner) {
    throw new Error("no_fill"); // nobody could satisfy the mandate within the ceiling
  }
  s.quotes = quotes;
  s.winner = winner;
  s.status = "matching";

  return {
    intentId: s.id,
    quotes,
    winner,
    savedBps: s.intent.maxRateBps - winner.rateBps,
    upside: winner.lane === "p2p" && winner.rateBps < marketBaseBps,
    marketBaseBps,
  };
}
