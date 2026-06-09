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

Object.assign(window, { ResultScreen, OpenIntents, Positions, Dashboard, SuccessModal });
