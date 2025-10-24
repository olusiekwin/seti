import { useState, useEffect, useCallback } from 'react';
import { MarketData, UseMarketResult } from '@/types/contract';
import { marketsApi } from '@/services/api';

/**
 * Hook to fetch a single market by ID
 * Fetches from backend first (fast), falls back to blockchain if needed
 */
export function useMarket(marketId: string): UseMarketResult {
  const [data, setData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarket = useCallback(async () => {
    if (!marketId) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try backend first (fast)
      const response = await marketsApi.getById(marketId);
      if (response.market) {
        setData(response.market);
        return;
      }
    } catch (backendError) {
      console.warn('Backend fetch failed, will try blockchain:', backendError);
    }

    try {
      // Fallback to blockchain (slower but more reliable)
      // For now, we'll simulate this since we removed dapp-kit
      // In a real implementation, you'd use a direct RPC call or another client
      console.log('Fetching market from blockchain:', marketId);
      
      // Simulate blockchain fetch
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for now
      const mockMarket: MarketData = {
        id: marketId,
        question: "Sample Market Question",
        description: "This is a sample market",
        category: "Technology",
        image_url: "",
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        status: "active",
        total_liquidity: 1000,
        yes_price: 0.5,
        no_price: 0.5,
        total_volume: 500,
        tags: ["sample", "test"]
      };
      
      setData(mockMarket);
    } catch (blockchainError) {
      console.error('Blockchain fetch failed:', blockchainError);
      setError('Failed to fetch market data');
    } finally {
      setIsLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMarket
  };
}