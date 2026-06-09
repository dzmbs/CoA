import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useSwitchChain, useSignTypedData, useBalance, useReadContract } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { activeChain } from "./chains";
import { creditIntentDomain, CREDIT_INTENT_TYPES, toTypedMessage } from "@mfi/shared/intent";
import { TOKENS } from "@mfi/shared/addresses";

const ZERO = "0x0000000000000000000000000000000000000000";
const short = (a) => (a ? `${a.slice(0, 5)}…${a.slice(-4)}` : "");

/** Connected wallet's native MON balance on the active chain. */
export function useNativeBalance() {
  const { address } = useAccount();
  const { data } = useBalance({ address, chainId: activeChain.id, query: { enabled: !!address } });
  return {
    formatted: data ? +formatUnits(data.value, data.decimals) : null,
    symbol: data?.symbol || activeChain.nativeCurrency.symbol,
  };
}

/** Connected wallet's ERC-20 balance for a symbol that has a known address. */
export function useTokenBalance(sym) {
  const t = TOKENS[sym];
  const addr = t?.address || null;
  const decimals = t?.decimals ?? 18;
  const { address } = useAccount();
  const { data } = useReadContract({
    address: addr || undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: activeChain.id,
    query: { enabled: !!address && !!addr },
  });
  return { formatted: data != null ? +formatUnits(data, decimals) : null, decimals, available: !!addr };
}

/** Async signer for a CreditIntent (EIP-712). */
export function useSignIntent() {
  const { signTypedDataAsync } = useSignTypedData();
  return async (creditIntent) => {
    try {
      return await signTypedDataAsync({
        domain: creditIntentDomain(activeChain.id, ZERO),
        types: CREDIT_INTENT_TYPES,
        primaryType: "CreditIntent",
        message: toTypedMessage(creditIntent),
      });
    } catch {
      return null;
    }
  };
}

/** Unified wallet state for the app. */
export function useWallet() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address, chainId } = useAccount();
  return {
    ready,
    connected: authenticated && !!address,
    address: address ?? null,
    displayAddress: short(address),
    onWrongChain: !!address && chainId !== activeChain.id,
    login,
    logout,
  };
}

function Dot({ color = "var(--cyan)" }) {
  return (
    <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />
  );
}

export function ConnectButton() {
  const w = useWallet();
  const bal = useNativeBalance();
  const { switchChain } = useSwitchChain();

  if (!w.ready) {
    return <span className="num" style={{ fontSize: 12, color: "var(--ink-3)" }}>…</span>;
  }

  if (w.connected) {
    if (w.onWrongChain) {
      return (
        <button className="btn btn-dark" style={{ padding: "11px 18px", fontSize: 13 }}
          onClick={() => switchChain?.({ chainId: activeChain.id })}>
          <Dot color="var(--amber)" /> Switch to {activeChain.name}
        </button>
      );
    }
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        {bal.formatted != null && (
          <span className="num" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
            {bal.formatted.toFixed(3)} {bal.symbol}
          </span>
        )}
        <button className="pill pri" style={{ padding: "9px 14px" }} onClick={w.logout} title="Disconnect">
          <Dot /> {w.displayAddress}
        </button>
      </span>
    );
  }

  return (
    <button className="btn btn-dark" onClick={w.login} style={{ padding: "11px 22px", fontSize: 14 }}>
      Connect Wallet
    </button>
  );
}
