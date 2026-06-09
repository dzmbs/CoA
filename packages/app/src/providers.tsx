import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "wagmi";
import { monad, monadTestnet, activeChain } from "./chains";

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [monad, monadTestnet],
  transports: {
    [monad.id]: http(),
    [monadTestnet.id]: http(),
  },
});

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string;

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["wallet", "email"],
        appearance: {
          theme: "dark",
          accentColor: "#6E54FF",
          walletList: ["metamask", "detected_wallets", "wallet_connect"],
        },
        embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
        defaultChain: activeChain,
        supportedChains: [monad, monadTestnet],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
