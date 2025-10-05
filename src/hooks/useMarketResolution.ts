import { useState } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE } from '@/types/contract';

export interface ResolveMarketParams {
  marketId: string;
  winningOutcome: 'YES' | 'NO' | 'INVALID'; // 1 = YES, 0 = NO, 2 = INVALID
}

export interface UseMarketResolutionResult {
  resolveMarket: (params: ResolveMarketParams) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to resolve a market (only creator can resolve)
 */
export function useMarketResolution(): UseMarketResolutionResult {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveMarket = async (params: ResolveMarketParams): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert outcome to contract format
      const outcomeValue = params.winningOutcome === 'YES' ? 1 : 
                          params.winningOutcome === 'NO' ? 0 : 2;

      // Create transaction
      const tx = new Transaction();
      
      // Get clock object (required for time-based resolution)
      const clock = tx.object('0x6');

      // Call resolve_market function
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE}::resolve_market`,
        arguments: [
          tx.object(params.marketId), // Market object
          tx.pure.u8(outcomeValue),   // Winning outcome (0, 1, or 2)
          clock,                      // Clock object
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

      console.log('Market resolved successfully:', result);
      return true;
      
    } catch (err) {
      console.error('Error resolving market:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve market';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resolveMarket,
    isLoading,
    error,
  };
}
