import { useState, useEffect, useCallback } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID, MODULE } from '@/types/contract';

export interface MarketPrices {
  yesPrice: number; // Price in basis points (0-10000, where 10000 = 100%)
  noPrice: number;  // Price in basis points (0-10000, where 10000 = 100%)
}

export interface UseMarketPricesResult {
  prices: MarketPrices | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch current market prices
 */
export function useMarketPrices(marketId: string): UseMarketPricesResult {
  const client = useSuiClient();
  const [prices, setPrices] = useState<MarketPrices | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!marketId) {
      setPrices(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the get_market_prices function on the contract
      const result = await client.devInspectTransactionBlock({
        transactionBlock: {
          kind: 'programmableTransaction',
          inputs: [
            {
              type: 'object',
              objectType: 'immOrOwnedObject',
              objectId: marketId,
            },
          ],
          transactions: [
            {
              MoveCall: {
                package: PACKAGE_ID,
                module: MODULE,
                function: 'get_market_prices',
                arguments: [0], // Reference to the market object
              },
            },
          ],
        },
        sender: '0x0000000000000000000000000000000000000000000000000000000000000000', // Dummy sender
      });

      if (result.results && result.results.length > 0) {
        const returnValues = result.results[0].returnValues;
        if (returnValues && returnValues.length >= 2) {
          const yesPrice = parseInt(returnValues[0][0], 16);
          const noPrice = parseInt(returnValues[1][0], 16);
          
          setPrices({
            yesPrice,
            noPrice,
          });
        } else {
          setError('Invalid price data received');
          setPrices(null);
        }
      } else {
        setError('No price data received');
        setPrices(null);
      }
    } catch (err) {
      console.error('Error fetching market prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market prices');
      setPrices(null);
    } finally {
      setIsLoading(false);
    }
  }, [client, marketId]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return {
    prices,
    isLoading,
    error,
    refetch: fetchPrices,
  };
}
