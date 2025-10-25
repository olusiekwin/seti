import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractService } from '../services/contract';
import { PREDICTION_MARKET_ABI, CONTRACT_ADDRESS } from '../lib/contract-abi';

export interface PredictionParams {
  marketId: string;
  outcome: 'YES' | 'NO';
  amount: number; // in ETH
}

export interface StoredPrediction {
  id: string;
  marketId: string;
  marketQuestion?: string;
  marketCategory?: string;
  outcome: 'YES' | 'NO';
  amount: number;
  price?: number;
  timestamp: number;
  status?: 'active' | 'closed' | 'won' | 'lost';
}

// Local storage functions
export const savePredictions = (predictions: StoredPrediction[]) => {
  try {
    const existing = getPredictions();
    const updated = [...existing, ...predictions];
    localStorage.setItem('user_predictions', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save predictions:', error);
  }
};

export const getPredictions = (): StoredPrediction[] => {
  try {
    const stored = localStorage.getItem('user_predictions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load predictions:', error);
    return [];
  }
};

export const getPredictionById = (id: string): StoredPrediction | null => {
  try {
    const predictions = getPredictions();
    return predictions.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Failed to get prediction by id:', error);
    return null;
  }
};

export function usePrediction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const placePrediction = async (params: PredictionParams): Promise<boolean> => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Placing prediction on smart contract:', params);
      
      // Convert outcome to number (0 = NO, 1 = YES)
      const outcome = params.outcome === 'YES' ? 1 : 0;
      
      // Convert amount to wei (assuming amount is in ETH)
      const amountInWei = BigInt(Math.floor(params.amount * 1e18));
      
      // Call smart contract placeBet function
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'placeBet',
        args: [BigInt(params.marketId), outcome],
        value: amountInWei,
      });

      // Wait for transaction confirmation
      if (isSuccess && hash) {
        // Record prediction in backend
        await contractService.createPrediction({
          market_id: params.marketId,
          user_address: address,
          outcome: outcome,
          amount: Math.floor(params.amount * 1e18),
          transaction_hash: hash
        });

        // Store prediction locally for UI
        const prediction: StoredPrediction = {
          id: `${params.marketId}-${Date.now()}`,
          marketId: params.marketId,
          outcome: params.outcome,
          amount: params.amount,
          timestamp: Date.now(),
        };
        
        savePredictions([prediction]);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to place prediction');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    placePrediction,
    isLoading: isLoading || isPending || isConfirming,
    error: error || writeError?.message,
    isConnected,
    hash,
    isSuccess,
  };
}

// Helper function to get user's prediction statistics
export function useUserPredictionStats() {
  const predictions = getPredictions();
  
  const active = predictions.filter(p => p.status === 'active' || !p.status);
  const closed = predictions.filter(p => p.status === 'closed');
  const won = predictions.filter(p => p.status === 'won');
  const lost = predictions.filter(p => p.status === 'lost');
  
  const activeValue = active.reduce((sum, p) => sum + p.amount, 0);
  const totalWon = won.reduce((sum, p) => sum + p.amount, 0);
  const totalLost = lost.reduce((sum, p) => sum + p.amount, 0);
  
  return {
    totalPredictions: predictions.length,
    activePredictions: active.length,
    closedPredictions: closed.length,
    wonPredictions: won.length,
    lostPredictions: lost.length,
    activeValue,
    totalWon,
    totalLost,
    winRate: predictions.length > 0 ? (won.length / predictions.length) * 100 : 0,
  };
}