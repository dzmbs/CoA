/**
 * A standalone solver agent you (a human) or a bot can run against the m.fi
 * orderbook — the perceive → decide → act loop. This is what makes the solver
 * network open: anyone can point this at the API and start quoting.
 *
 *   pnpm --filter @mfi/server agent -- --name "MyDesk" --edge -15
 *
 * It polls for resting intents, prices each off the live market base, and posts
 * a quote into that intent's auction.
 */
import { getOpenMarketRate } from "./rates.js";

const API = process.env.VITE_API_URL || process.env.API_URL || "http://localhost:8787";
const argv = process.argv.slice(2);
const arg = (k: string, d: string) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 ? argv[i + 1] : d;
};

const NAME = arg("name", "FreeAgent");
const EDGE = Number(arg("edge", "-15")); // bps off the market base
const LANE = arg("lane", "otc");
const INTERVAL = Number(arg("interval", "4000"));

const seen = new Set<string>();

async function tick() {
  try {
    const base = (await getOpenMarketRate()).usdcBorrowBps;
    const intents: any[] = await fetch(`${API}/intents`).then((r) => r.json());
    for (const it of intents) {
      if (it.status !== "resting" || seen.has(it.id)) continue;
      const ceiling = it.maxRateBps + Math.round((it.mandate?.premiumPct ?? 0) * 100);
      const rateBps = Math.max(300, base + EDGE);
      if (rateBps > ceiling) continue;
      await fetch(`${API}/intents/${encodeURIComponent(it.id)}/quotes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          solverName: NAME,
          lane: LANE,
          rateBps,
          bond: (BigInt(it.debtAmount) * 12n) / 100n + "",
          rationale: `${NAME} quoting ${(rateBps / 100).toFixed(2)}% (${EDGE}bps vs base).`,
        }),
      });
      seen.add(it.id);
      console.log(`[${NAME}] quoted ${it.id} @ ${(rateBps / 100).toFixed(2)}%`);
    }
  } catch (e) {
    console.error(`[${NAME}] tick error`, (e as Error).message);
  }
}

console.log(`[${NAME}] solver agent online → ${API} (lane=${LANE}, edge=${EDGE}bps)`);
setInterval(tick, INTERVAL);
tick();
