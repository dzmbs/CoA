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

Object.assign(window, { EarnFlowHeader, EarnBuilder, EarnResult, EarnSuccessModal });
