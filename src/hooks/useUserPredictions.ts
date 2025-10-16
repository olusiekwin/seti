import { useState, useEffect } from 'react';
import { predictionsApi } from '@/services/api';

export interface UserPrediction {
  id: number;
  transaction_hash: string;
  market_id: string;
  user_address: string;
  outcome: number;
  outcome_label: 'YES' | 'NO';
  amount: number;
  price: number;
  shares: number;
  timestamp: number;
  created_at: string;
  market?: {
    question: string;
    category: string;
    resolved: boolean;
    winning_outcome: number;
  };
}

/**
 * Hook to fetch user predictions from Supabase via backend
 */
export function useUserPredictions(userAddress?: string) {
  const [predictions, setPredictions] = useState<UserPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = async () => {
    if (!userAddress) {
      setPredictions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await predictionsApi.getAll({
        user_address: userAddress
      });

      setPredictions(response.predictions || []);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [userAddress]);

  return {
    predictions,
    isLoading,
    error,
    refetch: fetchPredictions,
  };
}

/**
 * Hook to fetch recent platform predictions
 */
export function useRecentPredictions(limit: number = 50) {
  const [predictions, setPredictions] = useState<UserPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await predictionsApi.getRecent(limit);
      setPredictions(response.predictions || []);
    } catch (err) {
      console.error('Error fetching recent predictions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [limit]);

  return {
    predictions,
    isLoading,
    error,
    refetch: fetchPredictions,
  };
}

