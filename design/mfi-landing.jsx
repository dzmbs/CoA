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
