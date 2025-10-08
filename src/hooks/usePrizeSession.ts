/**
 * Prize session management hook
 * Handles prize loading, validation, shuffling, and session persistence
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppConfig } from '../config/AppConfigContext';
import type { PrizeProviderResult } from '../game/prizeProvider';
import type { PrizeConfig } from '../game/types';
import { navigationAdapter } from '../utils/platform';

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
    let cancelled = false;

    // Async function for cleaner error handling
    async function loadPrizeSession() {
      setIsLoading(true);
      setError(null);

      const finalSeedOverride = resolveSeedOverride();

      // Constants for retry and timeout
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 1000;
      const LOAD_TIMEOUT_MS = 10000; // 10 seconds

      // Timeout wrapper
      function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Provider load timeout')), timeoutMs)
          ),
        ]);
      }

      // Retry wrapper
      async function loadWithRetry(attempt = 1): Promise<PrizeProviderResult> {
        try {
          const result = await prizeProvider.load({ seedOverride: finalSeedOverride });
          return result;
        } catch (err) {
          if (attempt >= MAX_RETRIES) {
            throw err; // Final failure
          }
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
          return loadWithRetry(attempt + 1);
        }
      }

      // Execute load with timeout and retry
      try {
        const result = await withTimeout(loadWithRetry(), LOAD_TIMEOUT_MS);
        if (cancelled) {
          return;
        }
        setPrizeSession(result);
        // DON'T set prizes here - let the initialization effect handle swapping
        setIsLoading(false);
        // Reset forceFreshSeed ref after successful load
        forceFreshSeedRef.current = false;
      } catch (err: unknown) {
        console.error('Failed to load prize session', err);
        if (cancelled) {
          return;
        }
        setPrizeSession(null);
        setPrizes([]);
        setError(err instanceof Error ? err : new Error('Failed to load prizes'));
        setIsLoading(false);
        // Reset forceFreshSeed ref even on error
        forceFreshSeedRef.current = false;
      }
    }

    loadPrizeSession();

    return () => {
      cancelled = true;
    };
  }, [prizeProvider, resolveSeedOverride, sessionKey]);

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
