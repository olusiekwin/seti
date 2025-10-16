import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

// Configure Wagmi & RainbowKit
export const config = getDefaultConfig({
  appName: 'Seti',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '',
  chains: [mainnet, sepolia],
  ssr: false,
});

export const DEFAULT_CHAIN = mainnet;