/**
 * Celebration overlay that coordinates animations based on prize type
 * - Free rewards: Confetti spiral + heartbeat animation + board dimming
 * - Purchase offers: Confetti (optional) + tada animation + board dimming
 * - No win: Gentle fade + all slots flip
 *
 * Cross-platform safe: all animations use only transforms and opacity
 */

import { useEffect } from 'react';
import { useAnimationDriver } from '@theme/animationDrivers';
import type { PrizeConfig } from '@game/types';
import { ConfettiSpiral } from './ConfettiSpiral';
import { StarBurst } from './StarBurst';
import { FlashOverlay } from './FlashOverlay';
import { useTheme } from '../../../theme';

interface CelebrationOverlayProps {
  prize: PrizeConfig;
  /** Callback when celebration animation completes */
  onComplete: () => void;
}

export function CelebrationOverlay({
  prize,
  onComplete,
}: CelebrationOverlayProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');
  const { theme } = useTheme();

  const prizeType = prize.type;

  // Celebration duration based on prize type
  // Free rewards: 1500ms for premium choreography (focus → burst → settle)
  // Purchase: 1000ms for polished tada animation
  // No win: 600ms for gentle fade
  const celebrationDuration = prizeType === 'no_win' ? 600 : prizeType === 'purchase' ? 1000 : 1500;

  // Auto-advance to next state after celebration completes
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, celebrationDuration);

    return () => clearTimeout(timer);
  }, [celebrationDuration, onComplete]);

  // For no_win, just show gentle dimming overlay
  if (prizeType === 'no_win') {
    return (
      <AnimatedDiv
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${theme.colors.surface.secondary}00 0%, ${theme.colors.surface.secondary}66 100%)`,
          zIndex: 20,
          overflow: 'hidden', // Prevent overlay from causing scrollbars
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
        }}
      />
    );
  }

  // For wins (free or purchase), show confetti and dimming
  const showConfetti = prizeType === 'free' || (prizeType === 'purchase' && Math.random() > 0.5);

  // Calculate confetti origin - center of board for maximum visual impact
  const confettiOriginX = '50%';
  const confettiOriginY = '45%'; // Center of board (accounting for header)

  // Get prize color for confetti customization
  const prizeColor = prize.slotColor || theme.colors.primary.main;
  const confettiColors = [
    prizeColor,
    theme.colors.primary.light,
    theme.colors.primary.main,
    theme.colors.accent.main,
    theme.colors.accent.light,
  ];

  return (
    <>
      {/* Dimming overlay - fades out non-winning elements */}
      <AnimatedDiv
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${theme.colors.surface.primary}44 60%, ${theme.colors.surface.primary}88 100%)`,
          zIndex: 20,
          overflow: 'hidden', // Prevent overlay from causing scrollbars
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.4,
          ease: 'easeIn',
        }}
      />

      {/* Premium celebration choreography - highest z-index to appear above everything */}
      {showConfetti && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 9999,
            overflow: 'hidden', // Prevent particles from causing scrollbars
          }}
        >
          {/* Phase 1-2: Focus (0-400ms) - winning slot scales, non-winners fade (handled by slot animation) */}

          {/* Phase 3: Burst moment (400ms) - flash + confetti + stars explode */}
          <FlashOverlay
            delay={400}
            color="#FFFFFF"
            intensity={0.15}
          />

          <ConfettiSpiral
            originX={confettiOriginX}
            originY={confettiOriginY}
            particleCount={prizeType === 'free' ? 36 : 20}
            colors={confettiColors}
          />

          {prizeType === 'free' && (
            <StarBurst
              originX={confettiOriginX}
              originY={confettiOriginY}
              particleCount={12}
              color={prizeColor}
              delay={420}
            />
          )}

          {/* Phase 4: Settle (500-1500ms) - particles continue, slot settles (handled by slot animation) */}
        </div>
      )}
    </>
  );
}
