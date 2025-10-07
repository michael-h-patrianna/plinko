/**
 * Currency counter with pop animation and floating increment indicators
 * Adapted from animations library TextEffectsCounterIncrement
 * Uses setTimeout/setInterval pattern compatible with React Native
 */

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../theme';
import './CurrencyCounter.css';

interface CounterIndicator {
  id: number;
  isAnimating: boolean;
  amount: number;
}

interface CurrencyCounterProps {
  /** Target amount to count up to */
  targetAmount: number;
  /** Currency label (e.g., "GC", "SC") */
  label: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Delay before starting animation in ms (default: 0) */
  delay?: number;
}

export function CurrencyCounter({
  targetAmount,
  label,
  icon,
  delay = 0,
}: CurrencyCounterProps) {
  const { theme } = useTheme();
  const [currentValue, setCurrentValue] = useState(0);
  const [isValueAnimating, setIsValueAnimating] = useState(false);
  const [indicators, setIndicators] = useState<CounterIndicator[]>([]);
  const nextIndicatorIdRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Clear any existing timers
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];

    const startAnimation = () => {
      const incrementCount = Math.min(Math.ceil(targetAmount / 100), 12); // Max 12 increments
      const incrementValue = Math.ceil(targetAmount / incrementCount);
      const incrementInterval = 100; // 100ms between increments
      let currentIncrement = 0;
      let previousValue = 0;

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
        }, 300);
        timersRef.current.push(popTimer);

        // Remove indicator after animation - track timer
        const indicatorTimer = setTimeout(() => {
          setIndicators((prev) => prev.filter((ind) => ind.id !== currentId));
        }, 800);
        timersRef.current.push(indicatorTimer);

        // Continue or finish
        if (currentIncrement < incrementCount) {
          const stepTimer = setTimeout(incrementStep, incrementInterval);
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

  return (
    <div className="currency-counter">
      {icon && <div className="currency-counter__icon">{icon}</div>}
      <div className="currency-counter__content">
        <div className="currency-counter__value-wrapper">
          <span
            className={`currency-counter__value ${isValueAnimating ? 'currency-counter__value--popping' : ''}`}
            style={{ color: theme.colors.text.primary }}
          >
            {currentValue.toLocaleString()}
          </span>

          {/* Floating increment indicators */}
          {indicators.map((indicator) => (
            <span
              key={indicator.id}
              className={`currency-counter__indicator ${indicator.isAnimating ? 'currency-counter__indicator--animating' : ''}`}
              style={{ color: theme.colors.status.success }}
            >
              +{indicator.amount}
            </span>
          ))}
        </div>
        <span className="currency-counter__label">{label}</span>
      </div>
    </div>
  );
}
