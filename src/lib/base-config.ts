/**
 * Base Blockchain Configuration
 * Base L2 configuration for Ethereum smart contracts
 */

import { base, baseSepolia } from 'viem/chains';

export const BASE_CONFIG = {
  // Chain configuration
  CHAIN_ID: parseInt(import.meta.env.VITE_BASE_CHAIN_ID || "8453"),
  CHAIN: parseInt(import.meta.env.VITE_BASE_CHAIN_ID || "8453") === 8453 ? base : baseSepolia,
  
  // RPC URLs
  RPC_URL: import.meta.env.VITE_BASE_RPC_URL || "https://mainnet.base.org",
  
  // Contract addresses (to be deployed)
  CONTRACTS: {
    PREDICTION_MARKET: import.meta.env.VITE_BASE_MARKET_CONTRACT || "",
  },
  
  // Explorer
  EXPLORER_URL: parseInt(import.meta.env.VITE_BASE_CHAIN_ID || "8453") === 8453
    ? "https://basescan.org"
    : "https://sepolia.basescan.org",
};

// Network configuration for wagmi
export const baseNetworkConfig = {
  chains: [base, baseSepolia],
  defaultChain: BASE_CONFIG.CHAIN,
};

