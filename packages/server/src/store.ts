import type { StoredIntent, Position } from "./types.js";

/** In-memory state, seeded with starter rows. */
class Store {
  intents = new Map<string, StoredIntent>();
  positions = new Map<string, Position>();
  private seq = 300;

  nextPositionId() {
    return `#P-${++this.seq}`;
  }

  addIntent(i: StoredIntent) {
    this.intents.set(i.id, i);
    return i;
  }
  getIntent(id: string) {
    return this.intents.get(id);
  }
  listIntents() {
    return [...this.intents.values()].sort((a, b) => b.createdAt - a.createdAt);
  }
  addPosition(p: Position) {
    this.positions.set(p.id, p);
    return p;
  }
  listPositions(owner?: string) {
    const all = [...this.positions.values()].sort((a, b) => b.createdAt - a.createdAt);
    return owner ? all.filter((p) => p.owner.toLowerCase() === owner.toLowerCase()) : all;
  }
}

export const store = new Store();

/* ----------------------------- seed ----------------------------- */

const now = Date.now();

const seedPositions: Position[] = [
  { id: "#P-204", owner: "0xseed", borrow: 100000, asset: "USDC", coll: "ETH", collAmt: 46.6, rate: 7.61, max: 8.14, lane: "otc", filler: "Keyrock", maturityDays: 41, floorPrice: 2410, entryPrice: 3214, curPrice: 3198, bond: 12000, bondHealth: "safe", createdAt: now - 4e8 },
  { id: "#P-198", owner: "0xseed", borrow: 60000, asset: "USDC", coll: "WBTC", collAmt: 1.02, rate: 6.95, max: 7.30, lane: "p2p", filler: "Velvet", maturityDays: 12, floorPrice: 62000, entryPrice: 81240, curPrice: 74100, bond: 9000, bondHealth: "watch", createdAt: now - 6e8 },
  { id: "#P-181", owner: "0xseed", borrow: 25000, asset: "DAI", coll: "MON", collAmt: 7600, rate: 8.40, max: 8.90, lane: "open", filler: "Neverland", maturityDays: 73, floorPrice: 2.9, entryPrice: 4.12, curPrice: 3.05, bond: 0, bondHealth: "open", createdAt: now - 9e8 },
];
seedPositions.forEach((p) => store.addPosition(p));
