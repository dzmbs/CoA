import { defineChain } from "viem";
import { NETWORKS } from "@mfi/shared/addresses";

/**
 * Monad chain objects. We define them locally (rather than importing from
 * viem/chains) so the values are pinned to our verified address book and don't
 * silently change with a viem bump. Values cross-checked against viem source +
 * Monad docs (June 2026).
 */

export const monad = defineChain({
  id: NETWORKS.monad.chainId,
  name: NETWORKS.monad.name,
  nativeCurrency: { name: "Monad", symbol: NETWORKS.monad.nativeSymbol, decimals: 18 },
  rpcUrls: { default: { http: [...NETWORKS.monad.rpcUrls] } },
  blockExplorers: { default: { name: "Monadscan", url: NETWORKS.monad.explorer } },
  contracts: {
    multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11", blockCreated: 9248132 },
  },
});

export const monadTestnet = defineChain({
  id: NETWORKS.monadTestnet.chainId,
  name: NETWORKS.monadTestnet.name,
  nativeCurrency: { name: "Testnet MON", symbol: NETWORKS.monadTestnet.nativeSymbol, decimals: 18 },
  rpcUrls: { default: { http: [...NETWORKS.monadTestnet.rpcUrls] } },
  blockExplorers: { default: { name: "Monad Testnet Explorer", url: NETWORKS.monadTestnet.explorer } },
  testnet: true,
  contracts: {
    multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11", blockCreated: 251449 },
  },
});

const CHAIN = import.meta.env.VITE_CHAIN === "monadTestnet" ? monadTestnet : monad;
export const activeChain = CHAIN;
export const supportedChains = [monad, monadTestnet] as const;
