/**
 * Prize session management hook
 * Handles prize loading, validation, shuffling, and session persistence
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppConfig } from '@config/AppConfigContext';
import type { PrizeProviderResult } from '@game/prizeProvider';
import type { PrizeConfig } from '@game/types';
import { navigationAdapter } from '@utils/platform';
import { API_TIMEOUT } from '../constants';

interface UsePrizeSessionOptions {
  seedOverride?: number;
  forceFreshSeedRef: React.MutableRefObject<boolean>;
  sessionKey: number;
}

interface UsePrizeSessionResult {
  // Prize session data
  prizeSession: PrizeProviderResult | null;
  prizes: PrizeConfig[];
  isLoading: boolean;
  error: Error | null;

  // Winning prize tracking
  winningPrize: PrizeConfig | null;
  currentWinningIndex: number | undefined;
  winningPrizeLockedRef: React.MutableRefObject<boolean>;

  // Session management
  setPrizes: React.Dispatch<React.SetStateAction<PrizeConfig[]>>;
  setWinningPrize: React.Dispatch<React.SetStateAction<PrizeConfig | null>>;
  setCurrentWinningIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
  setPrizeSession: React.Dispatch<React.SetStateAction<PrizeProviderResult | null>>;
}

export function usePrizeSession(options: UsePrizeSessionOptions): UsePrizeSessionResult {
  const { seedOverride, forceFreshSeedRef, sessionKey } = options;
  const { prizeProvider } = useAppConfig();

  const [prizeSession, setPrizeSession] = useState<PrizeProviderResult | null>(null);
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Store the winning prize object separately - this is what the user will actually win
  // This is immutable and independent of any prize array swaps
  const [winningPrize, setWinningPrize] = useState<PrizeConfig | null>(null);

  // Track the current position of the winning prize after swaps (for visual indicator only)
  const [currentWinningIndex, setCurrentWinningIndex] = useState<number | undefined>(undefined);

  // Guard to prevent overwriting locked winning prize
  const winningPrizeLockedRef = useRef(false);

  const resolveSeedOverride = useCallback((): number | undefined => {
    // When forceFreshSeedRef is true (automatic reset), return undefined to force new random seed
    if (forceFreshSeedRef.current) {
      return undefined;
    }

    if (typeof seedOverride === 'number') {
      return seedOverride;
    }

    const urlSeed = navigationAdapter.getParam('seed');
    if (!urlSeed) {
      return undefined;
    }

    const parsed = Number.parseInt(urlSeed, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [seedOverride]);

  // Single async load effect with retry and timeout
  useEffect(() => {
    const abortController = new AbortController();

    // Async function for cleaner error handling
    async function loadPrizeSession() {
      setIsLoading(true);
      setError(null);

      const finalSeedOverride = resolveSeedOverride();

      // Retry wrapper that respects abort signal
      async function loadWithRetry(signal: AbortSignal, attempt = 1): Promise<PrizeProviderResult> {
        if (signal.aborted) {
          throw new Error('Operation aborted');
        }

        try {
          const result = await prizeProvider.load({ seedOverride: finalSeedOverride });
          return result;
        } catch (err) {
          if (signal.aborted) {
            throw new Error('Operation aborted');
          }

          if (attempt >= API_TIMEOUT.MAX_RETRIES) {
            throw err; // Final failure
          }

          // Wait before retry with abort support
          await new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(resolve, API_TIMEOUT.RETRY_DELAY * attempt);
            signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
              reject(new Error('Operation aborted'));
            });
          });

          return loadWithRetry(signal, attempt + 1);
        }
      }

      // Execute load with timeout and retry
      try {
        // Race between load operation and timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Provider load timeout')), API_TIMEOUT.LOAD_TIMEOUT);
          abortController.signal.addEventListener('abort', () => clearTimeout(timeoutId));
        });

        const result = await Promise.race([
          loadWithRetry(abortController.signal),
          timeoutPromise
        ]);

        if (abortController.signal.aborted) {
          return;
        }

        setPrizeSession(result);
        setIsLoading(false);
        forceFreshSeedRef.current = false;
      } catch (err: unknown) {
        if (abortController.signal.aborted) {
          return;
        }

        setError(err instanceof Error ? err : new Error('Failed to load prizes'));
        setIsLoading(false);
        forceFreshSeedRef.current = false;
      }
    }

    loadPrizeSession();

    return () => {
      abortController.abort();
    };
  }, [prizeProvider, resolveSeedOverride, sessionKey, forceFreshSeedRef]);

  return {
    prizeSession,
    prizes,
    isLoading,
    error,
    winningPrize,
    currentWinningIndex,
    winningPrizeLockedRef,
    setPrizes,
    setWinningPrize,
    setCurrentWinningIndex,
    setPrizeSession,
  };
}
