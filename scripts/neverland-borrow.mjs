/**
 * Real Neverland (Aave V3) supply + borrow on Monad mainnet.
 *
 *   PRIVATE_KEY=0x... MON_COLLATERAL=5 USDC_BORROW=2 node scripts/neverland-borrow.mjs
 *
 * Wraps MON -> WMON, supplies WMON as collateral, borrows USDC. Prints tx hashes.
 * Needs the wallet funded with MON (gas + collateral). Start small.
 */
import { createWalletClient, createPublicClient, http, parseUnits, formatUnits, erc20Abi, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC = "https://rpc.monad.xyz";
const POOL = "0x80F00661b13CC5F6ccd3885bE7b4C9c67545D585";
const WMON = "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A";
const USDC = "0x754704Bc059F8C67012fEd69BC8A327a5aafb603";

const monad = defineChain({
  id: 143, name: "Monad",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
});

const WMON_ABI = [{ type: "function", name: "deposit", stateMutability: "payable", inputs: [], outputs: [] }];
const POOL_ABI = [
  { type: "function", name: "supply", stateMutability: "nonpayable", inputs: [{ name: "a", type: "address" }, { name: "amt", type: "uint256" }, { name: "o", type: "address" }, { name: "r", type: "uint16" }], outputs: [] },
  { type: "function", name: "borrow", stateMutability: "nonpayable", inputs: [{ name: "a", type: "address" }, { name: "amt", type: "uint256" }, { name: "m", type: "uint256" }, { name: "r", type: "uint16" }, { name: "o", type: "address" }], outputs: [] },
  { type: "function", name: "getUserAccountData", stateMutability: "view", inputs: [{ name: "u", type: "address" }], outputs: [{ type: "uint256" }, { type: "uint256" }, { type: "uint256" }, { type: "uint256" }, { type: "uint256" }, { type: "uint256" }] },
];

const PK = process.env.PRIVATE_KEY;
if (!PK) { console.error("set PRIVATE_KEY"); process.exit(1); }
const collMon = process.env.MON_COLLATERAL || "5";
const borrowUsdc = process.env.USDC_BORROW || "2";

const account = privateKeyToAccount(PK);
const wallet = createWalletClient({ account, chain: monad, transport: http(RPC) });
const pub = createPublicClient({ chain: monad, transport: http(RPC) });

const send = async (label, req) => {
  const hash = await wallet.writeContract(req);
  console.log(`  ${label}: ${hash}`);
  await pub.waitForTransactionReceipt({ hash });
  return hash;
};

async function main() {
  console.log(`account ${account.address}`);
  const collWei = parseUnits(collMon, 18);
  const borrowUnits = parseUnits(borrowUsdc, 6);

  console.log(`wrap ${collMon} MON -> WMON`);
  await send("deposit", { address: WMON, abi: WMON_ABI, functionName: "deposit", value: collWei });

  console.log(`approve WMON to pool`);
  await send("approve", { address: WMON, abi: erc20Abi, functionName: "approve", args: [POOL, collWei] });

  console.log(`supply ${collMon} WMON`);
  await send("supply", { address: POOL, abi: POOL_ABI, functionName: "supply", args: [WMON, collWei, account.address, 0] });

  const acct = await pub.readContract({ address: POOL, abi: POOL_ABI, functionName: "getUserAccountData", args: [account.address] });
  console.log(`available to borrow (base units): ${acct[2]}`);

  console.log(`borrow ${borrowUsdc} USDC`);
  await send("borrow", { address: POOL, abi: POOL_ABI, functionName: "borrow", args: [USDC, borrowUnits, 2n, 0, account.address] });

  const usdcBal = await pub.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [account.address] });
  console.log(`done. USDC balance now: ${formatUnits(usdcBal, 6)}`);
}

main().catch((e) => { console.error(e?.shortMessage || e?.message || e); process.exit(1); });
