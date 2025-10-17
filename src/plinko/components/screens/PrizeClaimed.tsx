/**
 * Prize claimed confirmation screen with success animation
 * Displays checkmark animation and allows user to close/reset game
 * Uses PopupOverlay for consistent semi-transparent background
 * @param prize - Prize configuration (not currently used in display)
 * @param onClose - Callback to close and reset the game
 */

import type { PrizeConfig } from '@plinko/game/types';
import { useTheme } from '../../theme';
import { ThemedButton } from '../ui/ThemedButton';
import { useAnimation } from '@plinko/theme/animationDrivers/useAnimation';
import { PopupOverlay } from '../layout/PopupOverlay';
import { useAppConfig } from '@demo/config/AppConfigContext';

interface PrizeClaimedProps {
  prize: PrizeConfig;
  onClose: () => void;
}

export function PrizeClaimed({ onClose }: PrizeClaimedProps) {
  const { AnimatedDiv, AnimatedH2, AnimatedP } = useAnimation();
  const { theme } = useTheme();
  const { performance } = useAppConfig();

  // Disable complex animations in power-saving mode
  const isPowerSaving = performance.mode === 'power-saving';

  return (
    <PopupOverlay zIndex={50} testId="prize-claimed-overlay">
      {/* Success checkmark stamp - single unified element (simplified in power-saving mode) */}
      <AnimatedDiv
        className="absolute pointer-events-none"
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `${theme.colors.status.success}1a`,
          left: '50%',
          top: '50%',
          zIndex: 5,
          opacity: 0.35,
        }}
        initial={
          isPowerSaving
            ? {
                x: '-50%',
                y: '-50%',
                opacity: 0,
              }
            : {
                x: '-50%',
                y: '-50%',
                scale: 0.8,
              }
        }
        animate={{
          x: '-50%',
          y: '-50%',
          scale: 1,
          opacity: 0.35,
        }}
        transition={
          isPowerSaving
            ? { duration: 0.2, ease: 'easeOut' }
            : {
                type: 'spring',
                stiffness: 280,
                damping: 18,
                delay: 0,
              }
        }
      >
        {/* Expanding rings - single pulse (ONLY render in non-power-saving mode) */}
        {!isPowerSaving &&
          [0, 1, 2].map((i) => (
            <AnimatedDiv
              key={`ring-${i}`}
              className="absolute"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: `2px solid ${theme.colors.status.success}`,
                top: '0',
                left: '0',
                opacity: 0,
              }}
              initial={{ scale: 1 }}
              animate={{
                scale: 2.5,
              }}
              transition={{
                duration: 1.2,
                delay: 0.15 + i * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          ))}

        {/* Checkmark symbol */}
        <AnimatedDiv
          className="absolute inset-0 flex items-center justify-center text-6xl font-bold"
          style={{ color: theme.colors.status.success, opacity: 0.6 }}
          initial={isPowerSaving ? { opacity: 0 } : { scale: 0.7, rotate: -15 }}
          animate={
            isPowerSaving
              ? { opacity: 0.6 }
              : {
                  scale: 1,
                  rotate: 0,
                  opacity: 0.6,
                }
          }
          transition={
            isPowerSaving
              ? { duration: 0.2, ease: 'easeOut' }
              : {
                  type: 'spring',
                  stiffness: 320,
                  damping: 16,
                  delay: 0.05,
                }
          }
        >
          ✓
        </AnimatedDiv>
      </AnimatedDiv>

      {/* Centered content container - appears on top of checkmark */}
      <div className="relative flex flex-col items-center text-center" style={{ zIndex: 10 }}>
        {/* Prize Claimed header - matching StartScreen title style (simplified in power-saving mode) */}
        <AnimatedH2
          className="text-4xl font-extrabold mb-6 text-center"
          style={{
            background: theme.gradients.titleGradient || theme.gradients.buttonPrimary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: theme.typography.fontFamily.display || theme.typography.fontFamily.primary,
          }}
          initial={isPowerSaving ? { opacity: 0 } : { x: -30, y: 20, scale: 0.85, rotate: -8 }}
          animate={
            isPowerSaving
              ? { opacity: 1 }
              : {
                  x: 0,
                  y: 0,
                  scale: 1,
                  rotate: 0,
                  opacity: [0.5, 1],
                }
          }
          transition={
            isPowerSaving
              ? { duration: 0.2, delay: 0, ease: 'easeOut' }
              : {
                  duration: 0.5,
                  delay: 0.35,
                  ease: [0.34, 1.56, 0.64, 1],
                }
          }
        >
          Prize Claimed!
        </AnimatedH2>

        {/* Prize summary */}
        <AnimatedP
          className="mb-8 text-lg"
          style={{ color: theme.colors.text.secondary }}
          initial={isPowerSaving ? { opacity: 0 } : { y: 15, opacity: 0.3 }}
          animate={isPowerSaving ? { opacity: 1 } : { y: 0, opacity: 1 }}
          transition={
            isPowerSaving
              ? { duration: 0.2, delay: 0.1, ease: 'easeOut' }
              : { duration: 0.35, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
          }
        >
          Your reward has been claimed successfully.
        </AnimatedP>

        {/* Close button */}
        <ThemedButton
          onClick={onClose}
          entranceAnimation="hero"
          delay={0.9}
          testId="close-button"
          className="min-w-[120px] h-14 text-lg"
        >
          Close
        </ThemedButton>
      </div>
    </PopupOverlay>
  );
}
