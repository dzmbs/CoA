/* Live asset prices from Neverland's on-chain oracle (USD, 8 decimals). */
import { useReadContract } from "wagmi";
import { activeChain } from "./chains";
import { PROTOCOLS, TOKENS } from "@mfi/shared/addresses";

const ORACLE = PROTOCOLS.neverland.oracle.address;
const WMON = TOKENS.WMON.address;

const ORACLE_ABI = [
  { type: "function", name: "getAssetPrice", stateMutability: "view", inputs: [{ name: "asset", type: "address" }], outputs: [{ type: "uint256" }] },
];

/** MON/USD from the oracle (MON is priced via WMON). Returns a Number or null. */
export function useMonPrice() {
  const { data } = useReadContract({
    address: ORACLE,
    abi: ORACLE_ABI,
    functionName: "getAssetPrice",
    args: [WMON],
    chainId: activeChain.id,
    query: { enabled: !!ORACLE && !!WMON },
  });
  return data != null ? Number(data) / 1e8 : null;
}
