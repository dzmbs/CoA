/* Generated from design/*.jsx by scripts/assemble.mjs. Edit the design files and re-run. */
import React from "react";
const { useState, useEffect, useRef, useMemo, useCallback } = React;
import { ConnectButton, useWallet, useSignIntent, useTokenBalance, useNativeBalance } from "../wallet.jsx";
import { useMonPrice } from "../prices.js";
import { api, toCreditIntent } from "../api.js";
import { canSettleOnChain, openOnNeverland, repayOnNeverland, getUsdcDebt } from "../onchain.js";

/* ===== mfi-data.jsx ===== */
/* =========================================================
   mfi-data.jsx — data, icons, and shared primitives
   ========================================================= */
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
  MON:  { sym: "MON",  name: "Monad",       color: "#6E54FF", price: 4.12,  token: "/assets/mon-token.svg" },
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

/* ===== mfi-builder.jsx ===== */
/* =========================================================
   mfi-builder.jsx — Intent builder (two-panel) + Risk mandate
   ========================================================= */

/* progress header shown across the borrow flow */
function FlowHeader({ step }) {
  const steps = ["Intent", "Mandate", "Solve", "Fill"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      {steps.map((s, i) => {
        const on = i === step, done = i < step;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center",
                fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600,
                background: on ? "var(--primary)" : done ? "rgba(133,230,255,.14)" : "var(--bg-2)",
                color: on ? "#fff" : done ? "var(--cyan)" : "var(--ink-3)",
                border: on ? "none" : "1px solid var(--line)",
              }}>{done ? <Icon.check style={{ width: 13, height: 13 }} /> : i + 1}</span>
              <span className="label" style={{ color: on ? "var(--ink)" : done ? "var(--ink-2)" : "var(--ink-3)" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <span style={{ width: 26, height: 1, background: "var(--line-2)" }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ===================== date helpers ===================== */
const NOW_REF = new Date(2026, 5, 9); // Jun 9 2026
const addDays = (d) => { const x = new Date(NOW_REF); x.setDate(x.getDate() + d); return x; };
const fmtDate = (dt) => dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

/* ===================== shared builder primitives ===================== */

/* compact token dropdown used in Collateral / Debt panels */
function TokenSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const a = ASSETS[value] || BORROW[value] || EARN_ASSETS[value];
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", borderRadius: 14,
        background: "var(--bg-2)", border: "1px solid " + (open ? "var(--line-strong)" : "var(--line-2)"), transition: ".16s",
      }}>
        <TokenIcon sym={value} size={34} />
        <div style={{ textAlign: "left", flex: 1 }}>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>{a.name}</div>
          <div className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>{value}</div>
        </div>
        <Icon.chev style={{ width: 18, height: 18, color: "var(--ink-3)", transform: open ? "rotate(180deg)" : "none", transition: ".2s" }} />
      </button>
      {open && (
        <div className="fade-in" style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 30, background: "#0B0717", border: "1px solid var(--line-2)", borderRadius: 14, padding: 8, boxShadow: "var(--shadow)" }}>
          {options.map((s) => {
            const o = ASSETS[s] || BORROW[s] || EARN_ASSETS[s]; const on = s === value;
            return (
              <button key={s} onClick={() => { onChange(s); setOpen(false); }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10,
                background: on ? "var(--primary-12)" : "transparent",
              }}>
                <TokenIcon sym={s} size={28} />
                <div style={{ textAlign: "left", flex: 1 }}><div style={{ fontWeight: 600, color: "var(--ink-1)", fontSize: 14 }}>{s}</div><div className="num" style={{ fontSize: 11, color: "var(--ink-3)" }}>{o.name}</div></div>
                {o.price && <span className="num" style={{ fontSize: 12, color: "var(--ink-2)" }}>{fmtUSD(o.price)}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* big amount field with a unit + a max chip */
function AmountField({ value, onChange, unit, sub, maxLabel, onMax }) {
  return (
    <div style={{ background: "var(--bg-2)", border: "1px solid var(--line-2)", borderRadius: 16, padding: "18px 18px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input value={fmtNum(value)} onChange={(e) => onChange(+e.target.value.replace(/[^0-9]/g, "") || 0)}
          className="num" inputMode="numeric" style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontSize: 34, fontWeight: 600, letterSpacing: "-0.02em" }} />
        <span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 18, color: "var(--ink-2)", flex: "none" }}>{unit}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span className="num" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{sub}</span>
        {maxLabel && <button onClick={onMax} className="num" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--primary-2)" }}><Icon.wallet style={{ width: 14, height: 14 }} /> {maxLabel}</button>}
      </div>
    </div>
  );
}

/* selectable option row (maturity / max-rate / venue lists) */
function OptionRow({ active, onClick, left, right, badge, badgeTone }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "15px 16px", borderRadius: 14, textAlign: "left",
      background: active ? "var(--primary-12)" : "var(--bg-2)", border: "1px solid " + (active ? "var(--line-strong)" : "var(--line)"),
      boxShadow: active ? "0 0 0 1px var(--primary-40)" : "none", transition: ".15s",
    }}>
      <span style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>{left}{badge && <span className={"pill " + (badgeTone || "")} style={{ fontSize: 9.5, padding: "3px 8px" }}>{badge}</span>}</span>
      {right && <span style={{ flex: "none", color: "var(--ink-3)" }}>{right}</span>}
      <span style={{ width: 20, height: 20, borderRadius: "50%", flex: "none", border: "1px solid " + (active ? "var(--primary-2)" : "var(--line-2)"), background: active ? "var(--primary)" : "transparent", display: "grid", placeItems: "center" }}>
        {active && <Icon.check style={{ width: 12, height: 12, color: "#fff" }} />}
      </span>
    </button>
  );
}

/* left-rail checklist row */
function StepRow({ icon, label, value, done, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "17px 18px", borderRadius: 16, textAlign: "left",
      background: active ? "var(--surface-hi)" : "var(--bg-2)",
      border: "1px solid " + (active ? "var(--line-strong)" : "var(--line)"),
      boxShadow: active ? "var(--glow)" : "none", transition: ".18s",
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 10, display: "grid", placeItems: "center", flex: "none",
        background: done ? "rgba(133,230,255,.12)" : active ? "var(--primary-12)" : "var(--bg-1)",
        border: "1px solid " + (done ? "rgba(133,230,255,.3)" : active ? "var(--line-strong)" : "var(--line-2)"),
        color: done ? "var(--cyan)" : active ? "var(--primary-2)" : "var(--ink-3)",
      }}>{done ? <Icon.check style={{ width: 16, height: 16 }} /> : React.cloneElement(icon, { style: { width: 17, height: 17 } })}</span>
      <span style={{ flex: 1, fontFamily: "var(--display)", fontWeight: 600, fontSize: 16, color: done || active ? "var(--ink)" : "var(--ink-2)" }}>{label}</span>
      <span className="num" style={{ fontSize: 13, color: done ? "var(--ink-1)" : "var(--ink-4)", textAlign: "right", fontWeight: done ? 600 : 400, whiteSpace: "pre-line", lineHeight: 1.3 }}>{done ? value : "Not Selected"}</span>
      <Icon.chev style={{ width: 16, height: 16, color: "var(--ink-4)", transform: active ? "rotate(90deg)" : "rotate(-90deg)", transition: ".2s", flex: "none" }} />
    </button>
  );
}

/* panel chrome — title + scrollable body + a primary set button */
function Panel({ title, action, children, onSet, setLabel, setDisabled }) {
  return (
    <div className="fade-in" style={{ padding: 26, display: "flex", flexDirection: "column", minHeight: 470, borderRadius: "var(--r-lg)", background: "linear-gradient(180deg, #221952, #1A1238)", border: "1px solid var(--line-strong)", boxShadow: "0 30px 70px -28px rgba(0,0,0,.8), inset 0 1px 0 rgba(221,215,254,.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span className="h-sm">{title}</span>{action}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} onClick={onSet} disabled={setDisabled}>{setLabel}</button>
    </div>
  );
}

/* ===================== the two-panel intent builder ===================== */
const STEP_ORDER = ["collateral", "debt", "maturity", "rate", "venue"];

function IntentBuilder({ intent, set, onNext }) {
  const [active, setActive] = useState("collateral");
  const [confirmed, setConfirmed] = useState(new Set());
  const collBal = useTokenBalance(intent.collateralAsset);
  const nativeBal = useNativeBalance();
  const monPrice = useMonPrice();

  const confirm = (id) => {
    const c = new Set(confirmed); c.add(id); setConfirmed(c);
    const nxt = STEP_ORDER.find((o) => !c.has(o));
    setActive(nxt || id);
  };
  const allDone = STEP_ORDER.every((o) => confirmed.has(o));

  const ca = ASSETS[intent.collateralAsset];
  const isMon = intent.collateralAsset === "MON";
  const caPrice = isMon && monPrice ? monPrice : ca.price; // MON priced from the on-chain oracle
  // wallet balance of the collateral asset (native MON, or an ERC-20)
  const walletColl = isMon ? nativeBal.formatted : collBal.formatted;
  const collUSD = intent.collAmount * caPrice;
  const debtUSD = intent.borrowAmount;
  const ltv = collUSD ? (debtUSD / collUSD) * 100 : 0;
  const maxLTV = 86;
  const maxDebt = collUSD * (maxLTV / 100);

  const stepMeta = {
    collateral: { icon: <Icon.coins />, label: "Collateral", value: `${fmtNum(intent.collAmount, 2)} ${intent.collateralAsset}\n${fmtUSD(collUSD)}` },
    debt: { icon: <Icon.bank />, label: "Debt", value: `${fmtNum(intent.borrowAmount)} ${intent.borrowAsset}\n${fmtUSD(debtUSD)}` },
    maturity: { icon: <Icon.cal />, label: "Maturity", value: `${intent.termDays} Days\n${fmtDate(addDays(intent.termDays))}` },
    rate: { icon: <Icon.pct />, label: "Max Rate", value: `${intent.maxRate.toFixed(2)}%\n${fmtNum(intent.borrowAmount * intent.maxRate / 100 * intent.termDays / 365, 2)} ${intent.borrowAsset}` },
    venue: { icon: <Icon.node />, label: "Venue", value: `${intent.venues.length} ${intent.venues.length === 1 ? "protocol" : "protocols"}` },
  };

  /* ---- rate presets ---- */
  const rateOpts = [
    { v: 6.23, tag: "Tight", tone: "bad" },
    { v: 8.14, tag: "Mid", tone: "warn" },
    { v: 9.64, tag: "Wide", tone: "ok" },
  ];
  const interest = (r) => intent.borrowAmount * r / 100 * intent.termDays / 365;

  /* ---- maturity presets ---- */
  const matOpts = [7, 30, 90];

  /* ---- venue toggle keeps arena routes in sync ---- */
  const toggleVenue = (id) => {
    const has = intent.venues.includes(id);
    const nv = has ? intent.venues.filter((x) => x !== id) : [...intent.venues, id];
    if (!nv.length) return;
    set({ venues: nv, routes: venueLanes(nv) });
  };

  return (
    <div className="rise" style={{ maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="h-lg">New borrow intent</h1>
        <p className="muted" style={{ marginTop: 8, fontSize: 16, maxWidth: 560 }}>
          State the deal you want. Set each term — your agent negotiates the fill and posts a bond on the outcome to ensure it meets your needs.
        </p>
      </div>

      <div className="builder-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, alignItems: "start" }}>
        {/* LEFT — checklist */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 20 }}>
            <span className="h-sm">Intent</span>
            <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>· {confirmed.size}/5 set</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {STEP_ORDER.map((id) => (
              <StepRow key={id} icon={stepMeta[id].icon} label={stepMeta[id].label} value={stepMeta[id].value}
                done={confirmed.has(id)} active={active === id} onClick={() => setActive(id)} />
            ))}
          </div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} disabled={!allDone} onClick={onNext}>
            {allDone ? <>Complete the terms <Icon.arrow style={{ width: 19, height: 19 }} /></> : `Complete the terms · ${confirmed.size}/5`}
          </button>
        </div>

        {/* RIGHT — detail panel */}
        <div key={active}>
          {active === "collateral" && (
            <Panel title="Collateral" onSet={() => confirm("collateral")} setLabel="Set Collateral">
              <span className="label">Asset</span>
              <div style={{ marginTop: 10, marginBottom: 18 }}>
                <TokenSelect value={intent.collateralAsset} options={Object.keys(ASSETS)} onChange={(s) => set({ collateralAsset: s })} />
              </div>
              <span className="label">Amount</span>
              <div style={{ marginTop: 10 }}>
                <AmountField value={intent.collAmount} onChange={(v) => set({ collAmount: v })} unit={intent.collateralAsset}
                  sub={fmtUSD(collUSD)}
                  maxLabel={walletColl != null ? `${fmtNum(walletColl, walletColl < 100 ? 4 : 2)} ${intent.collateralAsset}` : `${fmtNum(intent.collAmount + 12, 2)} ${intent.collateralAsset}`}
                  onMax={() => {
                    if (walletColl == null) { set({ collAmount: +(intent.collAmount + 12).toFixed(2) }); return; }
                    const usable = isMon ? Math.max(0, walletColl - 2) : walletColl; // keep some MON for gas
                    set({ collAmount: +usable.toFixed(4) });
                  }} />
              </div>
              <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: "rgba(133,230,255,.06)", border: "1px solid rgba(133,230,255,.16)" }}>
                <span className="num" style={{ fontSize: 12, color: "var(--cyan)" }}>Posted to the CoA vault · liquidation LTV {maxLTV}%</span>
              </div>
            </Panel>
          )}

          {active === "debt" && (
            <Panel title="Debt" onSet={() => confirm("debt")} setLabel="Set Debt">
              <span className="label">Borrow asset</span>
              <div style={{ marginTop: 10, marginBottom: 18 }}>
                <TokenSelect value={intent.borrowAsset} options={Object.keys(BORROW)} onChange={(s) => set({ borrowAsset: s })} />
              </div>
              <span className="label">Amount</span>
              <div style={{ marginTop: 10 }}>
                <AmountField value={intent.borrowAmount} onChange={(v) => set({ borrowAmount: clamp(v, 0, Math.round(maxDebt)) })} unit={intent.borrowAsset}
                  sub={fmtUSD(debtUSD)} maxLabel={`Max ${fmtNum(maxDebt)} ${intent.borrowAsset}`} onMax={() => set({ borrowAmount: Math.round(maxDebt) })} />
              </div>
              <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="label">Loan-to-value</span>
                <span className="num" style={{ fontSize: 13, color: ltv > 70 ? "var(--amber)" : "var(--cyan)" }}>{ltv.toFixed(1)}%</span>
              </div>
              <input type="range" min="0" max={Math.round(maxDebt)} step="1000" value={intent.borrowAmount} onChange={(e) => set({ borrowAmount: +e.target.value })} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                {[0, 29, 57, 86].map((p) => (
                  <button key={p} onClick={() => set({ borrowAmount: Math.round(collUSD * p / 100) })} className="num" style={{ fontSize: 11, color: "var(--ink-3)" }}>{p}%</button>
                ))}
              </div>
            </Panel>
          )}

          {active === "maturity" && (
            <Panel title="Maturity" onSet={() => confirm("maturity")} setLabel={`Set ${intent.termDays} Days as Maturity`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {matOpts.map((d) => (
                  <OptionRow key={d} active={intent.termDays === d} onClick={() => set({ termDays: d })}
                    left={<span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>{d}D</span>}
                    right={<span className="num" style={{ fontSize: 13 }}>{fmtDate(addDays(d))}</span>} />
                ))}
                <OptionRow active={!matOpts.includes(intent.termDays)} onClick={() => { if (matOpts.includes(intent.termDays)) set({ termDays: 45 }); }}
                  left={<span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>Custom</span>}
                  right={!matOpts.includes(intent.termDays)
                    ? <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span role="button" onClick={(e) => { e.stopPropagation(); set({ termDays: clamp(intent.termDays - 5, 1, 365) }); }} className="num" style={{ width: 26, height: 26, borderRadius: 8, background: "var(--bg-1)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", color: "var(--ink-1)" }}>–</span>
                        <span className="num" style={{ fontSize: 14, color: "var(--ink-1)", minWidth: 44, textAlign: "center" }}>{intent.termDays}d</span>
                        <span role="button" onClick={(e) => { e.stopPropagation(); set({ termDays: clamp(intent.termDays + 5, 1, 365) }); }} className="num" style={{ width: 26, height: 26, borderRadius: 8, background: "var(--bg-1)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", color: "var(--ink-1)" }}>+</span>
                      </span>
                    : <span className="num" style={{ fontSize: 13 }}>set your own</span>} />
              </div>
            </Panel>
          )}

          {active === "rate" && (
            <Panel title="Max Rate" onSet={() => confirm("rate")} setLabel={`Set ${intent.maxRate.toFixed(2)}% as Max Rate`}>
              <p className="num" style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>The ceiling your agent must beat. Live market avg <span style={{ color: "var(--cyan)" }}>7.92%</span>.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {rateOpts.map((o) => (
                  <OptionRow key={o.v} active={Math.abs(intent.maxRate - o.v) < 0.001} onClick={() => set({ maxRate: o.v })}
                    badge={o.tag} badgeTone={o.tone}
                    left={<span className="num" style={{ fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>{o.v.toFixed(2)}%</span>}
                    right={<span className="num" style={{ fontSize: 12.5 }}>≈ {fmtUSD(interest(o.v), 0)} interest</span>} />
                ))}
                <OptionRow active={!rateOpts.some((o) => Math.abs(intent.maxRate - o.v) < 0.001)} onClick={() => {}}
                  left={<span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>Custom</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span role="button" onClick={(e) => { e.stopPropagation(); set({ maxRate: clamp(+(intent.maxRate - 0.25).toFixed(2), 1, 25) }); }} className="num" style={{ width: 26, height: 26, borderRadius: 8, background: "var(--bg-1)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", color: "var(--ink-1)" }}>–</span>
                      <span className="num" style={{ fontSize: 13, color: "var(--ink-1)", minWidth: 52, textAlign: "center" }}>{intent.maxRate.toFixed(2)}%</span>
                      <span role="button" onClick={(e) => { e.stopPropagation(); set({ maxRate: clamp(+(intent.maxRate + 0.25).toFixed(2), 1, 25) }); }} className="num" style={{ width: 26, height: 26, borderRadius: 8, background: "var(--bg-1)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", color: "var(--ink-1)" }}>+</span>
                    </span>
                  </span>} />
              </div>
            </Panel>
          )}

          {active === "venue" && (
            <Panel title="Venue" onSet={() => confirm("venue")} setLabel={`Set ${intent.venues.length} ${intent.venues.length === 1 ? "Venue" : "Venues"}`}
              action={<button onClick={() => set({ venues: VENUES.map((v) => v.id), routes: venueLanes(VENUES.map((v) => v.id)) })} className="num" style={{ fontSize: 12, color: "var(--primary-2)", textDecoration: "underline" }}>Select all</button>}>
              <p className="num" style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>Where your intent can fill. CoA tries native paths first, then real protocols.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {VENUES.map((v) => {
                  const on = intent.venues.includes(v.id);
                  return (
                    <button key={v.id} onClick={() => toggleVenue(v.id)} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "13px 15px", borderRadius: 14, textAlign: "left",
                      background: on ? "var(--bg-2)" : "transparent", border: "1px solid " + (on ? "var(--line-strong)" : "var(--line)"), transition: ".15s",
                    }}>
                      {PROTOCOL_LOGOS[v.id]
                        ? <ProtocolLogo id={v.id} name={v.name} glyph={v.glyph} size={32} hex={LANES[v.lane].hex} />
                        : <span style={{ width: 32, height: 32, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", fontFamily: "var(--mono)", fontWeight: 600, color: "#fff", background: `linear-gradient(150deg, ${LANES[v.lane].hex}, ${LANES[v.lane].hex}aa)` }}>{v.glyph}</span>}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontWeight: 600, color: "var(--ink-1)", fontSize: 14.5 }}>{v.name}</span>{v.real && <span className="pill" style={{ fontSize: 9, padding: "2px 7px" }}>floating rate</span>}</div>
                        <div className="num" style={{ fontSize: 11, color: "var(--ink-3)" }}>{v.sub}</div>
                      </div>
                      <span style={{ width: 22, height: 22, borderRadius: 7, flex: "none", border: "1px solid " + (on ? LANES[v.lane].hex : "var(--line-2)"), background: on ? LANES[v.lane].hex : "transparent", display: "grid", placeItems: "center" }}>
                        {on && <Icon.check style={{ width: 13, height: 13, color: "#0B0717" }} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Risk mandate ---------------- */
function RiskMandate({ intent, set, onNext, onBack }) {
  const ca = ASSETS[intent.collateralAsset];
  const floorPrice = ca.price * (1 - intent.floorPct / 100);
  const strength = Math.round(clamp((intent.floorPct - 8) / 0.4 + intent.grace * 1.1 + intent.payMore * 28, 8, 99));

  const Control = ({ children }) => (
    <div className="card" style={{ padding: 24, marginBottom: 16 }}>{children}</div>
  );

  return (
    <div className="rise" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28, alignItems: "start" }}>
      <div>
        <h1 className="h-lg" style={{ marginBottom: 10 }}>Your mandate</h1>
        <p className="muted" style={{ maxWidth: 520, marginBottom: 26, fontSize: 16, lineHeight: 1.5 }}>
          Hard constraints the agent must honor while it holds your position. Break one and its bond is slashed to you — automatically.
        </p>

        <Control>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span className="label">Forced-close floor</span>
            <span className="num" style={{ fontSize: 13, color: "var(--ink-3)" }}>{ca.sym} now {fmtUSD(ca.price)}</span>
          </div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 22, color: "var(--ink)", margin: "6px 0 18px" }}>
            No forced close unless {ca.sym} drops below <span className="num" style={{ color: "var(--cyan)" }}>{fmtUSD(floorPrice)}</span>
          </div>
          <input type="range" min="10" max="45" step="1" value={intent.floorPct} onChange={(e) => set({ floorPct: +e.target.value })} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>tighter · −10%</span>
            <span className="num" style={{ fontSize: 13, color: "var(--ink-1)" }}>{intent.floorPct}% drawdown buffer</span>
            <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>safer · −45%</span>
          </div>
        </Control>

        <Control>
          <span className="label">Grace period before liquidation</span>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 22, color: "var(--ink)", margin: "8px 0 16px" }}>
            Hold off {intent.grace === 0 ? "with no" : <span className="num" style={{ color: "var(--cyan)" }}>{intent.grace}h</span>} grace at the floor
          </div>
          <Segmented full options={[{ value: 0, label: "None" }, { value: 6, label: "6h" }, { value: 12, label: "12h" }, { value: 24, label: "24h" }, { value: 48, label: "48h" }]} value={intent.grace} onChange={(v) => set({ grace: v })} />
        </Control>

        <Control>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span className="label">Premium for protection</span>
            <span className="num" style={{ fontSize: 13, color: "var(--amber)" }}>+{intent.payMore.toFixed(2)}% APR</span>
          </div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 22, color: "var(--ink)", margin: "6px 0 18px" }}>
            I'll pay up to <span className="num" style={{ color: "var(--amber)" }}>+{intent.payMore.toFixed(2)}%</span> for these guarantees
          </div>
          <input type="range" min="0" max="1.5" step="0.05" value={intent.payMore} onChange={(e) => set({ payMore: +e.target.value })} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>cheapest fill</span>
            <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>most protection</span>
          </div>
        </Control>
      </div>

      {/* mandate contract */}
      <div className="card card-hi" style={{ padding: 26, position: "sticky", top: 96 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <Icon.shield style={{ width: 20, height: 20, color: "var(--primary-2)" }} />
          <span className="h-sm">Mandate contract</span>
        </div>
        {[
          ["Borrow", `${fmtNum(intent.borrowAmount)} ${intent.borrowAsset}`],
          ["Collateral", `${fmtNum(intent.collAmount, 2)} ${intent.collateralAsset}`],
          ["Term", `${intent.termDays} days`],
          ["Rate ceiling", `${(intent.maxRate + intent.payMore).toFixed(2)}% APR`],
          ["Liquidation floor", fmtUSD(floorPrice)],
          ["Grace", intent.grace ? `${intent.grace}h` : "none"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--line)" }}>
            <span className="num" style={{ fontSize: 13, color: "var(--ink-3)" }}>{k}</span>
            <span className="num" style={{ fontSize: 13, color: "var(--ink-1)", fontWeight: 600 }}>{v}</span>
          </div>
        ))}

        <div style={{ margin: "20px 0 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="label">Mandate strength</span>
          <span className="num" style={{ fontSize: 13, color: "var(--cyan)" }}>{strength}/100</span>
        </div>
        <div style={{ height: 8, borderRadius: 6, background: "var(--bg-1)", overflow: "hidden" }}>
          <div style={{ width: strength + "%", height: "100%", borderRadius: 6, background: "linear-gradient(90deg,var(--primary),var(--cyan))", transition: ".3s" }} />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={onBack}><Icon.back style={{ width: 18, height: 18 }} /></button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onNext}>Find best fill <Icon.arrow style={{ width: 19, height: 19 }} /></button>
        </div>
      </div>
    </div>
  );
}

/* ===== mfi-arena.jsx ===== */
/* =========================================================
   mfi-arena.jsx — the agent arena (cinematic network graph)
   ========================================================= */

/* scale a fixed 640-coordinate stage to fit its container */
function useStageScale(STAGE) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      // never upscale, and keep a margin so node labels never reach the card edge
      setScale(Math.min(w / STAGE, h / STAGE, 1) * 0.9);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [STAGE]);
  return [ref, scale];
}

function AgentArena({ intent, solveData, onDone, onBack }) {
  const STAGE = 640, C = STAGE / 2, R = 248;
  const [stageRef, scale] = useStageScale(STAGE);

  // quotes from the solver network
  const realQuotes = solveData && !solveData.error ? solveData.quotes : null;
  const ready = !!realQuotes || !!(solveData && solveData.error);

  const nodes = useMemo(() => {
    let list;
    if (realQuotes) {
      list = realQuotes.map((q) => ({
        id: q.solverId, lane: q.lane,
        kind: q.lane === "open" ? "venue" : q.lane === "otc" ? "otc" : "agent",
        name: q.solverName, glyph: (q.solverName[0] || "?").toUpperCase(),
        rate: q.rateBps / 100, eligible: true, valid: q.valid !== false, rationale: q.rationale,
      }));
    } else {
      list = NODES.filter((n) => n.kind !== "intent").map((n) => ({ ...n, eligible: intent.routes.includes(n.lane) }));
    }
    return list.map((n, i) => {
      const ang = (-90 + i * (360 / list.length)) * Math.PI / 180;
      return { ...n, x: C + R * Math.cos(ang), y: C + R * Math.sin(ang) };
    });
  }, [intent.routes, realQuotes]);

  const eligible = nodes.filter((n) => n.eligible);
  const revealOrder = useMemo(() => [...eligible].sort((a, b) => b.rate - a.rate), [nodes]);
  const winner = useMemo(() => {
    if (realQuotes && solveData.winner) return nodes.find((n) => n.id === solveData.winner.solverId) || [...eligible].sort((a, b) => a.rate - b.rate)[0];
    return [...eligible].sort((a, b) => a.rate - b.rate)[0];
  }, [nodes]);

  const [phase, setPhase] = useState("broadcast"); // broadcast | quotes | converge | done
  const [active, setActive] = useState(new Set());
  const [best, setBest] = useState(null);
  const [feed, setFeed] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const feedRef = useRef(null);
  const started = useRef(false);

  const addFeed = (f) => setFeed((p) => [...p, { ...f, t: Date.now() }]);

  // clock + "broadcasting" message run immediately while we wait for the auction
  useEffect(() => {
    addFeed({ kind: "sys", text: `Broadcasting intent to the solver network` });
    const tick = setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => clearInterval(tick);
  }, []);

  // play the reveal once quotes are ready
  useEffect(() => {
    if (!ready || started.current || !winner) return;
    started.current = true;
    const timers = [];
    const T = (ms, fn) => timers.push(setTimeout(fn, ms));

    setPhase("quotes");
    addFeed({ kind: "sys", text: `${eligible.length} solvers negotiating your mandate across ${intent.routes.length} ${intent.routes.length === 1 ? "path" : "paths"}` });

    const base = 450;
    const stepMs = revealOrder.length > 8 ? 340 : 460;
    revealOrder.forEach((n, i) => {
      T(base + i * stepMs, () => {
        setActive((s) => new Set(s).add(n.id));
        if (n.valid !== false) setBest((b) => (b == null ? n.rate : Math.min(b, n.rate)));
        addFeed({
          kind: "quote", lane: n.lane, name: n.name, rate: n.rate, over: n.valid === false,
          text: n.valid === false
            ? `quoted above your ceiling`
            : n.lane === "p2p" ? `matched the other side of your trade` : n.lane === "otc" ? `OTC desk quoted` : `open-market offer`,
        });
      });
    });
    const end = base + revealOrder.length * stepMs;
    T(end + 500, () => { setPhase("converge"); addFeed({ kind: "win", name: winner.name, rate: winner.rate, lane: winner.lane }); });
    T(end + 1700, () => setPhase("done"));

    return () => timers.forEach((t) => clearTimeout(t));
  }, [ready, winner]);

  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [feed]);

  const result = realQuotes && solveData.winner ? {
    rate: solveData.winner.rateBps / 100, filler: solveData.winner.solverName, lane: solveData.winner.lane,
    saved: +(solveData.savedBps / 100).toFixed(2),
    bond: solveData.winner.lane === "open" ? 0 : Math.round(intent.borrowAmount * 0.12),
    upside: !!solveData.upside,
  } : {
    rate: winner ? winner.rate : intent.maxRate, filler: winner ? winner.name : "—", lane: winner ? winner.lane : "p2p",
    saved: winner ? +(intent.maxRate - winner.rate).toFixed(2) : 0,
    bond: Math.round(intent.borrowAmount * 0.12),
    upside: winner ? winner.lane === "p2p" : false,
  };

  return (
    <div className="rise">
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LiveDot color={phase === "done" ? "var(--cyan)" : "var(--primary-2)"} />
            <h1 className="h-md">{phase === "done" ? "Best fill locked" : "Solving your intent"}</h1>
          </div>
          <p className="num" style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 8 }}>
            {fmtNum(intent.borrowAmount)} {intent.borrowAsset} · {intent.collateralAsset} · {intent.termDays}d · ≤ {intent.maxRate.toFixed(2)}%
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="num" style={{ fontSize: 13, color: "var(--ink-3)" }}>{elapsed.toFixed(1)}s elapsed</span>
          {phase !== "done"
            ? <button className="btn btn-ghost" onClick={() => onDone(result)} style={{ padding: "10px 18px", fontSize: 13 }}>Skip</button>
            : <button className="btn btn-primary" onClick={() => onDone(result)}>See your fill <Icon.arrow style={{ width: 19, height: 19 }} /></button>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22, alignItems: "start" }}>
        {/* graph */}
        <div className="card" style={{ position: "relative", overflow: "hidden", height: 640, background: "radial-gradient(circle at 50% 45%, rgba(110,84,255,.10), transparent 60%), var(--surface)" }}>
          {/* lane legend */}
          <div style={{ position: "absolute", top: 18, left: 18, display: "flex", gap: 10, zIndex: 5, flexWrap: "wrap" }}>
            {Object.values(LANES).map((l) => {
              const on = intent.routes.includes(l.id);
              return <span key={l.id} className="num" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: on ? "var(--ink-2)" : "var(--ink-4)", opacity: on ? 1 : .5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: on ? l.hex : "var(--ink-4)", boxShadow: on ? `0 0 8px ${l.hex}` : "none" }} />{l.short}
              </span>;
            })}
          </div>

          <div ref={stageRef} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <div style={{ width: STAGE, height: STAGE, transform: `scale(${scale})`, position: "relative", flex: "none" }}>
              {/* edges */}
              <svg width={STAGE} height={STAGE} viewBox={`0 0 ${STAGE} ${STAGE}`} style={{ position: "absolute", inset: 0 }}>
                <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(221,215,254,.06)" strokeWidth="1" strokeDasharray="2 6" />
                {nodes.map((n) => {
                  const act = active.has(n.id);
                  const isWin = phase !== "quotes" && phase !== "broadcast" && winner.id === n.id;
                  const dim = phase === "converge" || phase === "done" ? !isWin : false;
                  return (
                    <line key={n.id} x1={C} y1={C} x2={n.x} y2={n.y}
                      stroke={isWin ? LANES[n.lane].hex : act ? LANES[n.lane].hex : "rgba(221,215,254,.07)"}
                      strokeWidth={isWin ? 2.4 : act ? 1.4 : 1}
                      strokeOpacity={!n.eligible ? .25 : dim ? .12 : act ? .55 : .5}
                      style={{ transition: ".5s" }} />
                  );
                })}
              </svg>

              {/* traveling quote pulses */}
              {nodes.filter((n) => active.has(n.id)).map((n) => {
                const isWin = (phase === "converge" || phase === "done") && winner.id === n.id;
                return <span key={"p" + n.id} style={{
                  position: "absolute", left: 0, top: 0, width: isWin ? 9 : 6, height: isWin ? 9 : 6, borderRadius: "50%",
                  background: LANES[n.lane].hex, boxShadow: `0 0 10px ${LANES[n.lane].hex}`,
                  offsetPath: `path('M ${n.x} ${n.y} L ${C} ${C}')`,
                  animation: `travel ${isWin ? 1.1 : 1.8}s linear infinite`,
                }} />;
              })}

              {/* nodes */}
              {nodes.map((n) => {
                const act = active.has(n.id);
                const isWin = (phase === "converge" || phase === "done") && winner.id === n.id;
                const dim = (phase === "converge" || phase === "done") && !isWin;
                const lane = LANES[n.lane];
                const sz = isWin ? 60 : 50;
                const over = n.valid === false; // quoted above the ceiling — participant, not a contender
                const edge = over ? "var(--ink-4)" : lane.hex;
                return (
                  <div key={n.id} style={{ position: "absolute", left: n.x, top: n.y, transform: "translate(-50%,-50%)", textAlign: "center", transition: ".4s", opacity: !n.eligible ? .32 : over ? (act ? .5 : .32) : dim ? .4 : 1, zIndex: isWin ? 6 : 2 }}>
                    <div style={{
                      width: sz, height: sz, borderRadius: "50%", margin: "0 auto", display: "grid", placeItems: "center",
                      fontFamily: "var(--display)", fontWeight: 600, fontSize: 20, color: "#fff",
                      background: "linear-gradient(150deg,var(--bg-2),var(--bg-1))",
                      border: `2px solid ${act || isWin ? edge : "var(--line-2)"}`,
                      boxShadow: isWin ? `0 0 0 6px ${lane.hex}22, 0 0 30px ${lane.hex}` : (act && !over) ? `0 0 18px ${lane.hex}88` : "none",
                      transition: ".4s",
                    }}>{LOGO_BY_ID[n.id]
                      ? <ProtocolLogo id={n.id} name={n.name} glyph={n.glyph} size={sz - 12} hex={lane.hex} />
                      : n.glyph}</div>
                    <div className="num" style={{ marginTop: 8, fontSize: 11, color: dim ? "var(--ink-4)" : "var(--ink-2)", fontWeight: 600 }}>{n.name}</div>
                    <div className="num" style={{ fontSize: 11, color: act ? (over ? "var(--ink-4)" : lane.hex) : "var(--ink-4)", marginTop: 2, height: 14, textDecoration: over && act ? "line-through" : "none" }}>{act ? n.rate.toFixed(2) + "%" : n.eligible ? "···" : "off"}</div>
                  </div>
                );
              })}

              {/* center intent node */}
              <div style={{ position: "absolute", left: C, top: C, transform: "translate(-50%,-50%)", zIndex: 8, textAlign: "center" }}>
                <div style={{ position: "relative", width: 96, height: 96 }}>
                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid var(--primary-40)", animation: "ping 2.4s ease-out infinite" }} />
                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid var(--primary-40)", animation: "ping 2.4s ease-out infinite", animationDelay: "1.2s" }} />
                  <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "radial-gradient(circle,#1a1140,#0B0717)", border: "2px solid var(--primary)", display: "grid", placeItems: "center", boxShadow: "0 0 36px rgba(110,84,255,.6)" }}>
                    <Mark size={42} fill="#fff" />
                  </div>
                </div>
                <div className="label" style={{ marginTop: 10, color: "var(--primary-soft)" }}>Your intent</div>
              </div>
            </div>
          </div>

          {/* best quote readout */}
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 18, zIndex: 5, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <div>
              <span className="label">{phase === "done" || phase === "converge" ? "Winning rate" : "Best quote so far"}</span>
              <div key={best} style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 46, lineHeight: 1, color: "var(--ink)", animation: "countUp .3s ease both" }}>
                {best == null ? "—" : <span className="num">{best.toFixed(2)}<span style={{ fontSize: 24, color: "var(--ink-3)" }}>%</span></span>}
              </div>
            </div>
            {best != null && best < intent.maxRate && (
              <Pill tone="ok"><Icon.check style={{ width: 13, height: 13 }} /> {(intent.maxRate - best).toFixed(2)}% under ceiling</Pill>
            )}
          </div>
        </div>

        {/* feed */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: 640 }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="h-sm">Negotiation feed</span>
            <span className="num" style={{ fontSize: 11, color: "var(--ink-3)" }}>{active.size}/{eligible.length} quoted</span>
          </div>
          <div ref={feedRef} style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {feed.map((f, i) => {
              if (f.kind === "sys") return (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", animation: "feedIn .35s ease both" }}>
                  <Icon.spark style={{ width: 15, height: 15, color: "var(--primary-2)", animation: "spinSlow 6s linear infinite" }} />
                  <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>{f.text}</span>
                </div>
              );
              if (f.kind === "win") return (
                <div key={i} style={{ animation: "feedIn .35s ease both", background: "rgba(133,230,255,.07)", border: "1px solid rgba(133,230,255,.22)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon.check style={{ width: 16, height: 16, color: "var(--cyan)" }} />
                  <span className="num" style={{ fontSize: 12.5, color: "var(--ink-1)" }}><b style={{ color: "var(--cyan)" }}>{f.name}</b> wins at <b className="num">{f.rate.toFixed(2)}%</b></span>
                </div>
              );
              const lane = LANES[f.lane];
              return (
                <div key={i} style={{ animation: "feedIn .35s ease both", display: "flex", gap: 11, alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: lane.hex, boxShadow: `0 0 8px ${lane.hex}`, flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600, color: "var(--ink-1)", fontSize: 13 }}>{f.name}</span>
                    <span className="num" style={{ fontSize: 11.5, color: "var(--ink-3)", marginLeft: 7 }}>{f.text}</span>
                  </div>
                  <span className="num" style={{ fontSize: 14, fontWeight: 600, color: lane.hex }}>{f.rate.toFixed(2)}%</span>
                </div>
              );
            })}
          </div>
          {/* footer summary */}
          <div style={{ padding: "16px 20px", borderTop: "1px solid var(--line)" }}>
            {phase === "done" ? (
              <div style={{ animation: "feedIn .4s ease both" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>{result.upside ? "Coincidence of agents · P2P" : LANES[result.lane].label}</span>
                  <span className="num" style={{ fontSize: 12, color: "var(--cyan)" }}>beats ceiling by {result.saved.toFixed(2)}%</span>
                </div>
                <div className="num" style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  {result.filler} will post a <b style={{ color: "var(--amber)" }}>{fmtUSD(result.bond)}</b> bond, slashable if it breaks your mandate.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 6, borderRadius: 6, background: "var(--bg-1)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(active.size / Math.max(1, eligible.length)) * 100}%`, background: "linear-gradient(90deg,var(--primary),var(--cyan))", transition: ".4s" }} />
                </div>
                <span className="num" style={{ fontSize: 11, color: "var(--ink-3)" }}>negotiating…</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== mfi-earn.jsx ===== */
/* =========================================================
   mfi-earn.jsx — Earn yield intent builder (mirrors borrow)
   ========================================================= */

const EARN_INPUTS = ["BTC", "USD", "ETH", "MON"];
const priceOf = (sym) => (ASSETS[sym] || EARN_ASSETS[sym] || { price: 1 }).price;

/* small two-step header */
function EarnFlowHeader({ step }) {
  const steps = ["Strategy", "Deploy"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      {steps.map((s, i) => {
        const on = i === step, done = i < step;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center",
                fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600,
                background: on ? "var(--primary)" : done ? "rgba(133,230,255,.14)" : "var(--bg-2)",
                color: on ? "#fff" : done ? "var(--cyan)" : "var(--ink-3)",
                border: on ? "none" : "1px solid var(--line)",
              }}>{done ? <Icon.check style={{ width: 13, height: 13 }} /> : i + 1}</span>
              <span className="label" style={{ color: on ? "var(--ink)" : done ? "var(--ink-2)" : "var(--ink-3)" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <span style={{ width: 26, height: 1, background: "var(--line-2)" }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ===================== Earn builder ===================== */
function EarnBuilder({ earn, set, onNext }) {
  const [active, setActive] = useState("deposit");
  const [confirmed, setConfirmed] = useState(new Set());

  const isLending = earn.source === "lending";
  const order = ["deposit", "source", ...(isLending ? ["exposure"] : []), "target", "drawdown"];

  const confirm = (id) => {
    const c = new Set(confirmed); c.add(id); setConfirmed(c);
    const nxt = order.find((o) => !c.has(o));
    setActive(nxt || id);
  };
  const allDone = order.every((o) => confirmed.has(o));

  const usd = earn.principal * priceOf(earn.asset);
  const src = YIELD_SOURCES.find((s) => s.id === earn.source);

  const stepMeta = {
    deposit: { icon: <Icon.coins />, label: "Deposit", value: `${fmtNum(earn.principal, earn.asset === "USD" ? 0 : 2)} ${earn.asset}\n${fmtUSD(usd)}` },
    source: { icon: <Icon.bolt />, label: "Yield source", value: `${src.name}\n~${src.apr.toFixed(1)}% APR` },
    exposure: { icon: <Icon.node />, label: "Exposure", value: `${earn.exposure.length} ${earn.exposure.length === 1 ? "market" : "markets"}` },
    target: { icon: <Icon.pct />, label: "Target APR", value: `${earn.targetApr.toFixed(1)}%` },
    drawdown: { icon: <Icon.shield />, label: "Max drawdown", value: `−${earn.maxDrawdown}%` },
  };

  const ddOpts = [
    { v: 8, tag: "Tight", tone: "bad" },
    { v: 15, tag: "Balanced", tone: "warn" },
    { v: 25, tag: "Wide", tone: "ok" },
  ];

  const toggleExposure = (id) => {
    const has = earn.exposure.includes(id);
    const nx = has ? earn.exposure.filter((x) => x !== id) : [...earn.exposure, id];
    if (!nx.length) return;
    set({ exposure: nx });
  };

  return (
    <div className="rise" style={{ maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="h-lg">Earn yield</h1>
        <p className="muted" style={{ marginTop: 8, fontSize: 16, maxWidth: 560 }}>
          Describe the return you want. Your agent routes capital to the best-fitting source and pulls out if drawdown breaches your limit.
        </p>
      </div>

      <div className="builder-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, alignItems: "start" }}>
        {/* LEFT — checklist */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 20 }}>
            <span className="h-sm">Strategy</span>
            <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>· {confirmed.size}/{order.length} set</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {order.map((id) => (
              <StepRow key={id} icon={stepMeta[id].icon} label={stepMeta[id].label} value={stepMeta[id].value}
                done={confirmed.has(id)} active={active === id} onClick={() => setActive(id)} />
            ))}
          </div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 22 }} disabled={!allDone} onClick={onNext}>
            {allDone ? <>Find best yield <Icon.arrow style={{ width: 19, height: 19 }} /></> : `Complete the terms · ${confirmed.size}/${order.length}`}
          </button>
        </div>

        {/* RIGHT — detail panel */}
        <div key={active}>
          {active === "deposit" && (
            <Panel title="Deposit" onSet={() => confirm("deposit")} setLabel="Set Deposit">
              <span className="label">Input asset</span>
              <div style={{ marginTop: 10, marginBottom: 18 }}>
                <TokenSelect value={earn.asset} options={EARN_INPUTS} onChange={(s) => set({ asset: s })} />
              </div>
              <span className="label">Principal</span>
              <div style={{ marginTop: 10 }}>
                <AmountField value={earn.principal} onChange={(v) => set({ principal: v })} unit={earn.asset}
                  sub={fmtUSD(usd)} maxLabel={`${fmtNum(earn.principal + (earn.asset === "USD" ? 50000 : 5), earn.asset === "USD" ? 0 : 2)} ${earn.asset}`}
                  onMax={() => set({ principal: earn.principal + (earn.asset === "USD" ? 50000 : 5) })} />
              </div>
              <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: "rgba(133,230,255,.06)", border: "1px solid rgba(133,230,255,.16)" }}>
                <span className="num" style={{ fontSize: 12, color: "var(--cyan)" }}>Custodied in the CoA vault · withdraw any time</span>
              </div>
            </Panel>
          )}

          {active === "source" && (
            <Panel title="Yield source" onSet={() => confirm("source")} setLabel={`Set ${src.name}`}>
              <p className="num" style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>How your capital earns. Higher APR carries more risk.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {YIELD_SOURCES.map((s) => (
                  <OptionRow key={s.id} active={earn.source === s.id} onClick={() => set({ source: s.id })}
                    badge={s.tag} badgeTone={s.tone}
                    left={<span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>{s.name}</span>
                      <span className="num" style={{ fontSize: 11, color: "var(--ink-3)" }}>{s.sub}</span>
                    </span>}
                    right={<span className="num" style={{ fontSize: 13, color: "var(--cyan)" }}>~{s.apr.toFixed(1)}%</span>} />
                ))}
              </div>
            </Panel>
          )}

          {active === "exposure" && (
            <Panel title="Accepted exposure" onSet={() => confirm("exposure")} setLabel={`Set ${earn.exposure.length} ${earn.exposure.length === 1 ? "Market" : "Markets"}`}
              action={<button onClick={() => set({ exposure: EXPOSURES.map((e) => e.id) })} className="num" style={{ fontSize: 12, color: "var(--primary-2)", textDecoration: "underline" }}>Select all</button>}>
              <p className="num" style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>Which collateral you'll lend against. Only markets you accept will be used.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {EXPOSURES.map((e) => {
                  const on = earn.exposure.includes(e.id);
                  return (
                    <button key={e.id} onClick={() => toggleExposure(e.id)} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "13px 15px", borderRadius: 14, textAlign: "left",
                      background: on ? "var(--bg-2)" : "transparent", border: "1px solid " + (on ? "var(--line-strong)" : "var(--line)"), transition: ".15s",
                    }}>
                      <span style={{ width: 32, height: 32, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", fontFamily: "var(--mono)", fontWeight: 600, color: "#fff", background: `linear-gradient(150deg, ${e.hex}, ${e.hex}aa)` }}>{e.glyph}</span>
                      <span style={{ flex: 1, fontWeight: 600, color: "var(--ink-1)", fontSize: 14.5 }}>{e.name}</span>
                      <span style={{ width: 22, height: 22, borderRadius: 7, flex: "none", border: "1px solid " + (on ? e.hex : "var(--line-2)"), background: on ? e.hex : "transparent", display: "grid", placeItems: "center" }}>
                        {on && <Icon.check style={{ width: 13, height: 13, color: "#0B0717" }} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          )}

          {active === "target" && (
            <Panel title="Target APR" onSet={() => confirm("target")} setLabel={`Set ${earn.targetApr.toFixed(1)}% Target`}>
              <p className="num" style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 18, lineHeight: 1.5 }}>The return you're aiming for. {src.name} currently offers <span style={{ color: "var(--cyan)" }}>~{src.apr.toFixed(1)}%</span>.</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 16 }}>
                <button onClick={() => set({ targetApr: clamp(+(earn.targetApr - 0.5).toFixed(1), 1, 30) })} className="num" style={{ width: 46, height: 46, borderRadius: 13, background: "var(--bg-2)", border: "1px solid var(--line-2)", fontSize: 22, color: "var(--ink-1)" }}>–</button>
                <div className="num" style={{ fontSize: 40, fontWeight: 600, color: "var(--ink)" }}>{earn.targetApr.toFixed(1)}%</div>
                <button onClick={() => set({ targetApr: clamp(+(earn.targetApr + 0.5).toFixed(1), 1, 30) })} className="num" style={{ width: 46, height: 46, borderRadius: 13, background: "var(--bg-2)", border: "1px solid var(--line-2)", fontSize: 22, color: "var(--ink-1)" }}>+</button>
              </div>
              <input type="range" min="3" max="25" step="0.5" value={earn.targetApr} onChange={(e) => set({ targetApr: +e.target.value })} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>conservative · 3%</span>
                <span className="num" style={{ fontSize: 12, color: earn.targetApr > src.apr ? "var(--amber)" : "var(--cyan)" }}>{earn.targetApr > src.apr ? "above source — agent will hunt" : "within reach"}</span>
                <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>25%</span>
              </div>
            </Panel>
          )}

          {active === "drawdown" && (
            <Panel title="Max drawdown" onSet={() => confirm("drawdown")} setLabel={`Set −${earn.maxDrawdown}% Trigger`}>
              <p className="num" style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>If the position drops this far, the agent auto-withdraws and returns your principal.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ddOpts.map((o) => (
                  <OptionRow key={o.v} active={earn.maxDrawdown === o.v} onClick={() => set({ maxDrawdown: o.v })}
                    badge={o.tag} badgeTone={o.tone}
                    left={<span className="num" style={{ fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>−{o.v}%</span>}
                    right={<span className="num" style={{ fontSize: 12.5 }}>floor {fmtUSD(usd * (1 - o.v / 100), 0)}</span>} />
                ))}
                <OptionRow active={!ddOpts.some((o) => o.v === earn.maxDrawdown)} onClick={() => {}}
                  left={<span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>Custom</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span role="button" onClick={(e) => { e.stopPropagation(); set({ maxDrawdown: clamp(earn.maxDrawdown - 1, 2, 60) }); }} className="num" style={{ width: 26, height: 26, borderRadius: 8, background: "var(--bg-1)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", color: "var(--ink-1)" }}>–</span>
                      <span className="num" style={{ fontSize: 13, color: "var(--ink-1)", minWidth: 40, textAlign: "center" }}>−{earn.maxDrawdown}%</span>
                      <span role="button" onClick={(e) => { e.stopPropagation(); set({ maxDrawdown: clamp(earn.maxDrawdown + 1, 2, 60) }); }} className="num" style={{ width: 26, height: 26, borderRadius: 8, background: "var(--bg-1)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", color: "var(--ink-1)" }}>+</span>
                    </span>
                  </span>} />
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===================== Earn result ===================== */
function EarnResult({ earn, onDeploy, onBack }) {
  const src = YIELD_SOURCES.find((s) => s.id === earn.source);
  const usd = earn.principal * priceOf(earn.asset);
  const matchedApr = +Math.max(src.apr, earn.targetApr * 0.96).toFixed(2);
  const annual = usd * matchedApr / 100;
  const beats = matchedApr >= earn.targetApr;
  const venue = { lending: "Morpho Blue", stables: "Ethena", vaults: "Gauntlet", basis: "CoA Desk", funding: "CoA Desk", looping: "Euler" }[earn.source];

  const rows = [
    ["Deposit", `${fmtNum(earn.principal, earn.asset === "USD" ? 0 : 2)} ${earn.asset}`, fmtUSD(usd)],
    ["Source", src.name, src.tag + " risk"],
    ...(earn.source === "lending" ? [["Exposure", earn.exposure.map((id) => EXPOSURES.find((e) => e.id === id).name).join(", "), null]] : []),
    ["Target APR", `${earn.targetApr.toFixed(1)}%`, null],
    ["Matched APR", `${matchedApr.toFixed(2)}%`, beats ? "meets target" : "best available"],
    ["Auto-withdraw at", `−${earn.maxDrawdown}%`, `floor ${fmtUSD(usd * (1 - earn.maxDrawdown / 100), 0)}`],
  ];

  return (
    <div className="rise" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <Pill tone="ok" style={{ marginBottom: 18 }}><Icon.check style={{ width: 13, height: 13 }} /> Strategy matched</Pill>
        <h1 className="h-xl" style={{ marginBottom: 14 }}>
          <span className="num" style={{ color: "var(--cyan)" }}>{matchedApr.toFixed(2)}%</span> <span style={{ color: "var(--ink-3)" }}>APR</span>
        </h1>
        <p className="muted" style={{ fontSize: 17 }}>
          Routed to <b style={{ color: "var(--primary-2)" }}>{venue}</b> via {src.name.toLowerCase()} · projected <b style={{ color: "var(--cyan)" }}>{fmtUSD(annual, 0)}</b>/yr
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* projected yield */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <span className="label">Projected yield</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
              {[["Monthly", fmtUSD(annual / 12, 0)], ["Annual", fmtUSD(annual, 0)]].map(([k, v]) => (
                <div key={k} style={{ background: "var(--bg-1)", borderRadius: 14, padding: "16px 18px" }}>
                  <span className="num" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{k}</span>
                  <div className="num" style={{ fontSize: 24, fontWeight: 600, color: "var(--cyan)", marginTop: 6 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: beats ? "rgba(133,230,255,.06)" : "rgba(255,174,69,.06)", border: "1px solid " + (beats ? "rgba(133,230,255,.18)" : "rgba(255,174,69,.2)") }}>
              <span className="num" style={{ fontSize: 12, color: beats ? "var(--cyan)" : "var(--amber)" }}>
                {beats ? `Meets your ${earn.targetApr.toFixed(1)}% target` : `Below target — ${src.name} is the best fit right now`}
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: 24, borderColor: "rgba(255,142,228,.24)", background: "linear-gradient(160deg,rgba(255,142,228,.06),var(--surface))" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Icon.shield style={{ width: 20, height: 20, color: "var(--pink)" }} />
              <span className="h-sm">Drawdown guard</span>
            </div>
            <p className="num" style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
              Your agent monitors the position and auto-withdraws if value falls <b style={{ color: "var(--pink)" }}>−{earn.maxDrawdown}%</b> below deposit — returning your principal to the vault.
            </p>
          </div>
        </div>

        {/* terms */}
        <div className="card" style={{ padding: 26 }}>
          <span className="label">Strategy terms</span>
          <div style={{ marginTop: 16 }}>
            {rows.map(([k, v, sub]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "13px 0", borderBottom: "1px solid var(--line)" }}>
                <span className="num" style={{ fontSize: 13, color: "var(--ink-3)" }}>{k}</span>
                <span style={{ textAlign: "right" }}>
                  <div className="num" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)" }}>{v}</div>
                  {sub && <div className="num" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{sub}</div>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 24, justifyContent: "center" }}>
        <button className="btn btn-ghost btn-lg" onClick={onBack}>Back</button>
        <button className="btn btn-primary btn-lg" onClick={() => onDeploy({ matchedApr, annual, venue })}><Icon.bolt style={{ width: 19, height: 19 }} /> Deploy capital</button>
      </div>
    </div>
  );
}

/* ===================== Earn success ===================== */
function EarnSuccessModal({ earn, result, onView, onClose }) {
  const stages = ["Submitted", "Routing", "Live"];
  const [done, setDone] = useState(0);
  useEffect(() => {
    const timers = stages.map((_, i) => setTimeout(() => setDone(i + 1), 500 + i * 650));
    return () => timers.forEach(clearTimeout);
  }, []);
  const usd = earn.principal * priceOf(earn.asset);
  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 440, padding: 30, textAlign: "center" }}>
        <h2 className="h-md" style={{ color: "var(--cyan)", marginBottom: 18 }}>Capital deployed</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 26 }}>
          {stages.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center", flex: "none", background: done > i ? "var(--primary)" : "var(--bg-2)", border: done > i ? "none" : "1px solid var(--line-2)", transition: ".3s" }}>
                  {done > i ? <Icon.check style={{ width: 12, height: 12, color: "#fff" }} /> : <span className="num" style={{ fontSize: 10, color: "var(--ink-3)" }}>{i + 1}</span>}
                </span>
                <span className="num" style={{ fontSize: 12, color: done > i ? "var(--ink-1)" : "var(--ink-3)" }}>{s}</span>
              </div>
              {i < stages.length - 1 && <span style={{ width: 26, height: 1, margin: "0 10px", background: done > i + 1 ? "var(--primary)" : "var(--line-2)", transition: ".3s" }} />}
            </React.Fragment>
          ))}
        </div>
        <div className="card" style={{ padding: 18, textAlign: "left", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <TokenIcon sym={earn.asset} size={24} />
              <span className="num" style={{ fontSize: 13, color: "var(--ink-1)", fontWeight: 600 }}>{fmtNum(earn.principal, earn.asset === "USD" ? 0 : 2)} {earn.asset}</span>
            </span>
            <span className="num" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Tx 0x4ad…9c12</span>
          </div>
          <span className="num" style={{ fontSize: 12.5, color: "var(--cyan)" }}>{result.matchedApr.toFixed(2)}% APR · {result.venue} · {fmtUSD(result.annual, 0)}/yr · −{earn.maxDrawdown}% guard ✓</span>
        </div>
        <button className="btn btn-primary btn-block" onClick={onView}>View position</button>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* ===== mfi-screens.jsx ===== */
/* =========================================================
   mfi-screens.jsx — Result · Open intents · Positions · Dashboard
   ========================================================= */

/* ---------------- Fill result (offer received) ---------------- */
function QuoteCountdown({ seconds = 84 }) {
  const [t, setT] = useState(seconds);
  useEffect(() => {
    if (t <= 0) return;
    const id = setTimeout(() => setT((x) => +(x - 0.1).toFixed(1)), 100);
    return () => clearTimeout(id);
  }, [t]);
  const pct = clamp(t / seconds, 0, 1) * 100;
  const low = t < 20;
  return (
    <div style={{ maxWidth: 520, margin: "0 auto 30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
        <span className="label" style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon.clock style={{ width: 14, height: 14, color: low ? "var(--pink)" : "var(--cyan)" }} /> Quote expires</span>
        <span className="num" style={{ fontSize: 14, fontWeight: 600, color: low ? "var(--pink)" : "var(--cyan)" }}>{Math.max(t, 0).toFixed(1)}s</span>
      </div>
      <div style={{ height: 6, borderRadius: 6, background: "var(--bg-1)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: low ? "var(--pink)" : "linear-gradient(90deg,var(--primary),var(--cyan))", transition: "width .1s linear" }} />
      </div>
    </div>
  );
}

function ResultScreen({ intent, result, onCreate, onViewPositions }) {
  const lane = LANES[result.lane];
  const ltv = +((intent.borrowAmount / (intent.collAmount * ASSETS[intent.collateralAsset].price)) * 100).toFixed(1);
  const clauses = [
    `No forced close above ${fmtUSD(ASSETS[intent.collateralAsset].price * (1 - intent.floorPct / 100))}`,
    `${intent.grace ? intent.grace + "h grace before any liquidation" : "Liquidate only at the floor"}`,
    `Rate frozen at ${result.rate.toFixed(2)}% for ${intent.termDays} days`,
    `Repay flexibly, no early-exit penalty`,
  ];
  return (
    <div className="rise" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <Pill tone="ok" style={{ marginBottom: 18 }}><Icon.check style={{ width: 13, height: 13 }} /> Offer received</Pill>
        <h1 className="h-xl" style={{ marginBottom: 14 }}>
          {fmtNum(intent.borrowAmount)} {intent.borrowAsset} <span style={{ color: "var(--ink-3)" }}>at</span> <span className="num" style={{ color: "var(--cyan)" }}>{result.rate.toFixed(2)}%</span>
        </h1>
        <p className="muted" style={{ fontSize: 17, marginBottom: 26 }}>
          Your agent closed <b style={{ color: lane.hex }}>{result.saved.toFixed(2)}%</b> under your {intent.maxRate.toFixed(2)}% ceiling
          {result.upside ? " by matching a CoA peer." : "."}
        </p>
        <QuoteCountdown seconds={84} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* terms */}
        <div className="card" style={{ padding: 26 }}>
          <span className="label">Final terms</span>
          <div style={{ marginTop: 16 }}>
            {[
              ["Borrow", `${fmtNum(intent.borrowAmount)} ${intent.borrowAsset}`],
              ["Collateral", `${fmtNum(intent.borrowAmount / ASSETS[intent.collateralAsset].price * 1.55, 2)} ${intent.collateralAsset}`],
              ["Rate (APR)", `${result.rate.toFixed(2)}%`, "var(--cyan)"],
              ["Term", `${intent.termDays} days`],
              ["Total interest", fmtUSD(intent.borrowAmount * result.rate / 100 * intent.termDays / 365, 0)],
              ["Filled via", result.upside ? "CoA P2P" : lane.label, lane.hex],
            ].map(([k, v, c]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
                <span className="num" style={{ fontSize: 13, color: "var(--ink-3)" }}>{k}</span>
                <span className="num" style={{ fontSize: 14, fontWeight: 600, color: c || "var(--ink-1)" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
              <span className="num" style={{ fontSize: 13, color: "var(--ink-3)" }}>LTV / LT</span>
              <span className="num" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)" }}>{ltv}% / 86.00%</span>
            </div>
          </div>
        </div>

        {/* counterparty + bond */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <span className="label">Counterparty</span>
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "14px 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(150deg,var(--bg-2),var(--bg-1))", border: `2px solid ${lane.hex}`, fontFamily: "var(--display)", fontWeight: 600, fontSize: 18, color: "#fff" }}>{result.filler[0]}</div>
              <div>
                <div className="h-sm">{result.filler}</div>
                <span className="num" style={{ fontSize: 12, color: lane.hex }}>{lane.label}</span>
              </div>
            </div>
            <p className="num" style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.6 }}>
              {result.upside
                ? "A counterparty agent wanted the opposite side. It beat your ceiling and keeps the spread as upside — you pay less, it earns the difference."
                : "Filled exactly at your intent terms. No upside was taken by the solver."}
            </p>
          </div>

          <div className="card" style={{ padding: 24, borderColor: "rgba(255,174,69,.28)", background: "linear-gradient(160deg,rgba(255,174,69,.06),var(--surface))" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Icon.shield style={{ width: 20, height: 20, color: "var(--amber)" }} />
              <span className="h-sm">Bond posted</span>
            </div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 34, color: "var(--ink)" }}>
              <span className="num">{fmtUSD(result.bond)}</span>
            </div>
            <p className="num" style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, margin: "8px 0 14px" }}>
              {result.filler} locked this bond. If it breaches any mandate clause below, the bond is slashed to you — automatically, on-chain.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {clauses.map((c) => (
                <div key={c} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <Icon.lock style={{ width: 14, height: 14, color: "var(--amber)", flex: "none", marginTop: 1 }} />
                  <span className="num" style={{ fontSize: 12, color: "var(--ink-2)" }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 24, justifyContent: "center" }}>
        <button className="btn btn-ghost btn-lg" onClick={onViewPositions}>Cancel</button>
        <button className="btn btn-primary btn-lg" onClick={onCreate}><Icon.lock style={{ width: 19, height: 19 }} /> Create position</button>
      </div>
    </div>
  );
}

/* ---------------- Open intents (resting book) ---------------- */
function OpenIntents({ onNew }) {
  const [tab, setTab] = useState("all");
  const rows = OPEN_INTENTS.filter((r) => tab === "all" ? true : tab === "mine" ? r.mine : r.side === tab);
  const notional = OPEN_INTENTS.reduce((s, r) => s + r.amt, 0);
  const statusTone = { resting: "", matching: "pri", partial: "warn" };

  return (
    <div className="rise">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 18, marginBottom: 24 }}>
        <div>
          <h1 className="h-lg">Open intents</h1>
          <p className="muted" style={{ marginTop: 8 }}>Intents that didn't fill instantly rest here as limit orders — any agent can fill them.</p>
        </div>
        <button className="btn btn-primary" onClick={onNew}><Icon.plus style={{ width: 18, height: 18 }} /> New intent</button>
      </div>

      {/* stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[["Resting intents", OPEN_INTENTS.length, ""], ["Total notional", fmtUSD(notional), ""], ["Avg fill time", "38s", "var(--cyan)"], ["Bonds at stake", fmtUSD(OPEN_INTENTS.reduce((s, r) => s + r.bond, 0)), "var(--amber)"]].map(([k, v, c]) => (
          <div key={k} className="card" style={{ padding: 18 }}>
            <span className="label">{k}</span>
            <div className="num" style={{ fontSize: 24, fontWeight: 600, color: c || "var(--ink)", marginTop: 8 }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--line)", flexWrap: "wrap", gap: 12 }}>
          <Segmented options={[{ value: "all", label: "All" }, { value: "borrow", label: "Borrow" }, { value: "lend", label: "Lend" }, { value: "mine", label: "Mine" }]} value={tab} onChange={setTab} />
          <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>{rows.length} shown</span>
        </div>

        {/* header */}
        <div style={{ display: "grid", gridTemplateColumns: "82px 1.3fr 1fr 0.7fr 0.8fr 1.1fr 1.3fr", gap: 14, padding: "12px 22px", borderBottom: "1px solid var(--line)" }}>
          {["Intent", "Side / size", "Collateral", "Term", "Max rate", "Mandate", "Status"].map((h) => <span key={h} className="label-sm">{h}</span>)}
        </div>

        {rows.map((r, i) => (
          <div key={r.id} style={{
            display: "grid", gridTemplateColumns: "82px 1.3fr 1fr 0.7fr 0.8fr 1.1fr 1.3fr", gap: 14, padding: "16px 22px",
            borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center",
            background: r.mine ? "var(--primary-12)" : "transparent",
          }}>
            <span className="num" style={{ fontSize: 13, color: r.mine ? "var(--primary-soft)" : "var(--ink-2)", fontWeight: 600 }}>{r.id}{r.mine && <span style={{ display: "block", fontSize: 9, letterSpacing: ".1em" }}>YOURS</span>}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <TokenIcon sym={r.asset} size={30} />
              <div>
                <div className="num" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)", whiteSpace: "nowrap" }}>{fmtNum(r.amt)} {r.asset}</div>
                <span className="num" style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: r.side === "borrow" ? "var(--amber)" : "var(--cyan)" }}>{r.side}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}><TokenIcon sym={r.coll} size={24} /><span className="num" style={{ fontSize: 13, color: "var(--ink-2)" }}>{r.coll}</span></div>
            <span className="num" style={{ fontSize: 13, color: "var(--ink-2)" }}>{r.term}d</span>
            <span className="num" style={{ fontSize: 14, color: "var(--ink-1)", fontWeight: 600 }}>{r.max.toFixed(2)}%</span>
            <span>{r.floor ? <Pill style={{ fontSize: 10 }}><Icon.shield style={{ width: 11, height: 11 }} />−{r.floor}%</Pill> : <span className="num" style={{ fontSize: 12, color: "var(--ink-4)" }}>—</span>}</span>
            <div>
              <Pill tone={statusTone[r.status]} style={{ fontSize: 10 }}>{r.status === "matching" && <LiveDot color="var(--primary-2)" />}{r.status}</Pill>
              {r.fill > 0 && <div style={{ marginTop: 7, height: 4, borderRadius: 4, background: "var(--bg-1)", overflow: "hidden" }}><div style={{ height: "100%", width: r.fill + "%", background: "linear-gradient(90deg,var(--primary),var(--cyan))" }} /></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Positions ---------------- */
function healthOf(p) {
  const pct = clamp((p.curPrice - p.floorPrice) / (p.entryPrice - p.floorPrice), 0, 1);
  const tone = pct > 0.45 ? { c: "var(--cyan)", t: "safe" } : pct > 0.22 ? { c: "var(--amber)", t: "watch" } : { c: "var(--pink)", t: "at risk" };
  return { pct, ...tone };
}

function PositionCard({ p, onAddMargin, onRepay }) {
  const lane = LANES[p.lane];
  const h = healthOf(p);
  const hf = (1 + h.pct).toFixed(2);
  const overdue = p.maturityDays < 0;
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <TokenIcon sym={p.asset} size={40} />
          <div>
            <div className="h-sm">{fmtNum(p.borrow)} {p.asset}</div>
            <span className="num" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{p.id} · vs {p.collAmt} {p.coll}</span>
          </div>
        </div>
        <Pill tone={p.lane === "p2p" ? "ok" : p.lane === "otc" ? "warn" : "pri"} style={{ fontSize: 10 }}>{lane.short}</Pill>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
        {[["Rate", p.rate.toFixed(2) + "%", "var(--cyan)"], ["Matures", p.maturityDays + "d", ""], ["Filled by", p.filler, lane.hex]].map(([k, v, c]) => (
          <div key={k}>
            <span className="label-sm">{k}</span>
            <div className="num" style={{ fontSize: 15, fontWeight: 600, color: c || "var(--ink-1)", marginTop: 5 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* mandate health */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="label-sm">Mandate health · {h.t}</span>
          <span className="num" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>floor {fmtUSD(p.floorPrice)}</span>
        </div>
        <div style={{ position: "relative", height: 8, borderRadius: 6, background: "var(--bg-1)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: (h.pct * 100) + "%", background: h.c, transition: ".4s", boxShadow: `0 0 12px ${h.c}` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
          <span className="num" style={{ fontSize: 11, color: "var(--ink-4)" }}>entry {fmtUSD(p.entryPrice)}</span>
          <span className="num" style={{ fontSize: 11, color: "var(--ink-2)" }}>now {fmtUSD(p.curPrice)}</span>
        </div>
      </div>

      {/* bond status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, background: p.bond ? "rgba(255,174,69,.07)" : "var(--bg-1)", border: "1px solid " + (p.bond ? "rgba(255,174,69,.2)" : "var(--line)") }}>
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Icon.shield style={{ width: 16, height: 16, color: p.bond ? "var(--amber)" : "var(--ink-4)" }} />
          <span className="num" style={{ fontSize: 12, color: "var(--ink-2)" }}>{p.bond ? "Bond protecting you" : "Open-market · no bond"}</span>
        </span>
        <span className="num" style={{ fontSize: 13, fontWeight: 600, color: p.bond ? "var(--amber)" : "var(--ink-4)" }}>{p.bond ? fmtUSD(p.bond) : "—"}</span>
      </div>

      {/* actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <Pill tone={h.t === "at risk" ? "bad" : h.t === "watch" ? "warn" : "ok"} style={{ fontSize: 10 }}>Health {hf}</Pill>
        <Pill tone={overdue ? "bad" : ""} style={{ fontSize: 10 }}>{overdue ? `Overdue ${-p.maturityDays}d` : `Maturity ${p.maturityDays}d`}</Pill>
        <span style={{ flex: 1 }} />
        <button className="btn btn-ghost" style={{ padding: "9px 16px", fontSize: 13 }} onClick={() => onAddMargin(p)}>Add margin</button>
        <button className="btn btn-primary" style={{ padding: "9px 16px", fontSize: 13 }} onClick={() => onRepay(p)}>{overdue ? "Repay" : "Early repay"}</button>
      </div>
    </div>
  );
}

function Positions({ onNew }) {
  const [addMargin, setAddMargin] = useState(null);
  const [repay, setRepay] = useState(null);
  const [rows, setRows] = useState(POSITIONS);
  useEffect(() => {
    api.listPositions().then((d) => { if (Array.isArray(d) && d.length) setRows(d); }).catch(() => {});
  }, []);
  return (
    <div className="rise">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 18, marginBottom: 24 }}>
        <div><h1 className="h-lg">Positions</h1><p className="muted" style={{ marginTop: 8 }}>Active loans, mandate health, and the bonds standing behind them.</p></div>
        <button className="btn btn-primary" onClick={onNew}><Icon.plus style={{ width: 18, height: 18 }} /> New intent</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 18 }}>
        {rows.map((p) => <PositionCard key={p.id} p={p} onAddMargin={setAddMargin} onRepay={setRepay} />)}
      </div>
      {addMargin && <AddMarginModal p={addMargin} onClose={() => setAddMargin(null)} />}
      {repay && <RepayModal p={repay} onClose={() => setRepay(null)} />}
    </div>
  );
}

/* ---------------- modal primitives ---------------- */
function ModalShell({ title, sub, onClose, children, w = 460 }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: w, padding: 26 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="h-sm">{title}</div>
            {sub && <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>{sub}</span>}
          </div>
          <button className="icon-btn" onClick={onClose}><Icon.close style={{ width: 16, height: 16 }} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const RowKV = ({ k, v, sub, c, strong }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "11px 0", borderBottom: "1px solid var(--line)" }}>
    <span className="num" style={{ fontSize: 13, color: strong ? c || "var(--primary-2)" : "var(--ink-3)", fontWeight: strong ? 600 : 400 }}>{k}</span>
    <span style={{ textAlign: "right" }}>
      <div className="num" style={{ fontSize: 14, fontWeight: 600, color: c || "var(--ink-1)" }}>{v}</div>
      {sub && <div className="num" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{sub}</div>}
    </span>
  </div>
);

/* ---------------- Add Margin ---------------- */
function AddMarginModal({ p, onClose }) {
  const [amt, setAmt] = useState(0);
  const ca = ASSETS[p.coll];
  const collBefore = p.collAmt, collAfter = +(p.collAmt + amt).toFixed(4);
  const debtUSD = p.borrow;
  const ltvBefore = (debtUSD / (collBefore * ca.price)) * 100;
  const ltvAfter = (debtUSD / (collAfter * ca.price)) * 100;
  const hfAfter = (86 / Math.max(ltvAfter, 0.01)).toFixed(2);
  return (
    <ModalShell title="Add margin" sub={`Pod ID : 0x${p.id.replace("#", "")}…A1B2`} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", borderRadius: 14, background: "var(--bg-2)", border: "1px solid var(--line-2)", marginBottom: 14 }}>
        <TokenIcon sym={p.coll} size={34} />
        <div><div style={{ fontWeight: 600, color: "var(--ink-1)" }}>{ca.name}</div><div className="num" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{p.coll}</div></div>
      </div>
      <AmountField value={amt} onChange={setAmt} unit={p.coll} sub={fmtUSD(amt * ca.price)}
        maxLabel={`${fmtNum(p.collAmt, 2)} ${p.coll}`} onMax={() => setAmt(+(p.collAmt).toFixed(2))} />
      <div style={{ marginTop: 18 }}>
        <RowKV k="Collateral (before)" v={`${fmtNum(collBefore, 2)} ${p.coll}`} sub={fmtUSD(collBefore * ca.price)} />
        <RowKV k="Collateral (after)" v={`${fmtNum(collAfter, 2)} ${p.coll}`} sub={fmtUSD(collAfter * ca.price)} c="var(--cyan)" />
        <RowKV k="Debt" v={`${fmtNum(debtUSD)} ${p.asset}`} sub={fmtUSD(debtUSD)} />
        <RowKV k="LTV (before → after)" v={`${ltvBefore.toFixed(1)}% → ${ltvAfter.toFixed(1)}%`} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0 4px" }}>
          <span className="num" style={{ fontSize: 13, color: "var(--primary-2)", fontWeight: 600 }}>Health factor (after)</span>
          <span className="num" style={{ fontSize: 18, fontWeight: 600, color: "var(--cyan)" }}>{hfAfter}</span>
        </div>
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} disabled={amt <= 0} onClick={onClose}>Add margin</button>
      <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={onClose}>Cancel</button>
    </ModalShell>
  );
}

/* ---------------- Repay & Close ---------------- */
function RepayModal({ p, onClose }) {
  const ca = ASSETS[p.coll];
  const wallet = useWallet();
  const [debt, setDebt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (wallet.address) getUsdcDebt(wallet.address).then(setDebt).catch(() => {});
  }, [wallet.address]);

  const onchainDebt = debt != null && debt > 0.001;
  const doRepay = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await repayOnNeverland({ owner: wallet.address });
      setTxHash(r.repayHash || "none");
      setDebt(await getUsdcDebt(wallet.address).catch(() => 0));
    } catch (e) { setErr(e?.shortMessage || e?.message || String(e)); }
    setBusy(false);
  };

  const principal = Math.round(p.borrow * 0.92);
  const fixedInterest = p.borrow - principal;
  return (
    <ModalShell title="Repay & close" sub={`Position ${p.id}`} onClose={onClose} w={500}>
      <RowKV k="Collateral" v={`${fmtNum(p.collAmt, 2)} ${p.coll}`} sub={fmtUSD(p.collAmt * ca.price)} />
      <RowKV k="Debt (principal)" v={`${fmtNum(principal)} ${p.asset}`} sub={fmtUSD(principal)} />
      <RowKV k="Debt (fixed rate)" v={`${fmtNum(fixedInterest)} ${p.asset}`} sub={fmtUSD(fixedInterest)} />
      <RowKV k="Rate" v={`${p.rate.toFixed(2)}%`} />
      <RowKV k="Maturity" v={`${p.maturityDays}D`} sub={fmtDate(addDays(p.maturityDays))} />

      {onchainDebt && (
        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: "rgba(110,84,255,.10)", border: "1px solid var(--line-strong)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="num" style={{ fontSize: 12.5, color: "var(--primary-soft)" }}>Live Neverland debt</span>
          <span className="num" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{debt.toFixed(6)} USDC</span>
        </div>
      )}
      {txHash && (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(133,230,255,.07)", border: "1px solid rgba(133,230,255,.22)" }}>
          <span className="num" style={{ fontSize: 12.5, color: "var(--cyan)" }}>Repaid on-chain ✓ </span>
          {txHash !== "none" && <a className="num" style={{ fontSize: 12, color: "var(--primary-2)", textDecoration: "underline" }} href={`https://monadscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">view tx</a>}
        </div>
      )}
      {err && <div className="num" style={{ marginTop: 12, fontSize: 12, color: "var(--pink)", wordBreak: "break-word" }}>{err}</div>}

      {onchainDebt ? (
        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={busy} onClick={doRepay}>
          {busy ? "Repaying…" : `Repay ${debt.toFixed(2)} USDC on Neverland`}
        </button>
      ) : (
        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={onClose}>
          {txHash ? "Done" : `Repay ${fmtNum(p.borrow)} ${p.asset} & close`}
        </button>
      )}
      <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={onClose}>{txHash ? "Close" : "Cancel"}</button>
    </ModalShell>
  );
}

/* ---------------- Loan created success ---------------- */
function SuccessModal({ intent, result, onMyPosition, onClose }) {
  const stages = ["Submitted", "Pending", "Settled"];
  const [done, setDone] = useState(0);
  useEffect(() => {
    const timers = stages.map((_, i) => setTimeout(() => setDone(i + 1), 500 + i * 650));
    return () => timers.forEach(clearTimeout);
  }, []);
  const lane = LANES[result.lane];
  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 440, padding: 30, textAlign: "center" }}>
        <h2 className="h-md" style={{ color: "var(--primary-2)", marginBottom: 18 }}>Fixed loan created</h2>
        {/* stage tracker */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 26 }}>
          {stages.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center", flex: "none", background: done > i ? "var(--primary)" : "var(--bg-2)", border: done > i ? "none" : "1px solid var(--line-2)", transition: ".3s" }}>
                  {done > i ? <Icon.check style={{ width: 12, height: 12, color: "#fff" }} /> : <span className="num" style={{ fontSize: 10, color: "var(--ink-3)" }}>{i + 1}</span>}
                </span>
                <span className="num" style={{ fontSize: 12, color: done > i ? "var(--ink-1)" : "var(--ink-3)" }}>{s}</span>
              </div>
              {i < stages.length - 1 && <span style={{ width: 26, height: 1, margin: "0 10px", background: done > i + 1 ? "var(--primary)" : "var(--line-2)", transition: ".3s" }} />}
            </React.Fragment>
          ))}
        </div>
        <div className="card" style={{ padding: 18, textAlign: "left", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center", fontFamily: "var(--mono)", fontWeight: 600, fontSize: 11, color: "#fff", background: `linear-gradient(150deg, ${lane.hex}, ${lane.hex}aa)` }}>{result.filler[0]}</span>
              <span className="num" style={{ fontSize: 13, color: "var(--ink-1)", fontWeight: 600 }}>{result.filler}</span>
            </span>
            <span className="num" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Tx 0xf81…bd82</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <TokenIcon sym={intent.collateralAsset} size={22} />
            <span className="num" style={{ fontSize: 13, color: "var(--ink-2)" }}>{fmtNum(intent.collAmount, 2)} {intent.collateralAsset}</span>
            <span style={{ color: "var(--ink-4)" }}>/</span>
            <TokenIcon sym={intent.borrowAsset} size={22} />
            <span className="num" style={{ fontSize: 13, color: "var(--ink-2)" }}>{fmtNum(intent.borrowAmount)} {intent.borrowAsset}</span>
          </div>
          <span className="num" style={{ fontSize: 12.5, color: "var(--cyan)" }}>{result.rate.toFixed(2)}% · {intent.termDays}D · bond {fmtUSD(result.bond)} ✓</span>
        </div>
        <button className="btn btn-primary btn-block" onClick={onMyPosition}>My position</button>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}


/* ---------------- Dashboard ---------------- */
function Dashboard({ onNew }) {
  const totalBorrow = POSITIONS.reduce((s, p) => s + p.borrow, 0);
  const totalBond = POSITIONS.reduce((s, p) => s + p.bond, 0);
  const blended = POSITIONS.reduce((s, p) => s + p.rate * p.borrow, 0) / totalBorrow;
  const saved = POSITIONS.reduce((s, p) => s + (p.max - p.rate) / 100 * p.borrow * p.maturityDays / 365, 0);
  const laneSplit = ["p2p", "otc", "open"].map((l) => ({ l, v: POSITIONS.filter((p) => p.lane === l).reduce((s, p) => s + p.borrow, 0) }));

  return (
    <div className="rise">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 18, marginBottom: 24 }}>
        <div><h1 className="h-lg">Dashboard</h1><p className="muted" style={{ marginTop: 8 }}>Your credit book, the rates your agent won, and the bonds protecting you.</p></div>
        <button className="btn btn-primary" onClick={onNew}><Icon.plus style={{ width: 18, height: 18 }} /> New intent</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          ["Net borrowed", fmtUSD(totalBorrow), "", "across 3 positions"],
          ["Blended APR", blended.toFixed(2) + "%", "var(--cyan)", "vs market 7.92%"],
          ["Bonds protecting you", fmtUSD(totalBond), "var(--amber)", "slashable on breach"],
          ["Saved vs ceilings", fmtUSD(saved, 0), "var(--cyan)", "agent negotiation"],
        ].map(([k, v, c, sub]) => (
          <div key={k} className="card" style={{ padding: 20 }}>
            <span className="label">{k}</span>
            <div className="num" style={{ fontSize: 28, fontWeight: 600, color: c || "var(--ink)", margin: "10px 0 4px" }}>{v}</div>
            <span className="num" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{sub}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
        {/* mandate health overview */}
        <div className="card" style={{ padding: 24 }}>
          <span className="label">Mandate health</span>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            {POSITIONS.map((p) => {
              const h = healthOf(p);
              return (
                <div key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 9, whiteSpace: "nowrap" }}><TokenIcon sym={p.coll} size={22} /><span className="num" style={{ fontSize: 13, color: "var(--ink-1)" }}>{p.id}</span><span className="num" style={{ fontSize: 11, color: "var(--ink-4)" }}>{p.coll}</span></span>
                    <span className="num" style={{ fontSize: 12, color: h.c }}>{h.t}</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 5, background: "var(--bg-1)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: (h.pct * 100) + "%", background: h.c, boxShadow: `0 0 10px ${h.c}` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* lane distribution */}
        <div className="card" style={{ padding: 24 }}>
          <span className="label">Fill sources</span>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 16 }}>
            {laneSplit.map(({ l, v }) => (
              <div key={l}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span className="num" style={{ fontSize: 13, color: "var(--ink-1)", whiteSpace: "nowrap" }}>{LANES[l].label}</span>
                  <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>{fmtUSD(v)}</span>
                </div>
                <div style={{ height: 7, borderRadius: 5, background: "var(--bg-1)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (v / totalBorrow * 100) + "%", background: LANES[l].hex, boxShadow: `0 0 10px ${LANES[l].hex}` }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
            <span className="label">Next maturity</span>
            <div className="num" style={{ fontSize: 18, fontWeight: 600, color: "var(--ink-1)", marginTop: 8 }}>{POSITIONS[1].id} · in 12 days</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== mfi-landing.jsx ===== */
/* =========================================================
   mfi-landing.jsx — landing / hero page (default view)
   ========================================================= */

/* a miniature of the agent arena: solver dots orbiting your intent */
function HeroOrbit() {
  const R = 132, C = 160;
  const ring = [
    { a: -90, hex: "#8B76FF", id: "morpho" }, { a: -38, hex: "#FFAE45", id: "wintermute" },
    { a: 14, hex: "#8B76FF", id: "euler" }, { a: 66, hex: "#FFAE45", id: "keyrock" },
    { a: 128, hex: "#8B76FF", id: "neverland" }, { a: 180, hex: "#FFAE45", id: "gsr" },
    { a: 232, hex: "#8B76FF", id: "curvance" }, { a: 300, hex: "#FFAE45", id: "flowtraders" },
  ];
  return (
    <div style={{ position: "relative", width: 320, height: 320, margin: "0 auto", flex: "none" }}>
      <svg width="320" height="320" style={{ position: "absolute", inset: 0 }}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(221,215,254,.10)" strokeWidth="1" strokeDasharray="2 7" />
        {ring.map((n, i) => {
          const x = C + R * Math.cos((n.a * Math.PI) / 180);
          const y = C + R * Math.sin((n.a * Math.PI) / 180);
          return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke={n.hex} strokeOpacity=".28" strokeWidth="1.2" />;
        })}
      </svg>
      {/* spinning ring of solvers */}
      <div style={{ position: "absolute", inset: 0, animation: "spinSlow 26s linear infinite" }}>
        {ring.map((n, i) => {
          const x = C + R * Math.cos((n.a * Math.PI) / 180);
          const y = C + R * Math.sin((n.a * Math.PI) / 180);
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", animation: "spinSlow 26s linear infinite reverse" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(150deg,var(--bg-2),var(--bg-1))", border: `2px solid ${n.hex}`, boxShadow: `0 0 16px ${n.hex}66`, color: "#fff", fontFamily: "var(--display)", fontWeight: 600 }}>
                {n.id ? <ProtocolLogo id={n.id} name={n.id} size={30} hex={n.hex} /> : n.g}
              </div>
            </div>
          );
        })}
      </div>
      {/* center intent */}
      <div style={{ position: "absolute", left: C, top: C, transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ position: "relative", width: 92, height: 92 }}>
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid var(--primary-40)", animation: "ping 2.6s ease-out infinite" }} />
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid var(--primary-40)", animation: "ping 2.6s ease-out infinite", animationDelay: "1.3s" }} />
          <div style={{ position: "absolute", inset: 6, borderRadius: "50%", background: "radial-gradient(circle,#1a1140,#0B0717)", border: "2px solid var(--primary)", display: "grid", placeItems: "center", boxShadow: "0 0 36px rgba(110,84,255,.6)" }}>
            <Mark size={40} fill="#fff" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Landing({ onLaunch }) {
  const [stats, setStats] = useState({ rate: null, live: false, intents: null, bonds: null });
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [h, intents, positions] = await Promise.all([
          api.health().catch(() => null),
          api.openIntents().catch(() => []),
          api.listPositions().catch(() => []),
        ]);
        if (!alive) return;
        const bonds = (positions || []).reduce((s, p) => s + (p.bond || 0), 0);
        setStats({
          rate: h?.rate?.usdcBorrowBps != null ? h.rate.usdcBorrowBps / 100 : null,
          live: !!h?.rate?.live,
          intents: Array.isArray(intents) ? intents.length : null,
          bonds,
        });
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  const lanes = [
    { id: "p2p", name: "Coincidence of agents", hex: "#85E6FF", glyph: "◆",
      body: "Another agent wants the opposite side of your loan. It matches you directly and keeps the spread — you pay less, no desk in the middle." },
    { id: "otc", name: "OTC solver desk", hex: "#FFAE45", glyph: "◑",
      body: "A market-making agent fills you from inventory and posts a bond against your mandate — slashable if it breaks the terms." },
    { id: "open", name: "Open market", hex: "#8B76FF", glyph: "M",
      body: "Routes to live Monad lending — Neverland, Curvance, Morpho, Euler — at the open floating rate, always available." },
  ];

  const steps = [
    { k: "01", t: "State your intent", b: "Collateral, debt, term, max rate — the deal you actually want." },
    { k: "02", t: "Set your mandate", b: "Forced-close floor, grace period, premium you'll pay. Hard constraints, not vibes." },
    { k: "03", t: "Agents compete", b: "The solver network negotiates a fill that beats your ceiling and honors your mandate." },
    { k: "04", t: "Bonded fill", b: "The winner posts a bond. Break the mandate and it's slashed to you, on-chain." },
  ];

  return (
    <div className="app">
      {/* nav */}
      <nav className="nav">
        <div className="wrap nav-in">
          <span className="brand"><Mark size={26} /><span className="wordmark">Co<b>A</b></span></span>
          <div className="nav-tabs" style={{ marginLeft: 8 }}>
            <a className="nav-tab" href="#how">How it works</a>
            <a className="nav-tab" href="#lanes">Fulfillment</a>
          </div>
          <div className="nav-right">
            <ConnectButton />
            <button className="btn btn-primary" style={{ padding: "11px 22px", fontSize: 14 }} onClick={onLaunch}>Launch app <Icon.arrow style={{ width: 17, height: 17 }} /></button>
          </div>
        </div>
      </nav>

      {/* hero */}
      <section className="wrap" style={{ padding: "72px 32px 40px", display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 40, alignItems: "center" }}>
        <div className="rise">
          <span className="pill pri" style={{ marginBottom: 22 }}><LiveDot /> Live on Monad</span>
          <h1 className="h-xl" style={{ marginBottom: 22 }}>Coincidence<br /><span style={{ color: "var(--primary-2)" }}>of Agents</span></h1>
          <p className="muted" style={{ fontSize: 20, lineHeight: 1.5, maxWidth: 540, marginBottom: 16 }}>
            Intent-based credit and yield. <b style={{ color: "var(--ink-1)" }}>Your terms, agentic execution.</b>
          </p>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, maxWidth: 520, marginBottom: 30, color: "var(--ink-3)" }}>
            State the deal you want and the risk you'll accept — a network of solver agents competes to fill it,
            and is bonded to your mandate.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-lg" onClick={onLaunch}>Create an intent <Icon.arrow style={{ width: 19, height: 19 }} /></button>
            <a className="btn btn-ghost btn-lg" href="#how">See how it works</a>
          </div>
        </div>
        <HeroOrbit />
      </section>

      {/* live stat strip */}
      <section className="wrap" style={{ padding: "8px 32px 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[
            ["Live market rate", stats.rate != null ? stats.rate.toFixed(2) + "%" : "—", stats.live ? "Neverland · on-chain" : "open market", "var(--cyan)"],
            ["Solvers in the network", "11", "agents + your own", "var(--ink)"],
            ["Open intents", stats.intents != null ? String(stats.intents) : "—", "resting in the book", "var(--ink)"],
            ["Bonds protecting borrowers", stats.bonds != null ? fmtUSD(stats.bonds) : "—", "slashable on breach", "var(--amber)"],
          ].map(([k, v, sub, c]) => (
            <div key={k} className="card" style={{ padding: 20 }}>
              <span className="label">{k}</span>
              <div className="num" style={{ fontSize: 26, fontWeight: 600, color: c, margin: "10px 0 4px" }}>{v}</div>
              <span className="num" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* lanes */}
      <section id="lanes" className="wrap" style={{ padding: "10px 32px 60px" }}>
        <span className="label">Three ways your intent fills</span>
        <h2 className="h-lg" style={{ margin: "12px 0 28px" }}>One intent, a whole market.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {lanes.map((l) => (
            <div key={l.id} className="card" style={{ padding: 26 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                {l.id === "open"
                  ? <span style={{ display: "flex" }}><ProtocolLogo id="morpho" name="Morpho" size={34} /></span>
                  : <span style={{ width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", background: `linear-gradient(150deg,${l.hex},${l.hex}aa)`, color: "#0B0717", fontWeight: 700 }}>{l.glyph}</span>}
                <span className="h-sm" style={{ fontSize: 17 }}>{l.name}</span>
              </div>
              <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.6 }}>{l.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="wrap" style={{ padding: "10px 32px 70px" }}>
        <span className="label">How it works</span>
        <h2 className="h-lg" style={{ margin: "12px 0 28px" }}>Intent in. Bonded loan out.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {steps.map((s) => (
            <div key={s.k} className="card" style={{ padding: 24 }}>
              <div className="num" style={{ fontSize: 13, color: "var(--primary-2)", marginBottom: 14 }}>{s.k}</div>
              <div className="h-sm" style={{ fontSize: 16, marginBottom: 8 }}>{s.t}</div>
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55 }}>{s.b}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <button className="btn btn-primary btn-lg" onClick={onLaunch}>Start your first intent <Icon.arrow style={{ width: 19, height: 19 }} /></button>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--line)", padding: "26px 0" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 9 }}><Mark size={18} /><span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>CoA · Coincidence of Agents on Monad</span></span>
          <span className="num" style={{ fontSize: 11, color: "var(--ink-4)" }}>Experimental preview · for demonstration only</span>
        </div>
      </footer>
    </div>
  );
}

/* ===== mfi-app.jsx ===== */
/* =========================================================
   mfi-app.jsx — shell, nav, state machine
   ========================================================= */
function App() {
  const [view, setView] = useState("landing"); // landing | app
  const [tab, setTab] = useState("borrow");
  const [step, setStep] = useState("intent"); // intent | mandate | arena | result
  const [intent, setIntent] = useState(DEFAULT_INTENT);
  const [result, setResult] = useState(null);
  const [connected, setConnected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [solveData, setSolveData] = useState(null);
  const [intentId, setIntentId] = useState(null);
  const [creditIntent, setCreditIntent] = useState(null);
  const wallet = useWallet();
  const signIntent = useSignIntent();
  const monPrice = useMonPrice();
  useEffect(() => { if (monPrice && ASSETS.MON) ASSETS.MON.price = monPrice; }, [monPrice]);

  // build intent -> sign (EIP-712) -> submit to orderbook -> run the solver auction
  const runSolve = useCallback(async () => {
    setSolveData(null);
    setStep("arena"); window.scrollTo({ top: 0 });
    try {
      const ci = toCreditIntent(intent, wallet.address);
      setCreditIntent(ci);
      const sig = await signIntent(ci);
      const { id } = await api.submitIntent(ci, sig);
      setIntentId(id);
      const data = await api.solve(id);
      setSolveData(data);
    } catch (e) {
      console.error("[CoA] solve failed", e);
      setSolveData({ error: String(e?.message || e) });
    }
  }, [intent, wallet.address, signIntent]);

  // persist the accepted fill as a position in the backend
  const createPosition = useCallback(async () => {
    const w = solveData && !solveData.error ? solveData.winner : null;
    const px = (ASSETS[intent.collateralAsset]?.price) || 0;
    // supply collateral and borrow on-chain via Neverland when the pair supports it
    if (wallet.address && canSettleOnChain(intent.collateralAsset, intent.borrowAsset)) {
      try {
        await openOnNeverland({ owner: wallet.address, collateralSym: intent.collateralAsset, collateralAmount: intent.collAmount, requestedBorrow: intent.borrowAmount });
      } catch (e) { console.warn("on-chain settle skipped:", e?.message || e); }
    }
    try {
      await api.createPosition({
        owner: wallet.address || "0x0",
        borrow: intent.borrowAmount, asset: intent.borrowAsset,
        coll: intent.collateralAsset, collAmt: intent.collAmount,
        rate: w ? w.rateBps / 100 : (result?.rate ?? intent.maxRate),
        max: intent.maxRate,
        lane: (w?.lane) || result?.lane || "p2p",
        filler: (w?.solverName) || result?.filler || "—",
        maturityDays: intent.termDays,
        entryPrice: px, curPrice: px,
        floorPrice: px * (1 - intent.floorPct / 100),
        bond: result?.bond ?? 0,
      });
    } catch (e) { console.error("[CoA] createPosition failed", e); }
    setShowSuccess(true);
  }, [solveData, intent, wallet.address, result, creditIntent]);

  // earn flow
  const [earn, setEarnState] = useState(DEFAULT_EARN);
  const [earnStep, setEarnStep] = useState("intent"); // intent | result
  const [earnResult, setEarnResult] = useState(null);
  const [showEarnSuccess, setShowEarnSuccess] = useState(false);

  const set = useCallback((patch) => setIntent((p) => ({ ...p, ...patch })), []);
  const setEarn = useCallback((patch) => setEarnState((p) => ({ ...p, ...patch })), []);
  const stepIdx = { intent: 0, mandate: 1, arena: 2, result: 3 }[step];

  const goBorrow = (s = "intent") => { setTab("borrow"); setStep(s); window.scrollTo({ top: 0 }); };
  const goEarn = () => { setTab("earn"); setEarnStep("intent"); window.scrollTo({ top: 0 }); };

  const tabs = [
    { id: "borrow", label: "Borrow", icon: Icon.bank },
    { id: "earn", label: "Earn", icon: Icon.spark },
    { id: "book", label: "Open Intents", icon: Icon.book, live: true },
    { id: "positions", label: "Positions", icon: Icon.grid },
    { id: "dashboard", label: "Dashboard", icon: Icon.node },
  ];

  if (view === "landing") {
    return <Landing onLaunch={() => { setView("app"); setTab("borrow"); setStep("intent"); window.scrollTo({ top: 0 }); }} />;
  }

  return (
    <div className="app">
      {/* NAV */}
      <nav className="nav">
        <div className="wrap nav-in">
          <button className="brand" onClick={() => { setView("landing"); window.scrollTo({ top: 0 }); }}>
            <Mark size={26} />
            <span className="wordmark">Co<b>A</b></span>
          </button>
          <div className="nav-tabs">
            {tabs.map((t) => (
              <button key={t.id} className={"nav-tab" + (tab === t.id ? " active" : "")}
                onClick={() => { setTab(t.id); window.scrollTo({ top: 0 }); }}>
                {t.label}{t.live && <span className="dot" />}
              </button>
            ))}
          </div>
          <div className="nav-right">
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="wrap" style={{ flex: 1, padding: "44px 32px 80px" }}>
        {tab === "borrow" && (
          <>
            {step !== "result" && (
              <div style={{ marginBottom: 40, display: "flex", justifyContent: "center" }}>
                <FlowHeader step={stepIdx} />
              </div>
            )}
            {step === "intent" && <IntentBuilder intent={intent} set={set} onNext={() => { setStep("mandate"); window.scrollTo({ top: 0 }); }} />}
            {step === "mandate" && <RiskMandate intent={intent} set={set} onBack={() => setStep("intent")} onNext={runSolve} />}
            {step === "arena" && <AgentArena key="arena" intent={intent} solveData={solveData} onBack={() => setStep("mandate")} onDone={(r) => { setResult(r); setStep("result"); window.scrollTo({ top: 0 }); }} />}
            {step === "result" && result && <ResultScreen intent={intent} result={result} onCreate={createPosition} onViewPositions={() => { setTab("positions"); setStep("intent"); window.scrollTo({ top: 0 }); }} />}
          </>
        )}

        {tab === "earn" && (
          <>
            <div style={{ marginBottom: 40, display: "flex", justifyContent: "center" }}>
              <EarnFlowHeader step={earnStep === "result" ? 1 : 0} />
            </div>
            {earnStep === "intent" && <EarnBuilder earn={earn} set={setEarn} onNext={() => { setEarnStep("result"); window.scrollTo({ top: 0 }); }} />}
            {earnStep === "result" && <EarnResult earn={earn} onBack={() => { setEarnStep("intent"); window.scrollTo({ top: 0 }); }} onDeploy={(r) => { setEarnResult(r); setShowEarnSuccess(true); }} />}
          </>
        )}

        {tab === "book" && <OpenIntents onNew={() => goBorrow("intent")} />}
        {tab === "positions" && <Positions onNew={() => goBorrow("intent")} />}
        {tab === "dashboard" && <Dashboard onNew={() => goBorrow("intent")} />}
      </main>

      {showSuccess && result && (
        <SuccessModal intent={intent} result={result}
          onMyPosition={() => { setConnected(true); setShowSuccess(false); setStep("intent"); setTab("positions"); window.scrollTo({ top: 0 }); }}
          onClose={() => { setConnected(true); setShowSuccess(false); setStep("intent"); setTab("positions"); window.scrollTo({ top: 0 }); }} />
      )}

      {showEarnSuccess && earnResult && (
        <EarnSuccessModal earn={earn} result={earnResult}
          onView={() => { setConnected(true); setShowEarnSuccess(false); setEarnStep("intent"); setTab("dashboard"); window.scrollTo({ top: 0 }); }}
          onClose={() => { setConnected(true); setShowEarnSuccess(false); setEarnStep("intent"); setTab("dashboard"); window.scrollTo({ top: 0 }); }} />
      )}

      <footer style={{ borderTop: "1px solid var(--line)", padding: "26px 0" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 9 }}><Mark size={18} /><span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>CoA · Coincidence of Agents on Monad</span></span>
          <span className="num" style={{ fontSize: 11, color: "var(--ink-4)" }}>Experimental preview · for demonstration only</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
