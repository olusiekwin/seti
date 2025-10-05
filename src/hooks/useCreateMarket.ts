import { useState } from 'react';
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import type { SuiTransactionBlockResponse, SuiObjectResponse, SuiObjectChange, SuiObjectChangeCreated } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
// removed unused SUI_TYPE_ARG import
import { CreateMarketParams, UseCreateMarketResult, PACKAGE_ID, MODULE } from '@/types/contract';

/**
 * Hook to create a new market
 */
export function useCreateMarket(): UseCreateMarketResult {
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMarket = async (params: CreateMarketParams): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const initialLiquidityMist = Math.floor(params.initialLiquiditySui * 1_000_000_000);
      
      // Convert endTime to milliseconds (Move contract uses ms via epoch_timestamp_ms)
      let endTime = params.endTime instanceof Date
        ? params.endTime.getTime()
        : Number(params.endTime);
      // Heuristic: if value looks like seconds (10 or 13 digits check), convert to ms
      if (endTime < 1e12) {
        endTime = Math.floor(endTime * 1000);
      } else {
        endTime = Math.floor(endTime);
      }

      // Create transaction
      const tx = new Transaction();
      
      // Split SUI for initial liquidity
      const [liquidityCoin] = tx.splitCoins(tx.gas, [initialLiquidityMist]);

      // Call create_market function
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE}::create_market`,
        arguments: [
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(params.question))),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(params.description))),
          tx.pure.u64(endTime),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(params.category))),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(params.imageUrl))),
          tx.pure.vector('vector<u8>', params.tags.map(tag => Array.from(new TextEncoder().encode(tag)))),
          liquidityCoin,
        ],
      });

      // Execute transaction, then fetch full effects/events
      const executed = await signAndExecute({ transaction: tx });
      const result = await client.waitForTransaction({
        digest: executed.digest,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        },
      });

      // Extract market ID from created objects
      let marketId = extractMarketIdFromResult(result as SuiTransactionBlockResponse);
      
      // Fallback 1: inspect effects.created and fetch types
      if (!marketId) {
        const created = (result as SuiTransactionBlockResponse)?.effects?.created as Array<any> | undefined;
        if (Array.isArray(created) && created.length > 0) {
          for (const c of created) {
            const id = c?.reference?.objectId || c?.objectId;
            if (!id) continue;
            try {
              const obj: SuiObjectResponse = await client.getObject({ id, options: { showType: true } });
              const ty = obj.data?.type;
              if (ty && (ty.includes('::polymarket::Market') || ty.endsWith('::Market'))) { marketId = id; break; }
            } catch (e) {
              console.warn('getObject failed for created id', id, e);
            }
          }
        }
      }
      
      // Fallback 2: query owned objects by current account filtered by StructType
      if (!marketId && account?.address) {
        const tryFetchOwned = async () => {
          const owned = await client.getOwnedObjects({
            owner: account.address!,
            filter: { StructType: `${PACKAGE_ID}::${MODULE}::Market` },
            options: { showType: true },
          });
          const first: SuiObjectResponse | undefined = owned?.data?.[0];
          const objectId = first?.data?.objectId;
          return typeof objectId === 'string' ? objectId : null;
        };
        // Retry up to 5 times with small delays to allow indexers to catch up
        for (let i = 0; i < 5 && !marketId; i++) {
          try {
            const candidate = await tryFetchOwned();
            if (candidate) { marketId = candidate; break; }
          } catch (e) {
            console.warn('getOwnedObjects attempt failed', i + 1, e);
          }
          await new Promise((res) => setTimeout(res, 600));
        }
      }
      
      if (!marketId) {
        throw new Error('Failed to extract market ID from transaction result');
      }

      return marketId;
    } catch (err) {
      console.error('Error creating market:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create market';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createMarket,
    isLoading,
    error,
  };
}

/**
 * Extract market ID from transaction result
 */
function extractMarketIdFromResult(result: SuiTransactionBlockResponse): string | null {
  try {
    // Look for created objects (top-level or under effects)
    const objectChanges: SuiObjectChange[] | undefined = result.objectChanges;
    if (Array.isArray(objectChanges)) {
      for (const change of objectChanges) {
        if (change?.type !== 'created') continue;
        const created = change as SuiObjectChangeCreated;
        const ot = created?.objectType as string | undefined;
        if (typeof ot === 'string') {
          if (
            ot.includes('::polymarket::Market') ||
            ot.endsWith('::Market') ||
            ot.includes('::Market<')
          ) {
            return created.objectId as string;
          }
        }
      }
      // Final fallback: pick any created object that is not a SUI coin
      const nonSui = objectChanges.find(
        (c: SuiObjectChange) => c?.type === 'created' && typeof (c as SuiObjectChangeCreated)?.objectType === 'string' && !(c as SuiObjectChangeCreated).objectType.startsWith('0x2::coin::Coin<0x2::sui::SUI>')
      ) as SuiObjectChangeCreated | undefined;
      if (nonSui?.objectId) return nonSui.objectId as string;
    }

    // Fallback: look in events
    const events = result?.events;
    if (Array.isArray(events)) {
      for (const event of events) {
        if (typeof event?.type === 'string' && event.type.endsWith('::polymarket::MarketCreated')) {
          const pj = event.parsedJson as { market_id?: unknown } | undefined;
          if (pj && typeof pj.market_id === 'string') {
            return pj.market_id;
          }
        }
      }
    }

    return null;
  } catch (err) {
    console.error('Error extracting market ID:', err);
    return null;
  }
}
