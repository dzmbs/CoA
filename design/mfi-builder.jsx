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

Object.assign(window, { FlowHeader, IntentBuilder, RiskMandate, addDays, fmtDate, AmountField, TokenSelect, OptionRow, Panel, StepRow });
