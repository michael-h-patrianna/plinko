/**
 * Custom hook for currency counter animation logic
 * Separates animation timing and state management from UI rendering
 *
 * TIMER TRACKING APPROACH:
 * - All timers stored in ref array for centralized cleanup
 * - Cleanup on unmount and when dependencies change
 * - Prevents memory leaks from dangling timers
 *
 * ANIMATION TIMING:
 * - Uses easeOutQuart curve: fast at first, slows dramatically near end
 * - Increment count scales with target: 3-15 visible increments
 * - Delay range: 50ms (start) to 300ms (end) for smooth deceleration
 */

import { useEffect, useRef, useState } from 'react';
import { ANIMATION_DURATION } from '@plinko/constants/timing';

interface CounterIndicator {
  id: number;
  isAnimating: boolean;
  amount: number;
}

interface UseCurrencyCounterAnimationProps {
  targetAmount: number;
  delay?: number;
}

interface UseCurrencyCounterAnimationReturn {
  currentValue: number;
  isValueAnimating: boolean;
  indicators: CounterIndicator[];
}

/**
 * Hook to manage currency counter animation state
 * Handles increment counting, pop animations, and floating indicators
 *
 * @param targetAmount - Target amount to count up to
 * @param delay - Delay before starting animation in ms (default: 0)
 * @returns Current value, animation state, and floating indicators
 */
export function useCurrencyCounterAnimation({
  targetAmount,
  delay = 0,
}: UseCurrencyCounterAnimationProps): UseCurrencyCounterAnimationReturn {
  const [currentValue, setCurrentValue] = useState(0);
  const [isValueAnimating, setIsValueAnimating] = useState(false);
  const [indicators, setIndicators] = useState<CounterIndicator[]>([]);
  const nextIndicatorIdRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Clear any existing timers on mount or when dependencies change
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];

    const startAnimation = () => {
      // Better increment count logic - aim for 8-15 visible increments
      // Small numbers (1-50): fewer increments
      // Medium numbers (50-1000): ~10 increments
      // Large numbers (1000+): 12-15 increments
      let incrementCount: number;
      if (targetAmount <= 50) {
        incrementCount = Math.max(3, Math.ceil(targetAmount / 10));
      } else if (targetAmount <= 500) {
        incrementCount = Math.min(10, Math.ceil(targetAmount / 50));
      } else if (targetAmount <= 5000) {
        incrementCount = 12;
      } else {
        incrementCount = 15;
      }

      const incrementValue = Math.ceil(targetAmount / incrementCount);
      let currentIncrement = 0;
      let previousValue = 0;

      // Ease-out curve: fast at first, slows down dramatically near the end
      // Using easeOutQuart: 1 - (1-t)^4
      const getDelayForIncrement = (index: number): number => {
        const progress = index / incrementCount;
        const easedProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart

        // Map to delay range: starts at ~50ms, ends at ~300ms
        const minDelay = 50;
        const maxDelay = 300;
        const delay = minDelay + (maxDelay - minDelay) * easedProgress;

        return delay;
      };

      const incrementStep = () => {
        currentIncrement++;

        // Calculate new value
        const newValue = Math.min(currentIncrement * incrementValue, targetAmount);
        const actualIncrement = newValue - previousValue; // Calculate the actual increment that happened
        previousValue = newValue;

        setCurrentValue(newValue);

        // Trigger pop animation
        setIsValueAnimating(true);

        // Add floating indicator showing the ACTUAL increment
        const currentId = nextIndicatorIdRef.current;
        setIndicators((prev) => [...prev, { id: currentId, isAnimating: true, amount: actualIncrement }]);
        nextIndicatorIdRef.current += 1;

        // Reset pop animation - track timer
        const popTimer = setTimeout(() => {
          setIsValueAnimating(false);
        }, ANIMATION_DURATION.NORMAL);
        timersRef.current.push(popTimer);

        // Remove indicator after animation - track timer
        const indicatorTimer = setTimeout(() => {
          setIndicators((prev) => prev.filter((ind) => ind.id !== currentId));
        }, ANIMATION_DURATION.COUNTDOWN_STEP);
        timersRef.current.push(indicatorTimer);

        // Continue or finish
        if (currentIncrement < incrementCount) {
          const nextDelay = getDelayForIncrement(currentIncrement);
          const stepTimer = setTimeout(incrementStep, nextDelay);
          timersRef.current.push(stepTimer);
        } else {
          // Ensure final value is exact
          setCurrentValue(targetAmount);
        }
      };

      // Start first increment
      incrementStep();
    };

    // Delay start of animation - track timer
    const delayTimer = setTimeout(startAnimation, delay);
    timersRef.current.push(delayTimer);

    // Cleanup all timers on unmount or when targetAmount/delay changes
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    };
  }, [targetAmount, delay]);

  return {
    currentValue,
    isValueAnimating,
    indicators,
  };
}
