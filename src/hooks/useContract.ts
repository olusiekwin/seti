import { useReadContract } from 'wagmi';
import { PREDICTION_MARKET_ABI, CONTRACT_ADDRESS } from '../lib/contract-abi';

/**
 * Hook for reading from the PredictionMarket smart contract
 */
export function useContract() {
  // Get total number of markets
  const { data: nextMarketId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'nextMarketId',
  });

  // Get a specific market
  const getMarket = (marketId: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'markets',
      args: [BigInt(marketId)],
    });
  };

  // Get user's bet for a market
  const getUserBet = (marketId: number, userAddress: string) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'bets',
      args: [BigInt(marketId), userAddress as `0x${string}`],
    });
  };

  return {
    nextMarketId: nextMarketId ? Number(nextMarketId) : 0,
    getMarket,
    getUserBet,
  };
}

/**
 * Hook for getting all markets from smart contract
 */
export function useAllMarkets() {
  const { nextMarketId } = useContract();
  
  // This would need to be implemented with multiple contract calls
  // For now, we'll use the backend API which caches the data
  return {
    totalMarkets: nextMarketId,
    isLoading: false,
  };
}
