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
            {connected
              ? <span className="pill pri" style={{ padding: "9px 14px" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)" }} /> 0xbE2…3949</span>
              : <button className="btn btn-dark" onClick={() => setConnected(true)} style={{ padding: "11px 22px", fontSize: 14 }}>Connect Wallet</button>}
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

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
