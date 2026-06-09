import { createPublicClient, http, type Address } from "viem";
import { NETWORKS, PROTOCOLS, TOKENS } from "@mfi/shared/addresses";

/**
 * Live open-market borrow rate, read from Neverland (Aave V3) on Monad.
 * `getReserveData(asset)` returns `currentVariableBorrowRate` in RAY (1e27);
 * APR% = rate / 1e27 * 100.
 */

const CHAIN = process.env.CHAIN === "monadTestnet" ? NETWORKS.monadTestnet : NETWORKS.monad;
const DEFAULT_USDC_BORROW_BPS = 792;

const client = createPublicClient({
  transport: http(CHAIN.rpcUrls[0]),
});

// classic Aave v3.0 DataTypes.ReserveData
const AAVE_V3_RESERVE_DATA_ABI = [
  {
    type: "function",
    name: "getReserveData",
    stateMutability: "view",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "configuration", type: "uint256" },
          { name: "liquidityIndex", type: "uint128" },
          { name: "currentLiquidityRate", type: "uint128" },
          { name: "variableBorrowIndex", type: "uint128" },
          { name: "currentVariableBorrowRate", type: "uint128" },
          { name: "currentStableBorrowRate", type: "uint128" },
          { name: "lastUpdateTimestamp", type: "uint40" },
          { name: "id", type: "uint16" },
          { name: "aTokenAddress", type: "address" },
          { name: "stableDebtTokenAddress", type: "address" },
          { name: "variableDebtTokenAddress", type: "address" },
          { name: "interestRateStrategyAddress", type: "address" },
          { name: "accruedToTreasury", type: "uint128" },
          { name: "unbacked", type: "uint128" },
          { name: "isolationModeTotalDebt", type: "uint128" },
        ],
      },
    ],
  },
] as const;

export interface RateInfo {
  source: string;
  usdcBorrowBps: number;
  live: boolean;
  note?: string;
}

let cache: { at: number; info: RateInfo } | null = null;

export async function getOpenMarketRate(): Promise<RateInfo> {
  if (cache && Date.now() - cache.at < 30_000) return cache.info;

  const pool = PROTOCOLS.neverland.pool.address as Address | null;
  const usdc = TOKENS.USDC.address as Address | null;

  let info: RateInfo;
  if (!pool || !usdc) {
    info = { source: "open-market", usdcBorrowBps: DEFAULT_USDC_BORROW_BPS, live: false, note: "missing pool/usdc address" };
  } else {
    try {
      const data: any = await client.readContract({
        address: pool,
        abi: AAVE_V3_RESERVE_DATA_ABI,
        functionName: "getReserveData",
        args: [usdc],
      });
      const rayRate = BigInt(data.currentVariableBorrowRate);
      // ray -> bps: rate/1e27*10000
      const bps = Number((rayRate * 10000n) / 10n ** 27n);
      if (bps > 0 && bps < 10000) {
        info = { source: "Neverland", usdcBorrowBps: bps, live: true };
      } else {
        info = { source: "open-market", usdcBorrowBps: DEFAULT_USDC_BORROW_BPS, live: false, note: `read ${bps}bps, out of range` };
      }
    } catch (e: any) {
      info = { source: "open-market", usdcBorrowBps: DEFAULT_USDC_BORROW_BPS, live: false, note: `read failed: ${String(e?.shortMessage || e?.message || e).slice(0, 120)}` };
    }
  }
  cache = { at: Date.now(), info };
  return info;
}
