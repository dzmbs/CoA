import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomBytes } from "node:crypto";
import type { CreditIntent, Quote } from "@mfi/shared/intent";
import { intentKey } from "@mfi/shared/intent";
import { store } from "./store.js";
import type { Position, StoredIntent } from "./types.js";
import { solve } from "./matching.js";
import { getOpenMarketRate } from "./rates.js";
import { startMonitor, bondHealthOf } from "./monitor.js";
import { llmEnabled } from "./solvers/llm.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 8787);

/* --------------------------------- health -------------------------------- */
app.get("/health", async (_req, res) => {
  const rate = await getOpenMarketRate();
  res.json({ ok: true, llm: llmEnabled, rate });
});

app.get("/rates", async (_req, res) => res.json(await getOpenMarketRate()));

/* --------------------------------- intents ------------------------------- */
// submit a signed credit intent
app.post("/intents", (req, res) => {
  const { intent, signature } = req.body as { intent: CreditIntent; signature?: `0x${string}` };
  if (!intent?.owner || !intent?.debtToken) return res.status(400).json({ error: "bad_intent" });
  const id = intentKey(intent);
  const stored: StoredIntent = {
    id,
    intent,
    signature: signature ?? null,
    status: "resting",
    createdAt: Date.now(),
    quotes: [],
  };
  store.addIntent(stored);
  res.status(201).json({ id, intent: stored.intent, status: stored.status });
});

// open intent book
app.get("/intents", (req, res) => {
  const side = req.query.side as string | undefined;
  const rows = store.listIntents().filter((s) => !side || s.intent.side === side);
  res.json(
    rows.map((s) => ({
      id: s.id,
      owner: s.intent.owner,
      side: s.intent.side,
      debtToken: s.intent.debtToken,
      debtAmount: s.intent.debtAmount,
      collateralToken: s.intent.collateralToken,
      termDays: s.intent.termDays,
      maxRateBps: s.intent.maxRateBps,
      mandate: s.intent.mandate,
      status: s.status,
      quotes: s.quotes.length,
    })),
  );
});

app.get("/intents/:id", (req, res) => {
  const s = store.getIntent(req.params.id);
  if (!s) return res.status(404).json({ error: "not_found" });
  res.json(s);
});

// run the auction: collect solver quotes (scripted + Claude + open-market + P2P + human) and pick a winner
app.post("/intents/:id/solve", async (req, res) => {
  const s = store.getIntent(req.params.id);
  if (!s) return res.status(404).json({ error: "not_found" });
  try {
    const result = await solve(s);
    res.json(result);
  } catch (e: any) {
    if (e?.message === "no_fill") return res.status(422).json({ error: "no_fill" });
    console.error("[solve]", e);
    res.status(500).json({ error: "solve_failed" });
  }
});

// a human (or external) agent posts a quote into an open intent's auction
app.post("/intents/:id/quotes", (req, res) => {
  const s = store.getIntent(req.params.id);
  if (!s) return res.status(404).json({ error: "not_found" });
  const { solverName, rateBps, bond, rationale, lane } = req.body as Partial<Quote>;
  if (typeof rateBps !== "number" || !solverName) return res.status(400).json({ error: "bad_quote" });
  const q: Quote = {
    intentId: s.id,
    solverId: "human:" + solverName.toLowerCase().replace(/\s+/g, "-"),
    solverName,
    lane: (lane as Quote["lane"]) || "otc",
    rateBps,
    bond: bond ?? "0",
    rationale: rationale || "Human solver quote.",
    ts: Date.now(),
  };
  s.quotes.push(q);
  res.status(201).json(q);
});

/* -------------------------------- positions ------------------------------ */
// create a position after the user accepts a fill
app.post("/positions", (req, res) => {
  const p = req.body as Partial<Position>;
  const id = store.nextPositionId();
  const pos: Position = {
    id,
    owner: p.owner || "0x0",
    borrow: p.borrow ?? 0,
    asset: p.asset ?? "USDC",
    coll: p.coll ?? "ETH",
    collAmt: p.collAmt ?? 0,
    rate: p.rate ?? 0,
    max: p.max ?? 0,
    lane: (p.lane as Position["lane"]) ?? "p2p",
    filler: p.filler ?? "—",
    maturityDays: p.maturityDays ?? 30,
    floorPrice: p.floorPrice ?? 0,
    entryPrice: p.entryPrice ?? 0,
    curPrice: p.curPrice ?? p.entryPrice ?? 0,
    bond: p.bond ?? 0,
    bondHealth: "safe",
    createdAt: Date.now(),
  };
  pos.bondHealth = bondHealthOf(pos);
  store.addPosition(pos);
  res.status(201).json(pos);
});

app.get("/positions", (req, res) => {
  const owner = req.query.owner as string | undefined;
  res.json(store.listPositions(owner));
});

/* ---------------------------------- boot --------------------------------- */
startMonitor();
app.listen(PORT, () => {
  console.log(`[m.fi] orderbook + solver network on :${PORT}  (Claude solver: ${llmEnabled ? "ON" : "standby"})`);
});
