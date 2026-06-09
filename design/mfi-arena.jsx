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
      setScale(Math.min(w / STAGE, h / STAGE, 1.05));
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

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22, alignItems: "stretch" }}>
        {/* graph */}
        <div className="card" style={{ position: "relative", overflow: "hidden", minHeight: 600, background: "radial-gradient(circle at 50% 45%, rgba(110,84,255,.10), transparent 60%), var(--surface)" }}>
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
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 600 }}>
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

Object.assign(window, { AgentArena });
