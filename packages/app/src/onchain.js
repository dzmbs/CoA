/* On-chain settlement through Neverland (Aave V3) on Monad: wrap MON, supply
   WMON as collateral, borrow USDC. Standard Aave V3 flow. */
import { writeContract, waitForTransactionReceipt, readContract } from "@wagmi/core";
import { erc20Abi, parseUnits } from "viem";
import { wagmiConfig } from "./providers";
import { activeChain } from "./chains";
import { PROTOCOLS, TOKENS } from "@mfi/shared/addresses";

const POOL = PROTOCOLS.neverland.pool.address;
const WMON = TOKENS.WMON.address;
const USDC = TOKENS.USDC.address;
const V_DEBT_USDC = PROTOCOLS.neverland.reserves.USDC.variableDebt;
const INTEREST_RATE_MODE = 2n; // variable

const WMON_ABI = [
  { type: "function", name: "deposit", stateMutability: "payable", inputs: [], outputs: [] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [{ name: "wad", type: "uint256" }], outputs: [] },
];

const POOL_ABI = [
  {
    type: "function", name: "supply", stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" }, { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" }, { name: "referralCode", type: "uint16" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "borrow", stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" }, { name: "amount", type: "uint256" },
      { name: "interestRateMode", type: "uint256" }, { name: "referralCode", type: "uint16" },
      { name: "onBehalfOf", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "repay", stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" }, { name: "amount", type: "uint256" },
      { name: "interestRateMode", type: "uint256" }, { name: "onBehalfOf", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "getUserAccountData", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "totalCollateralBase", type: "uint256" },
      { name: "totalDebtBase", type: "uint256" },
      { name: "availableBorrowsBase", type: "uint256" },
      { name: "currentLiquidationThreshold", type: "uint256" },
      { name: "ltv", type: "uint256" },
      { name: "healthFactor", type: "uint256" },
    ],
  },
];

/** The open-market borrow path supports MON/WMON collateral against USDC. */
export function canSettleOnChain(collateralSym, borrowSym = "USDC") {
  return (collateralSym === "MON" || collateralSym === "WMON") && borrowSym === "USDC" && !!POOL && !!WMON && !!USDC;
}

async function tx(params) {
  const hash = await writeContract(wagmiConfig, { chainId: activeChain.id, ...params });
  await waitForTransactionReceipt(wagmiConfig, { hash });
  return hash;
}

/**
 * Supply MON/WMON collateral on Neverland and borrow USDC. The borrow amount is
 * capped to the wallet's on-chain borrowing power. `collateralAmount` and
 * `requestedBorrow` are human units. Returns { supplyHash, borrowHash, borrowed }.
 */
export async function openOnNeverland({ owner, collateralSym, collateralAmount, requestedBorrow }) {
  const collWei = parseUnits(String(collateralAmount), 18);

  if (collateralSym === "MON") {
    await tx({ address: WMON, abi: WMON_ABI, functionName: "deposit", value: collWei });
  }

  const allowance = await readContract(wagmiConfig, {
    chainId: activeChain.id, address: WMON, abi: erc20Abi, functionName: "allowance", args: [owner, POOL],
  });
  if (allowance < collWei) {
    await tx({ address: WMON, abi: erc20Abi, functionName: "approve", args: [POOL, collWei] });
  }

  const supplyHash = await tx({ address: POOL, abi: POOL_ABI, functionName: "supply", args: [WMON, collWei, owner, 0] });

  // size the borrow to real borrowing power (availableBorrowsBase is in USD, 8 decimals)
  const acct = await readContract(wagmiConfig, {
    chainId: activeChain.id, address: POOL, abi: POOL_ABI, functionName: "getUserAccountData", args: [owner],
  });
  const availableBase = acct[2];
  const maxUsdcUnits = (availableBase * 10n ** BigInt(TOKENS.USDC.decimals)) / 10n ** 8n;
  const requestedUnits = parseUnits(String(requestedBorrow), TOKENS.USDC.decimals);
  // borrow the smaller of requested and 90% of capacity
  const borrowUnits = requestedUnits < (maxUsdcUnits * 9n) / 10n ? requestedUnits : (maxUsdcUnits * 9n) / 10n;
  if (borrowUnits <= 0n) return { supplyHash, borrowHash: null, borrowed: 0 };

  const borrowHash = await tx({ address: POOL, abi: POOL_ABI, functionName: "borrow", args: [USDC, borrowUnits, INTEREST_RATE_MODE, 0, owner] });
  return { supplyHash, borrowHash, borrowed: Number(borrowUnits) / 10 ** TOKENS.USDC.decimals };
}

/** Current USDC debt (human units) for an owner on Neverland. */
export async function getUsdcDebt(owner) {
  const debt = await readContract(wagmiConfig, {
    chainId: activeChain.id, address: V_DEBT_USDC, abi: erc20Abi, functionName: "balanceOf", args: [owner],
  });
  return Number(debt) / 10 ** TOKENS.USDC.decimals;
}

/** Repay the owner's USDC debt on Neverland (up to its USDC balance). Returns the repay tx hash. */
export async function repayOnNeverland({ owner }) {
  const debt = await readContract(wagmiConfig, {
    chainId: activeChain.id, address: V_DEBT_USDC, abi: erc20Abi, functionName: "balanceOf", args: [owner],
  });
  if (debt === 0n) return { repayHash: null, repaid: 0 };
  const bal = await readContract(wagmiConfig, {
    chainId: activeChain.id, address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [owner],
  });
  const amount = debt <= bal ? debt : bal;
  if (amount <= 0n) throw new Error("no USDC to repay with");
  await tx({ address: USDC, abi: erc20Abi, functionName: "approve", args: [POOL, amount] });
  const repayHash = await tx({ address: POOL, abi: POOL_ABI, functionName: "repay", args: [USDC, amount, INTEREST_RATE_MODE, owner] });
  return { repayHash, repaid: Number(amount) / 10 ** TOKENS.USDC.decimals };
}
