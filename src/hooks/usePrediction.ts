import { useState } from 'react';
import { useCurrentWallet, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import { PACKAGE_ID, MODULE } from '@/types/contract';

export interface PredictionParams {
  marketId: string;
  outcome: 'YES' | 'NO';
  amount: number; // in SUI
}

export interface StoredPrediction {
  id: string;
  marketId: string;
  marketQuestion?: string;
  marketCategory?: string;
  outcome: 'YES' | 'NO';
  amount: number;
  price?: number;
  potentialPayout?: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'active' | 'resolved' | 'won' | 'lost';
  actualPayout?: number;
  settledAt?: string;
}

// Alias for backward compatibility
export type Prediction = StoredPrediction;

// LocalStorage key for predictions
const PREDICTIONS_STORAGE_KEY = 'seti_predictions';

// Get predictions from localStorage
export function getPredictions(): StoredPrediction[] {
  try {
    const stored = localStorage.getItem(PREDICTIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading predictions from localStorage:', error);
    return [];
  }
}

// Save predictions to localStorage
export function savePredictions(predictions: StoredPrediction[]): void {
  try {
    localStorage.setItem(PREDICTIONS_STORAGE_KEY, JSON.stringify(predictions));
  } catch (error) {
    console.error('Error saving predictions to localStorage:', error);
  }
}

// Get active predictions (pending, confirmed, or active)
export function getActivePredictions(): StoredPrediction[] {
  const predictions = getPredictions();
  return predictions.filter(p => p.status === 'pending' || p.status === 'confirmed' || p.status === 'active');
}

// Get closed predictions (resolved, won, or lost)
export function getClosedPredictions(): StoredPrediction[] {
  const predictions = getPredictions();
  return predictions.filter(p => p.status === 'resolved' || p.status === 'won' || p.status === 'lost');
}

// Get a single prediction by ID
export function getPredictionById(id: string): StoredPrediction | undefined {
  const predictions = getPredictions();
  return predictions.find(p => p.id === id);
}

// Settle a prediction (mark as won or lost)
export function settlePrediction(id: string, won: boolean, actualPayout?: number): boolean {
  try {
    const predictions = getPredictions();
    const index = predictions.findIndex(p => p.id === id);
    
    if (index === -1) {
      console.error(`Prediction with id ${id} not found`);
      return false;
    }
    
    predictions[index] = {
      ...predictions[index],
      status: won ? 'won' : 'lost',
      actualPayout: actualPayout || 0,
      settledAt: new Date().toISOString(),
    };
    
    savePredictions(predictions);
    return true;
  } catch (error) {
    console.error('Error settling prediction:', error);
    return false;
  }
}

// Calculate prediction statistics
export function calculatePredictionStats() {
  const predictions = getPredictions();
  const active = getActivePredictions();
  const closed = getClosedPredictions();
  
  const totalInvested = predictions.reduce((sum, p) => sum + p.amount, 0);
  const totalPayout = closed.reduce((sum, p) => sum + (p.actualPayout || 0), 0);
  const totalProfit = totalPayout - closed.reduce((sum, p) => sum + p.amount, 0);
  
  const wins = closed.filter(p => p.status === 'won').length;
  const losses = closed.filter(p => p.status === 'lost').length;
  const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0;
  
  const activeValue = active.reduce((sum, p) => sum + (p.potentialPayout || p.amount), 0);
  
  return {
    totalInvested,
    totalPayout,
    totalProfit,
    wins,
    losses,
    winRate,
    activePositions: active.length,
    closedPositions: closed.length,
    activeValue,
  };
}

export function usePrediction() {
  const { isConnected } = useCurrentWallet();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placePrediction = async (params: PredictionParams): Promise<boolean> => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if this is a sample market (for demo purposes)
      if (params.marketId.startsWith('sample-')) {
        // For sample markets, simulate the transaction without blockchain call
        console.log('Simulating prediction for sample market:', params.marketId);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Save prediction to localStorage
        const newPrediction: StoredPrediction = {
          id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          marketId: params.marketId,
          outcome: params.outcome,
          amount: params.amount,
          timestamp: new Date().toISOString(),
          status: 'confirmed',
        };
        
        const predictions = getPredictions();
        predictions.push(newPrediction);
        savePredictions(predictions);
        
        console.log('Sample prediction placed successfully:', newPrediction);
        return true;
      }

      // For real markets, use actual blockchain transaction
      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const amountMist = Math.floor(params.amount * 1_000_000_000);
      
      // Convert outcome to contract format (YES = 1, NO = 0)
      const outcomeValue = params.outcome === 'YES' ? 1 : 0;

      // Create transaction
      const tx = new Transaction();
      
      // Split SUI for payment
      const [paymentCoin] = tx.splitCoins(tx.gas, [amountMist]);

      // Call place_prediction function
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE}::place_prediction`,
        arguments: [
          tx.object(params.marketId), // Market object
          tx.pure.u8(outcomeValue),   // Outcome (0 or 1)
          paymentCoin,                // Payment coin
        ],
      });

      // Execute transaction
      const result = await signAndExecute({
        transaction: tx,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      console.log('Prediction placed successfully:', result);
      
      // Save prediction to localStorage
      const newPrediction: StoredPrediction = {
        id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        marketId: params.marketId,
        outcome: params.outcome,
        amount: params.amount,
        timestamp: new Date().toISOString(),
        status: 'confirmed',
      };
      
      const predictions = getPredictions();
      predictions.push(newPrediction);
      savePredictions(predictions);
      
      return true;
      
    } catch (err) {
      console.error('Error placing prediction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to place prediction';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    placePrediction,
    isLoading,
    error,
    isConnected
  };
}
