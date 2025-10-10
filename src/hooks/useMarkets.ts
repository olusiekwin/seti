import { useState, useEffect } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { MarketData } from '@/types/contract';

export function useMarkets() {
  const client = useSuiClient();
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, return sample data for testing with performance charts
      // This will be replaced with actual contract queries once the contract is deployed

      // TODO: Implement actual market fetching when contract is deployed
      // Example implementation:
      // const objects = await client.getOwnedObjects({
      //   owner: '0x0', // Replace with actual owner or use getObjectsByType
      //   options: {
      //     showContent: true,
      //     showType: true,
      //   },
      // });

      // Sample markets for testing with performance data
      const sampleMarkets: MarketData[] = [
        {
          id: 'sample-1',
          question: 'Will Bitcoin reach $100,000 by end of 2024?',
          description: 'Bitcoin price prediction for the end of 2024. Based on current market trends and adoption.',
          end_time: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
          creator: '0x123...abc',
          resolved: false,
          winning_outcome: 0,
          total_liquidity: 50000000000, // 50 SUI in MIST
          outcome_a_shares: 25000000000, // 25 SUI
          outcome_b_shares: 25000000000, // 25 SUI
          liquidity_providers: {},
          volume_24h: 5000000000, // 5 SUI
          created_timestamp: Math.floor(Date.now() / 1000) - (5 * 24 * 60 * 60), // 5 days ago
          category: 'Crypto',
          image_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=300&fit=crop',
          tags: ['bitcoin', 'crypto', 'price-prediction']
        },
        {
          id: 'sample-2',
          question: 'Will the S&P 500 close above 5,000 by December 31, 2024?',
          description: 'Stock market prediction for the S&P 500 index performance.',
          end_time: Math.floor(Date.now() / 1000) + (45 * 24 * 60 * 60), // 45 days from now
          creator: '0x456...def',
          resolved: false,
          winning_outcome: 0,
          total_liquidity: 30000000000, // 30 SUI
          outcome_a_shares: 18000000000, // 18 SUI
          outcome_b_shares: 12000000000, // 12 SUI
          liquidity_providers: {},
          volume_24h: 2000000000, // 2 SUI
          created_timestamp: Math.floor(Date.now() / 1000) - (3 * 24 * 60 * 60), // 3 days ago
          category: 'Stocks',
          image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
          tags: ['stocks', 'sp500', 'market-prediction']
        },
        {
          id: 'sample-3',
          question: 'Will Team A win the championship this season?',
          description: 'Sports prediction for the upcoming championship game.',
          end_time: Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60), // 60 days from now
          creator: '0x789...ghi',
          resolved: false,
          winning_outcome: 0,
          total_liquidity: 20000000000, // 20 SUI
          outcome_a_shares: 12000000000, // 12 SUI
          outcome_b_shares: 8000000000, // 8 SUI
          liquidity_providers: {},
          volume_24h: 1000000000, // 1 SUI
          created_timestamp: Math.floor(Date.now() / 1000) - (1 * 24 * 60 * 60), // 1 day ago
          category: 'Sports',
          image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop',
          tags: ['sports', 'championship', 'team-a']
        },
        {
          id: 'sample-4',
          question: 'Will AI achieve AGI by 2025?',
          description: 'Artificial General Intelligence prediction for 2025.',
          end_time: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
          creator: '0xabc...123',
          resolved: false,
          winning_outcome: 0,
          total_liquidity: 80000000000, // 80 SUI
          outcome_a_shares: 60000000000, // 60 SUI
          outcome_b_shares: 20000000000, // 20 SUI
          liquidity_providers: {},
          volume_24h: 8000000000, // 8 SUI
          created_timestamp: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60), // 7 days ago
          category: 'Technology',
          image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
          tags: ['ai', 'agi', 'technology', 'future']
        },
        {
          id: 'sample-5',
          question: 'Will there be a major economic recession in 2024?',
          description: 'Economic prediction for global recession in 2024.',
          end_time: Math.floor(Date.now() / 1000) + (200 * 24 * 60 * 60), // 200 days from now
          creator: '0xdef...456',
          resolved: false,
          winning_outcome: 0,
          total_liquidity: 40000000000, // 40 SUI
          outcome_a_shares: 15000000000, // 15 SUI
          outcome_b_shares: 25000000000, // 25 SUI
          liquidity_providers: {},
          volume_24h: 3000000000, // 3 SUI
          created_timestamp: Math.floor(Date.now() / 1000) - (2 * 24 * 60 * 60), // 2 days ago
          category: 'Economics',
          image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
          tags: ['economics', 'recession', 'global-economy']
        },
        {
          id: 'sample-6',
          question: 'Will Tesla (TSLA) stock reach $400 by end of 2024?',
          description: 'Market prediction for Tesla stock performance. Price target of $400 per share based on company growth, market conditions, and EV industry trends.',
          end_time: Math.floor(Date.now() / 1000) + (300 * 24 * 60 * 60), // 300 days from now
          creator: '0xstock789',
          resolved: false,
          winning_outcome: 0,
          total_liquidity: 100000000000, // 100 SUI
          outcome_a_shares: 65000000000, // 65 SUI
          outcome_b_shares: 35000000000, // 35 SUI
          liquidity_providers: {},
          volume_24h: 12000000000, // 12 SUI
          created_timestamp: Math.floor(Date.now() / 1000) - (1 * 24 * 60 * 60), // 1 day ago
          category: 'Stocks',
          image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
          tags: ['stocks', 'tesla', 'ev-market', 'price-prediction']
        }
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMarkets(sampleMarkets);

    } catch (err) {
      console.error('Error fetching markets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, [client]);

  return {
    markets,
    isLoading,
    error,
    refetch: fetchMarkets,
  };
}
