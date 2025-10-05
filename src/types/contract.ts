// TypeScript types matching the Sui contract structure
import { SuiObjectData } from '@mysten/sui/client';

// Environment configuration
export const PACKAGE_ID =
  (import.meta as any).env?.VITE_PACKAGE_ID ||
  (import.meta as any).env?.VITE_SUI_PACKAGE_ID ||
  '0x9fb4dbbd21acb0e9c3f61a6f7bf91a098ebd772f87e764fcdfe582069936fdcb';
export const MODULE = 'polymarket';

// Market data interface matching the Move struct exactly
export interface MarketData {
  id: string; // Object ID
  question: string;
  description: string;
  end_time: number; // u64 timestamp
  creator: string; // address
  resolved: boolean;
  winning_outcome: number; // 0 = false, 1 = true, 2 = invalid/canceled
  total_liquidity: number; // u64
  outcome_a_shares: number; // Balance<SUI> converted to number
  outcome_b_shares: number; // Balance<SUI> converted to number
  liquidity_providers: any; // Bag - complex type, will be handled separately
  volume_24h: number; // u64
  created_timestamp: number; // u64
  category: string;
  image_url: string;
  tags: string[];
}

// Legacy interface for backward compatibility
export interface Market extends MarketData {}

// Hook return types
export interface UseMarketResult {
  data: MarketData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseCreateMarketResult {
  createMarket: (params: CreateMarketParams) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

// Parameters for creating a market
export interface CreateMarketParams {
  question: string;
  description: string;
  endTime: Date | number; // JS Date or Unix timestamp
  category: string;
  imageUrl: string;
  tags: string[];
  initialLiquiditySui: number; // SUI amount (will be converted to MIST)
}

export interface MarketCreated {
  market_id: string; // ID converted to string
  creator: string; // address
  question: string;
  end_time: number; // u64
}

export interface TradeExecuted {
  market_id: string; // ID converted to string
  trader: string; // address
  outcome: number; // 0 or 1
  amount: number; // u64
  price: number; // u64
}

// Helper function to calculate prices from shares
export function calculatePrices(outcome_a_shares: number, outcome_b_shares: number): { yesPrice: number; noPrice: number } {
  const total_shares = outcome_a_shares + outcome_b_shares;
  if (total_shares === 0) {
    return { yesPrice: 50, noPrice: 50 }; // Default 50/50 if no liquidity
  }
  
  const yesPrice = Math.round((outcome_b_shares / total_shares) * 100);
  const noPrice = Math.round((outcome_a_shares / total_shares) * 100);
  
  return { yesPrice, noPrice };
}

// Helper function to format time remaining
export function formatTimeRemaining(endTime: number): string {
  const now = Date.now() / 1000; // Convert to seconds
  const timeLeft = endTime - now;
  
  if (timeLeft <= 0) {
    return "Ended";
  }
  
  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else {
    return `${hours}h`;
  }
}

// Helper function to format volume
export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(0)}K`;
  } else {
    return volume.toString();
  }
}
