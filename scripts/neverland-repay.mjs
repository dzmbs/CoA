/**
 * Repay USDC debt on Neverland (Aave V3) on Monad mainnet.
 *
 *   PRIVATE_KEY=0x... node scripts/neverland-repay.mjs
 *
 * Approves USDC and repays the wallet's variable USDC debt (up to its balance).
 */
import { createWalletClient, createPublicClient, http, formatUnits, erc20Abi, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC = "https://rpc.monad.xyz";
const POOL = "0x80F00661b13CC5F6ccd3885bE7b4C9c67545D585";
const USDC = "0x754704Bc059F8C67012fEd69BC8A327a5aafb603";
const V_DEBT_USDC = "0xb26FB5e35f6527d6f878F7784EA71774595B249C";

const monad = defineChain({ id: 143, name: "Monad", nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 }, rpcUrls: { default: { http: [RPC] } } });
const POOL_ABI = [{ type: "function", name: "repay", stateMutability: "nonpayable", inputs: [{ name: "a", type: "address" }, { name: "amt", type: "uint256" }, { name: "m", type: "uint256" }, { name: "o", type: "address" }], outputs: [{ type: "uint256" }] }];

const PK = process.env.PRIVATE_KEY;
if (!PK) { console.error("set PRIVATE_KEY"); process.exit(1); }
const account = privateKeyToAccount(PK);
const wallet = createWalletClient({ account, chain: monad, transport: http(RPC) });
const pub = createPublicClient({ chain: monad, transport: http(RPC) });

const send = async (label, req) => { const h = await wallet.writeContract(req); console.log(`  ${label}: ${h}`); await pub.waitForTransactionReceipt({ hash: h }); return h; };

async function main() {
  console.log(`account ${account.address}`);
  const debt = await pub.readContract({ address: V_DEBT_USDC, abi: erc20Abi, functionName: "balanceOf", args: [account.address] });
  const bal = await pub.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [account.address] });
  console.log(`debt: ${formatUnits(debt, 6)} USDC | balance: ${formatUnits(bal, 6)} USDC`);
  if (debt === 0n) { console.log("no debt"); return; }

  const amount = debt <= bal ? debt : bal;
  await send("approve", { address: USDC, abi: erc20Abi, functionName: "approve", args: [POOL, amount] });
  await send("repay", { address: POOL, abi: POOL_ABI, functionName: "repay", args: [USDC, amount, 2n, account.address] });

  const after = await pub.readContract({ address: V_DEBT_USDC, abi: erc20Abi, functionName: "balanceOf", args: [account.address] });
  console.log(`remaining debt: ${formatUnits(after, 6)} USDC`);
}
main().catch((e) => { console.error(e?.shortMessage || e?.message || e); process.exit(1); });
