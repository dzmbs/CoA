import { readFileSync, writeFileSync } from "node:fs";

const order = ["mfi-data","mfi-builder","mfi-arena","mfi-earn","mfi-screens","mfi-landing","mfi-app"];
let out = "";
for (const f of order) {
  let s = readFileSync(`design/${f}.jsx`, "utf8");
  // drop the React-hook destructure (we provide it in the header)
  s = s.replace(/const \{ useState, useEffect, useRef, useMemo, useCallback \} = React;\s*/g, "");
  // drop window-global re-exports (single or multi line)
  s = s.replace(/Object\.assign\(window,\s*\{[\s\S]*?\}\);\s*/g, "");
  // drop the bootstrap render (App is exported instead)
  s = s.replace(/ReactDOM\.createRoot\([\s\S]*?\.render\(<App \/>\);\s*/g, "");
  // public assets are served from web root in Vite
  s = s.replace(/"assets\//g, '"/assets/');
  // wire the real wallet button into the nav (replaces the prototype's fake connect)
  if (f === "mfi-app") {
    s = s.replace(
      /<div className="nav-right">[\s\S]*?<\/div>/,
      '<div className="nav-right">\n            <ConnectButton />\n          </div>',
    );
  }
  out += `\n/* ===== ${f}.jsx ===== */\n` + s.trimEnd() + "\n";
}

const header = `/* Generated from design/*.jsx by scripts/assemble.mjs. Edit the design files and re-run. */
import React from "react";
const { useState, useEffect, useRef, useMemo, useCallback } = React;
import { ConnectButton, useWallet, useSignIntent, useTokenBalance, useNativeBalance } from "../wallet.jsx";
import { useMonPrice } from "../prices.js";
import { api, toCreditIntent } from "../api.js";
import { canSettleOnChain, openOnNeverland, repayOnNeverland, getUsdcDebt } from "../onchain.js";
`;

writeFileSync("packages/app/src/mfi/App.jsx", header + out + "\nexport default App;\n");
console.log("wrote packages/app/src/mfi/App.jsx (" + (header+out).split("\n").length + " lines)");
