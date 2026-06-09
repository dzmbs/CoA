import Anthropic from "@anthropic-ai/sdk";
import type { Quote } from "@mfi/shared/intent";
import { type Solver, type SolveContext, bondFor, ceilingBps, saltJitter } from "./types.js";

/**
 * Atlas — an LLM-driven solver agent. It reasons over the borrower's full
 * mandate (floor, grace, premium) and the live market to negotiate a rate it can
 * justify, returning both the number and a negotiation message. Credit terms are
 * multidimensional and personalized, so an agent that reasons beats a fixed curve.
 */

const MODEL = "claude-haiku-4-5";
const KEY = process.env.ANTHROPIC_API_KEY;
const client = KEY ? new Anthropic({ apiKey: KEY }) : null;

const NAME = "Atlas";
const ID = "atlas";
const LANE = "p2p" as const;

function baselineQuote(ctx: SolveContext): Quote | null {
  const { intent, marketBaseBps } = ctx;
  if (!intent.lanes.includes(LANE)) return null;
  const j = saltJitter(intent, 7);
  const rateBps = Math.min(ceilingBps(intent), Math.max(300, marketBaseBps - 22 + Math.round((j - 0.5) * 8)));
  return {
    intentId: ctx.intentId,
    solverId: ID,
    solverName: NAME,
    lane: LANE,
    rateBps,
    bond: bondFor(intent, LANE),
    valid: true,
    rationale: `Undercutting market by ~22bps; your ${intent.mandate.floorPct}% floor and ${intent.mandate.graceHours}h grace are within my risk budget.`,
    ts: Date.now(),
  };
}

async function negotiate(ctx: SolveContext): Promise<Quote | null> {
  const { intent, marketBaseBps } = ctx;
  if (!intent.lanes.includes(LANE)) return null;
  if (!client) return baselineQuote(ctx);

  const ceiling = ceilingBps(intent);
  const sys =
    `You are ${NAME}, a peer credit solver agent on m.fi (intent-based lending on Monad). ` +
    `A borrower posted a signed credit intent with a risk mandate. Decide the APR (in basis points) ` +
    `you will offer to fill the OTHER side of their trade. You profit from the spread between the ` +
    `market base rate and what you charge, but you must stay at or below their ceiling and honor their ` +
    `mandate (forced-close floor, grace period). Quote competitively — other solvers are bidding too. ` +
    `Respond with ONLY a JSON object: {"rateBps": <int>, "bondPct": <int 0-20>, "rationale": "<one sentence to the borrower>"}.`;

  const user = JSON.stringify({
    marketBaseBps,
    ceilingBps: ceiling,
    intent: {
      side: intent.side,
      termDays: intent.termDays,
      maxRateBps: intent.maxRateBps,
      collateral: intent.collateralToken,
      debt: intent.debtToken,
      mandate: intent.mandate,
    },
  });

  try {
    const resp = await Promise.race([
      client.messages.create({
        model: MODEL,
        max_tokens: 300,
        system: sys,
        messages: [{ role: "user", content: user }],
      }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("llm timeout")), 8000)),
    ]);
    const text = (resp as any).content?.find((c: any) => c.type === "text")?.text ?? "";
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    let rateBps = Math.round(Number(json.rateBps));
    if (!Number.isFinite(rateBps)) return baselineQuote(ctx);
    rateBps = Math.max(300, Math.min(rateBps, ceiling)); // clamp to honor ceiling
    const bondPct = Math.max(0, Math.min(20, Math.round(Number(json.bondPct) || 12)));
    return {
      intentId: ctx.intentId,
      solverId: ID,
      solverName: NAME,
      lane: LANE,
      rateBps,
      bond: (BigInt(intent.debtAmount) * BigInt(bondPct)) / 100n + "",
      valid: true,
      rationale: String(json.rationale || "").slice(0, 240) || "Negotiated within your mandate.",
      ts: Date.now(),
    };
  } catch {
    return baselineQuote(ctx);
  }
}

export const llmSolver: Solver = { id: ID, name: NAME, lane: LANE, quote: negotiate };
export const llmEnabled = Boolean(client);
