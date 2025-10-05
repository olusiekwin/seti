import { useState, useEffect, useCallback } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { SuiObjectData } from '@mysten/sui/client';
import { MarketData, UseMarketResult, PACKAGE_ID, MODULE } from '@/types/contract';

/**
 * Hook to fetch a single market by ID
 */
export function useMarket(marketId: string): UseMarketResult {
  const client = useSuiClient();
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
      // First try to get the object directly
      const object = await client.getObject({
        id: marketId,
        options: {
          showContent: true,
          showType: true,
        },
      });

      if (object.data) {
        const marketData = parseMarketObject(object.data);
        setData(marketData);
      } else {
        setError('Market not found');
        setData(null);
      }
    } catch (err) {
      console.error('Error fetching market:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [client, marketId]);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMarket,
  };
}

/**
 * Parse Sui object data into MarketData interface
 */
function parseMarketObject(object: SuiObjectData): MarketData {
  if (!object.content || object.content.dataType !== 'moveObject') {
    throw new Error('Invalid market object');
  }

  const fields = object.content.fields as any;

  return {
    id: object.objectId,
    question: fields.question || '',
    description: fields.description || '',
    end_time: parseInt(fields.end_time || '0'),
    creator: fields.creator || '',
    resolved: fields.resolved || false,
    winning_outcome: parseInt(fields.winning_outcome || '0'),
    total_liquidity: parseInt(fields.total_liquidity || '0'),
    outcome_a_shares: parseInt(fields.outcome_a_shares || '0'),
    outcome_b_shares: parseInt(fields.outcome_b_shares || '0'),
    liquidity_providers: fields.liquidity_providers || {},
    volume_24h: parseInt(fields.volume_24h || '0'),
    created_timestamp: parseInt(fields.created_timestamp || '0'),
    category: fields.category || '',
    image_url: fields.image_url || '',
    tags: Array.isArray(fields.tags) ? fields.tags : [],
  };
}
