import { useState } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE } from '@/types/contract';

export interface AddLiquidityParams {
  marketId: string;
  amount: number; // in SUI
}

export interface UseLiquidityResult {
  addLiquidity: (params: AddLiquidityParams) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to add liquidity to a market
 */
export function useLiquidity(): UseLiquidityResult {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLiquidity = async (params: AddLiquidityParams): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const amountMist = Math.floor(params.amount * 1_000_000_000);

      // Create transaction
      const tx = new Transaction();
      
      // Split SUI for liquidity
      const [liquidityCoin] = tx.splitCoins(tx.gas, [amountMist]);

      // Call add_liquidity function
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE}::add_liquidity`,
        arguments: [
          tx.object(params.marketId), // Market object
          liquidityCoin,              // Liquidity coin
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

      console.log('Liquidity added successfully:', result);
      return true;
      
    } catch (err) {
      console.error('Error adding liquidity:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add liquidity';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addLiquidity,
    isLoading,
    error,
  };
}
