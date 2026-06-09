/**
 * Address book for m.fi on Monad. Every entry carries the source it was taken
 * from. Re-check before each deployment — explorer URLs can change.
 */

export type ChainKey = "monad" | "monadTestnet";

export interface AddressEntry {
  address: `0x${string}` | null;
  verified: boolean;
  source: string;
  note?: string;
}

/* ----------------------------- Networks ----------------------------- */

export const NETWORKS = {
  monad: {
    chainId: 143,
    name: "Monad",
    rpcUrls: ["https://rpc.monad.xyz", "https://rpc1.monad.xyz", "https://rpc2.monad.xyz"],
    explorer: "https://monadscan.com",
    nativeSymbol: "MON",
    source: "https://docs.monad.xyz/developer-essentials/network-information",
  },
  monadTestnet: {
    chainId: 10143,
    name: "Monad Testnet",
    rpcUrls: ["https://testnet-rpc.monad.xyz"],
    explorer: "https://testnet.monadexplorer.com",
    nativeSymbol: "MON",
    faucet: "https://faucet.monad.xyz",
    source: "https://chainlist.org/chain/10143",
  },
} as const;

/* --------------------------- Token addresses (mainnet 143) --------------------------- */

export const TOKENS: Record<string, AddressEntry & { symbol: string; decimals: number }> = {
  USDC: {
    symbol: "USDC", decimals: 6,
    address: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
    verified: true,
    source: "https://monadscan.com/token/0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
  },
  WMON: {
    symbol: "WMON", decimals: 18,
    address: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A",
    verified: true,
    source: "https://docs.monad.xyz/developer-essentials/network-information/tokens-and-bridges",
    note: "Wrapped MON (WETH9-style: deposit() / withdraw()). Collateral for the open-market lane.",
  },
  WBTC: {
    symbol: "WBTC", decimals: 8,
    address: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
    verified: true,
    source: "https://monadscan.com/token/0x0555e30da8f98308edb960aa94c0db47230d2b9c",
  },
  aprMON: {
    symbol: "aprMON", decimals: 18,
    address: "0xb2f82D0f38dc453D596Ad40A37799446Cc89274A",
    verified: true,
    source: "https://aprlabs.gitbook.io/apriori-docs/smart-contract-integration",
  },
  WETH: { symbol: "WETH", decimals: 18, address: null, verified: false, source: "" },
  USDT: { symbol: "USDT", decimals: 6, address: null, verified: false, source: "" },
  DAI: { symbol: "DAI", decimals: 18, address: null, verified: false, source: "" },
};

/* --------------------- Open-market lending protocols (mainnet 143) --------------------- */

export const PROTOCOLS = {
  neverland: {
    name: "Neverland",
    kind: "aave-v3",
    docs: "https://docs.neverland.money/smart-contracts",
    pool: {
      address: "0x80F00661b13CC5F6ccd3885bE7b4C9c67545D585",
      verified: true,
      source: "https://docs.neverland.money/smart-contracts",
      note: "Aave V3 Pool proxy — standard supply()/borrow().",
    } as AddressEntry,
    poolDataProvider: {
      address: "0xfd0b6b6F736376F7B99ee989c749007c7757fDba",
      verified: true,
      source: "https://docs.neverland.money/smart-contracts",
    } as AddressEntry,
    oracle: {
      address: "0x94bbA11004B9877d13bb5E1aE29319b6f7bDEdD4",
      verified: true,
      source: "https://docs.neverland.money/smart-contracts",
      note: "AaveOracle — getAssetPrice(asset) returns USD price, 8 decimals.",
    } as AddressEntry,
    // reserves used by the open-market borrow flow (supply WMON, borrow USDC)
    reserves: {
      WMON: {
        underlying: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A",
        aToken: "0xD0fd2Cf7F6CEff4F96B1161F5E995D5843326154",
        variableDebt: "0x3acA285b9F57832fF55f1e6835966890845c1526",
      },
      USDC: {
        underlying: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
        aToken: "0x38648958836eA88b368b4ac23b86Ad44B0fe7508",
        variableDebt: "0xb26FB5e35f6527d6f878F7784EA71774595B249C",
      },
    },
  },
  curvance: {
    name: "Curvance",
    kind: "modular-ctoken",
    docs: "https://docs.curvance.com/cve/protocol-overview/contract-addresses",
    centralRegistry: {
      address: "0x1310f352f1389969Ece6741671c4B919523912fF",
      verified: true,
      source: "https://docs.curvance.com/cve/protocol-overview/contract-addresses",
    } as AddressEntry,
    marketManager: {
      address: "0x5EA0a1Cf3501C954b64902c5e92100b8A2CaB1Ac",
      verified: true,
      source: "https://docs.curvance.com/cve/protocol-overview/contract-addresses",
    } as AddressEntry,
  },
  morpho: {
    name: "Morpho Blue",
    kind: "morpho-blue",
    docs: "https://docs.morpho.org/get-started/resources/addresses",
    singleton: {
      address: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
      verified: false,
      source: "https://docs.morpho.org/get-started/resources/addresses",
    } as AddressEntry,
  },
  euler: {
    name: "Euler V2",
    kind: "evk-evc",
    docs: "https://docs.euler.finance/developers/contract-addresses/",
    evc: { address: null, verified: false, source: "https://docs.euler.finance/developers/contract-addresses/" } as AddressEntry,
  },
} as const;

/* ----------------- m.fi escrow + bond contract (set after deploy) ----------------- */

export const MFI_CONTRACTS: Record<string, AddressEntry> = {
  escrow: {
    address: null,
    verified: false,
    source: "contracts/script/Deploy.s.sol",
  },
};

export function requireAddress(entry: AddressEntry, label: string): `0x${string}` {
  if (!entry.address) {
    throw new Error(`[m.fi] ${label}: address not set. Source: ${entry.source || "n/a"}`);
  }
  return entry.address;
}
