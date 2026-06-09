/* =========================================================
   mfi-data.jsx — data, icons, and shared primitives
   ========================================================= */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------- helpers ---------- */
const fmtUSD = (n, d = 0) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtNum = (n, d = 0) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- brand mark ---------- */
function Mark({ size = 26, fill = "#6E54FF" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 182 184" fill="none" aria-hidden="true">
      <path d="M90.5358 0C64.3911 0 0 65.2598 0 91.7593C0 118.259 64.3911 183.52 90.5358 183.52C116.681 183.52 181.073 118.258 181.073 91.7593C181.073 65.2609 116.682 0 90.5358 0ZM76.4273 144.23C65.4024 141.185 35.7608 88.634 38.7655 77.4599C41.7703 66.2854 93.62 36.2439 104.645 39.2892C115.67 42.3341 145.312 94.8846 142.307 106.059C139.302 117.234 87.4522 147.276 76.4273 144.23Z" fill={fill} />
    </svg>
  );
}

/* ---------- minimal icon set (stroke) ---------- */
const Icon = {
  arrow: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  back: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chev: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  shield: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  lock: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="5" y="10" width="14" height="10" rx="2.4" stroke="currentColor" strokeWidth="1.7"/><path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.7"/></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.7"/><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  bolt: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M13 2L5 13h5l-1 9 8-11h-5l1-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  spark: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  node: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.6"/><circle cx="5" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6"/><circle cx="19" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6"/><path d="M11 7L6 16M13 7l5 9" stroke="currentColor" strokeWidth="1.4"/></svg>,
  book: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 5h7v15H6a2 2 0 01-2-2V5zM20 5h-7v15h5a2 2 0 002-2V5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  grid: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="4" y="4" width="6.5" height="6.5" rx="1.6" stroke="currentColor" strokeWidth="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" stroke="currentColor" strokeWidth="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" stroke="currentColor" strokeWidth="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" stroke="currentColor" strokeWidth="1.6"/></svg>,
  bank: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 9l8-5 8 5M5 9v9m5-9v9m4-9v9m5-9v9M3 20h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  swap: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M7 8h12l-3-3M17 16H5l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>,
  close: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  dot: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>,
  wallet: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="6" width="18" height="13" rx="2.6" stroke="currentColor" strokeWidth="1.7"/><path d="M3 9h13a2 2 0 012 2v2a2 2 0 01-2 2H3" stroke="currentColor" strokeWidth="1.7"/><circle cx="16.5" cy="12.5" r="1.1" fill="currentColor"/></svg>,
  info: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.6"/><path d="M12 11v5M12 8.2v.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  cal: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="4" y="5.5" width="16" height="15" rx="2.4" stroke="currentColor" strokeWidth="1.6"/><path d="M4 10h16M8 3.5v4M16 3.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  pct: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="7.5" cy="7.5" r="2.6" stroke="currentColor" strokeWidth="1.6"/><circle cx="16.5" cy="16.5" r="2.6" stroke="currentColor" strokeWidth="1.6"/><path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  coins: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><ellipse cx="9" cy="7" rx="5.5" ry="2.6" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 7v5c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6V7" stroke="currentColor" strokeWidth="1.6"/><path d="M14.5 12.4c.8.4 2 .7 3.2.7 3 0 5.3-1.1 5.3-2.5V6.5" stroke="currentColor" strokeWidth="1.6"/><path d="M9 14.5v2.8c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6v-2.6" stroke="currentColor" strokeWidth="1.6"/></svg>,
  refresh: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M20 12a8 8 0 11-2.3-5.6M20 4v3.5h-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

/* ---------- domain data ---------- */
const ASSETS = {
  ETH:  { sym: "ETH",  name: "Ethereum",    color: "#8B93FF", price: 3214,  glyph: "Ξ" },
  WBTC: { sym: "WBTC", name: "Wrapped BTC", color: "#F7931A", price: 81240, glyph: "₿" },
  MON:  { sym: "MON",  name: "Monad",       color: "#6E54FF", price: 4.12,  token: "assets/mon-token.svg" },
  stETH:{ sym: "stETH",name: "Lido stETH",  color: "#00A3FF", price: 3198,  glyph: "Ξ" },
};
const BORROW = {
  USDC: { sym: "USDC", name: "USD Coin",  color: "#2775CA", glyph: "$" },
  USDT: { sym: "USDT", name: "Tether",    color: "#26A17B", glyph: "₮" },
  DAI:  { sym: "DAI",  name: "Dai",       color: "#F5AC37", glyph: "◈" },
};

/* extra display tokens used only by the Earn flow */
const EARN_ASSETS = {
  BTC: { sym: "BTC", name: "Bitcoin",   color: "#F7931A", price: 81240, glyph: "₿" },
  USD: { sym: "USD", name: "US Dollar", color: "#2775CA", price: 1,     glyph: "$" },
};

/* yield strategies offered in the Earn flow */
const YIELD_SOURCES = [
  { id:"lending",  name:"Lending",                 sub:"supply to vetted lending markets", apr:5.2,  tag:"Low risk",  tone:"ok" },
  { id:"stables",  name:"Yield-bearing stables",   sub:"sUSDe · USDS · sDAI",               apr:8.9,  tag:"Low risk",  tone:"ok" },
  { id:"vaults",   name:"Managed vaults",           sub:"curated by risk managers",         apr:11.4, tag:"Medium",    tone:"" },
  { id:"basis",    name:"Basis",                    sub:"cash-and-carry basis trade",       apr:14.2, tag:"Medium",    tone:"" },
  { id:"funding",  name:"Funding arbitrage",        sub:"capture perp funding spread",      apr:18.6, tag:"High",      tone:"warn" },
  { id:"looping",  name:"Looping",                  sub:"recursive leverage loop",          apr:21.3, tag:"High",      tone:"bad" },
];

/* accepted exposure options when Lending is the source */
const EXPOSURES = [
  { id:"btc",     name:"BTC",                    glyph:"₿", hex:"#F7931A" },
  { id:"eth",     name:"ETH",                    glyph:"Ξ", hex:"#8B93FF" },
  { id:"mon",     name:"MON",                    glyph:"M", hex:"#6E54FF" },
  { id:"rwa",     name:"RWAs",                   glyph:"◎", hex:"#85E6FF" },
  { id:"stables", name:"Yield-bearing stables", glyph:"$", hex:"#26A17B" },
];

/* lanes = the three fulfillment paths */
const LANES = {
  p2p:   { id: "p2p",   label: "CoA P2P",     short: "P2P · CoA",  color: "var(--cyan)",  hex:"#85E6FF" },
  otc:   { id: "otc",   label: "OTC Solver",  short: "OTC Solver",   color: "var(--amber)", hex:"#FFAE45" },
  open:  { id: "open",  label: "Open Market", short: "Morpho · Euler", color: "var(--primary-2)", hex:"#8B76FF" },
};

/* the venue menu shown in the intent builder.
   p2p + otc are CoA-native paths; morpho / euler are the only real on-chain protocols. */
const VENUES = [
  { id:"p2p",    lane:"p2p",  name:"CoA P2P",     sub:"peer match inside CoA",   glyph:"◆", real:false },
  { id:"otc",    lane:"otc",  name:"OTC Solver",  sub:"desk fills the other side", glyph:"◑", real:false },
  { id:"morpho", lane:"open", name:"Morpho Blue", sub:"onchain floating rate, open term loan", glyph:"M", real:true },
  { id:"euler",  lane:"open", name:"Euler",       sub:"onchain floating rate, open term loan", glyph:"E", real:true },
];
const venueLanes = (vs) => Array.from(new Set(vs.map((v) => VENUES.find((x)=>x.id===v)?.lane).filter(Boolean)));

/* nodes that appear in the agent arena */
const NODES = [
  { id:"you",     lane:"p2p",  kind:"intent", name:"Your intent",   glyph:"◆" },
  { id:"agentA",  lane:"p2p",  kind:"agent",  name:"Velvet",        sub:"CoA peer", glyph:"V", rate:7.61 },
  { id:"agentB",  lane:"p2p",  kind:"agent",  name:"Solver-Δ",      sub:"CoA peer", glyph:"Δ", rate:7.74 },
  { id:"agentC",  lane:"p2p",  kind:"agent",  name:"Halo",          sub:"CoA peer", glyph:"H", rate:7.95 },
  { id:"otc1",    lane:"otc",  kind:"otc",    name:"Keyrock",       sub:"OTC solver",  glyph:"K", rate:7.68 },
  { id:"otc2",    lane:"otc",  kind:"otc",    name:"Wintermute",    sub:"OTC solver",  glyph:"W", rate:7.82 },
  { id:"otc3",    lane:"otc",  kind:"otc",    name:"Flow Traders",  sub:"OTC solver",  glyph:"F", rate:7.90 },
  { id:"v1",      lane:"open", kind:"venue",  name:"Morpho Blue",   sub:"open market", glyph:"M", rate:7.92 },
  { id:"v2",      lane:"open", kind:"venue",  name:"Euler",         sub:"open market", glyph:"E", rate:8.11 },
];

/* the worked example intent */
const DEFAULT_INTENT = {
  borrowAmount: 100000,
  borrowAsset: "USDC",
  collateralAsset: "ETH",
  collAmount: 48.2,
  termDays: 45,
  maxRate: 8.14,
  venues: ["p2p", "otc", "morpho", "euler"],
  routes: ["p2p", "otc", "open"],
  // mandate
  floorPct: 25,      // forced-close only if ETH drops this % (=> price floor)
  grace: 12,         // hours
  payMore: 0.4,      // willing to pay extra (bps shown as %)
};

/* the worked example earn intent */
const DEFAULT_EARN = {
  asset: "USD",
  principal: 250000,
  source: "stables",
  exposure: ["eth", "stables"],
  targetApr: 9.0,
  maxDrawdown: 12,
};

/* resting open intents (limit-order book) */
const OPEN_INTENTS = [
  { id:"#A91F", who:"0x7c…D31a", side:"borrow", amt:250000, asset:"USDC", coll:"WBTC", term:60, max:7.40, floor:30, status:"resting", bond:30000, fill:0, mine:false },
  { id:"#A8E2", who:"0xbE2…3949", side:"borrow", amt:100000, asset:"USDC", coll:"ETH", term:45, max:8.14, floor:25, status:"matching", bond:12000, fill:62, mine:true },
  { id:"#A8C0", who:"0x14a…9b02", side:"lend", amt:500000, asset:"USDC", coll:"ETH", term:30, max:6.90, floor:0, status:"resting", bond:0, fill:0, mine:false },
  { id:"#A7B5", who:"0x9fd…2c11", side:"borrow", amt:40000, asset:"USDT", coll:"MON", term:90, max:9.20, floor:35, status:"resting", bond:6800, fill:0, mine:false },
  { id:"#A77D", who:"0x3a1…ff80", side:"lend", amt:1200000, asset:"USDC", coll:"WBTC", term:45, max:7.05, floor:0, status:"partial", bond:0, fill:38, mine:false },
  { id:"#A6F0", who:"0xc81…1d44", side:"borrow", amt:75000, asset:"DAI", coll:"stETH", term:120, max:8.60, floor:28, status:"resting", bond:11250, fill:0, mine:false },
];

/* active positions */
const POSITIONS = [
  { id:"#P-204", borrow:100000, asset:"USDC", coll:"ETH", collAmt:46.6, rate:7.61, max:8.14, lane:"otc", filler:"Keyrock", maturityDays:41, floorPrice:2410, entryPrice:3214, curPrice:3198, bond:12000, bondHealth:"safe" },
  { id:"#P-198", borrow:60000, asset:"USDC", coll:"WBTC", collAmt:1.02, rate:6.95, max:7.30, lane:"p2p", filler:"Velvet", maturityDays:12, floorPrice:62000, entryPrice:81240, curPrice:74100, bond:9000, bondHealth:"watch" },
  { id:"#P-181", borrow:25000, asset:"DAI", coll:"MON", collAmt:7600, rate:8.40, max:8.90, lane:"open", filler:"Morpho Blue", maturityDays:73, floorPrice:2.9, entryPrice:4.12, curPrice:3.05, bond:0, bondHealth:"open" },
];

/* ============== shared UI primitives ============== */

const ICON_CDN = "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/";
const TOKEN_LOGOS = {
  USDC: ICON_CDN + "usdc.svg", USDT: ICON_CDN + "usdt.svg", DAI: ICON_CDN + "dai.svg",
  WBTC: ICON_CDN + "wbtc.svg", BTC: ICON_CDN + "btc.svg", ETH: ICON_CDN + "eth.svg",
  WETH: ICON_CDN + "eth.svg", stETH: ICON_CDN + "eth.svg", USD: ICON_CDN + "usd.svg",
};
const llama = (s) => `https://icons.llamao.fi/icons/protocols/${s}?w=64&h=64`;
const fav = (d) => `https://icons.duckduckgo.com/ip3/${d}.ico`;
const PROTOCOL_LOGOS = {
  morpho: llama("morpho-blue"), euler: llama("euler"), neverland: llama("neverland"),
  curvance: llama("curvance"), apriori: llama("apriori"),
};
const FIRM_LOGOS = {
  wintermute: fav("wintermute.com"), keyrock: fav("keyrock.com"), gsr: fav("gsr.io"),
  flowtraders: fav("flowtraders.com"), amber: fav("ambergroup.io"),
};
const LOGO_BY_ID = { ...PROTOCOL_LOGOS, ...FIRM_LOGOS };

function TokenIcon({ sym, size = 30, ring = false }) {
  const a = ASSETS[sym] || BORROW[sym] || EARN_ASSETS[sym] || { color: "#6E54FF", glyph: sym?.[0] };
  const [err, setErr] = useState(false);
  const src = a.token || TOKEN_LOGOS[sym];
  const fs = Math.round(size * 0.46);
  if (src && !err) {
    return <span className="tk" style={{ width: size, height: size, background: "#0B0717", boxShadow: ring ? `0 0 0 3px ${(a.color || "#6E54FF")}22` : "none" }}>
      <img src={src} alt={sym} onError={() => setErr(true)} />
    </span>;
  }
  return (
    <span className="tk" style={{
      width: size, height: size, fontSize: fs,
      background: `linear-gradient(150deg, ${a.color}, ${a.color}cc)`,
      boxShadow: ring ? `0 0 0 3px ${a.color}22` : "none",
    }}>{a.glyph || sym?.[0]}</span>
  );
}

function ProtocolLogo({ id, name, glyph, size = 32, hex = "#6E54FF" }) {
  const [err, setErr] = useState(false);
  const src = LOGO_BY_ID[id];
  if (src && !err) {
    return <span className="tk" style={{ width: size, height: size, background: "#0B0717" }}>
      <img src={src} alt={name} onError={() => setErr(true)} />
    </span>;
  }
  return <span className="tk" style={{ width: size, height: size, fontSize: Math.round(size * 0.46), background: `linear-gradient(150deg, ${hex}, ${hex}aa)` }}>{glyph || (name || "?")[0]}</span>;
}

function Pill({ tone = "", children, style }) {
  return <span className={"pill " + tone} style={style}>{children}</span>;
}

function Field({ label, children, hint, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, ...style }}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>{hint}</span>}
    </div>
  );
}

/* segmented control */
function Segmented({ options, value, onChange, full }) {
  return (
    <div style={{ display: "inline-flex", gap: 4, padding: 4, background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 999, width: full ? "100%" : "auto" }}>
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const lab = typeof o === "string" ? o : o.label;
        const on = v === value;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            flex: full ? 1 : "none", padding: "9px 16px", borderRadius: 999, fontFamily: "var(--mono)",
            fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase",
            color: on ? "#fff" : "var(--ink-3)", background: on ? "var(--primary)" : "transparent",
            boxShadow: on ? "0 6px 18px -8px rgba(110,84,255,.9)" : "none", transition: ".16s",
          }}>{lab}</button>
        );
      })}
    </div>
  );
}

/* a glowing status dot */
function LiveDot({ color = "var(--cyan)" }) {
  return <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "ping 1.6s ease-out infinite" }} />
    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }} />
  </span>;
}

/* inject keyframes used by primitives */
(function injectKeys() {
  if (document.getElementById("mfi-keys")) return;
  const s = document.createElement("style");
  s.id = "mfi-keys";
  s.textContent = `
  @keyframes ping{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(2.6);opacity:0}}
  @keyframes dash{to{stroke-dashoffset:0}}
  @keyframes travel{0%{offset-distance:0%;opacity:0}10%{opacity:1}90%{opacity:1}100%{offset-distance:100%;opacity:0}}
  @keyframes pulseGlow{0%,100%{opacity:.5}50%{opacity:1}}
  @keyframes spinSlow{to{transform:rotate(360deg)}}
  @keyframes feedIn{from{transform:translateX(12px)}to{transform:none}}
  @keyframes countUp{from{transform:translateY(8px)}to{transform:none}}
  @keyframes barGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  `;
  document.head.appendChild(s);
})();

Object.assign(window, {
  useState, useEffect, useRef, useMemo, useCallback,
  fmtUSD, fmtNum, clamp,
  Mark, Icon, ASSETS, BORROW, EARN_ASSETS, YIELD_SOURCES, EXPOSURES, LANES, VENUES, venueLanes, NODES, DEFAULT_INTENT, DEFAULT_EARN, OPEN_INTENTS, POSITIONS,
  TokenIcon, Pill, Field, Segmented, LiveDot,
});
