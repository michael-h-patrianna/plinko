/**
 * Currency counter with pop animation and floating increment indicators
 * Adapted from animations library TextEffectsCounterIncrement
 * Uses animation driver for cross-platform compatibility
 */

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../theme';
import { useAnimationDriver } from '../../theme/animationDrivers';
import { ANIMATION_DURATION, UI_DELAY } from '../../constants';

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
  const driver = useAnimationDriver();
  const AnimatedSpan = driver.createAnimatedComponent('span');
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
      const incrementInterval = UI_DELAY.COUNTER_INCREMENT;
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
        }, ANIMATION_DURATION.NORMAL);
        timersRef.current.push(popTimer);

        // Remove indicator after animation - track timer
        const indicatorTimer = setTimeout(() => {
          setIndicators((prev) => prev.filter((ind) => ind.id !== currentId));
        }, ANIMATION_DURATION.COUNTDOWN_STEP);
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '12px',
        position: 'relative',
      }}
    >
      {icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div
          style={{
            position: 'relative',
            minHeight: '36px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Animated value with pop effect */}
          <AnimatedSpan
            style={{
              position: 'relative',
              fontSize: '32px',
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '1px',
              color: theme.colors.text.primary,
              transformOrigin: 'center bottom',
            }}
            animate={
              isValueAnimating
                ? {
                    scale: [1, 1.15, 1],
                  }
                : {
                    scale: 1,
                  }
            }
            transition={{
              duration: 0.3,
              ease: [0.34, 1.56, 0.64, 1], // cubic-bezier for bounce
              times: [0, 0.5, 1],
            }}
          >
            {currentValue.toLocaleString()}
          </AnimatedSpan>

          {/* Floating increment indicators */}
          {indicators.map((indicator) => (
            <AnimatedSpan
              key={indicator.id}
              style={{
                position: 'absolute',
                right: '-24px',
                top: '-8px',
                color: theme.colors.status.success,
                fontWeight: 700,
                fontSize: '16px',
                pointerEvents: 'none',
              }}
              initial={{
                y: 8,
                scale: 0.8,
                opacity: 0,
              }}
              animate={
                indicator.isAnimating
                  ? {
                      y: [-4, -16, -28],
                      scale: [1, 1, 0.9],
                      opacity: [1, 1, 0],
                    }
                  : {
                      y: -28,
                      scale: 0.9,
                      opacity: 0,
                    }
              }
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                times: [0.2, 0.5, 1],
              }}
            >
              +{indicator.amount}
            </AnimatedSpan>
          ))}
        </div>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
