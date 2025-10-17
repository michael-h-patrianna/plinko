/**
 * No win result view with encouraging messaging and subdued choreographed animations
 *
 * Features gentle, supportive entrance sequence with emotional tone: "That's okay, let's try again!"
 * - No win image: Gentle settle with upward support (0s, 0.5s duration)
 * - Title: Soft reassurance fade with minimal bounce (0.15s, 0.4s duration)
 * - Message card: Encouraging expansion with upward lift (0.25s, 0.45s duration)
 * - Try Again button: Warm invitation pop (0.5s, 0.45s duration)
 *
 * All animations are:
 * - Subdued (not celebratory) - gentle movements, soft easing
 * - Encouraging (upward bias, warm feel) - supportive without being sad
 * - Cross-platform safe (transforms + opacity only, no blur/filters/shadows)
 * - Overlapping for fluid flow (~0.95s total sequence)
 *
 * Uses PopupOverlay for consistent semi-transparent background
 * @param prize - Prize configuration with no-win messaging
 * @param onClaim - Callback to try again
 * @param canClaim - Whether the try again button should be enabled
 */

import noWinImage from '../../../assets/images/nowin.png';
import type { Prize } from '@game/prizeTypes';
import { useTheme } from '../../../theme';
import { ThemedButton } from '../../controls/ThemedButton';
import { useAnimation } from '@theme/animationDrivers/useAnimation';
import { PopupOverlay } from '../../layout/PopupOverlay';
import { createThemedOverlay, createTextStyle } from '@theme/themeUtils';
import { useAppConfig } from '@config/AppConfigContext';

interface NoWinViewProps {
  prize: Prize;
  onClaim: () => void;
  canClaim: boolean;
}

export function NoWinView({ prize, onClaim, canClaim }: NoWinViewProps) {
  const { AnimatedDiv, AnimatedH2, AnimatedImg } = useAnimation();
  const { theme } = useTheme();
  const { performance } = useAppConfig();

  // Disable complex animations in power-saving mode
  const isPowerSaving = performance.mode === 'power-saving';

  // Gentle, encouraging choreographed timing - subdued emotional tone
  const timing = {
    imageEntrance: 0,           // Image settles in immediately with gentle upward support
    titleReassurance: 0.15,     // Title appears while image is settling (overlapping)
    messageExpansion: 0.25,     // Card expands while title is fading in (overlapping)
    buttonInvitation: 0.5,      // Button pops in with warm invitation
  };

  return (
    <PopupOverlay zIndex={40} testId="no-win-overlay">
      {/* Content container - no card background */}
      <div className="max-w-sm w-full">
        <div role="status" aria-live="polite" className="text-center">
          {/* No win image - gentle settle with upward support (simplified in power-saving mode) */}
          <AnimatedImg
            src={noWinImage}
            alt="No Win"
            className="w-24 h-24 mx-auto mb-4"
            initial={isPowerSaving ? { opacity: 0 } : { scale: 0.92, y: 12, rotate: -1 }}
            animate={
              isPowerSaving
                ? { opacity: 0.8 }
                : {
                    scale: [0.92, 1.03, 1],
                    y: [12, -3, 0],
                    rotate: [-1, 0.5, 0],
                    opacity: [0.5, 0.8, 0.8],
                  }
            }
            transition={
              isPowerSaving
                ? { duration: 0.2, delay: 0, ease: 'easeOut' }
                : {
                    duration: 0.5,
                    delay: timing.imageEntrance,
                    times: [0, 0.6, 1],
                    ease: [0.34, 1.2, 0.64, 1], // Gentle ease-out-back (subdued)
                  }
            }
          />

          {/* Title - soft reassurance fade with minimal bounce (simplified in power-saving mode) */}
          <AnimatedH2
            className="text-3xl font-extrabold mb-6"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.text.primary} 0%, ${theme.colors.text.secondary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              /* RN-compatible: removed textShadow */
            }}
            initial={isPowerSaving ? { opacity: 0 } : { scale: 0.97, y: 8 }}
            animate={
              isPowerSaving
                ? { opacity: 1 }
                : {
                    scale: [0.97, 1.01, 1],
                    y: [8, -2, 0],
                    opacity: [0.5, 1, 1],
                  }
            }
            transition={
              isPowerSaving
                ? { duration: 0.2, delay: 0.1, ease: 'easeOut' }
                : {
                    duration: 0.4,
                    delay: timing.titleReassurance,
                    times: [0, 0.6, 1],
                    ease: [0.34, 1.15, 0.64, 1], // Very gentle bounce
                  }
            }
          >
            {prize.title}
          </AnimatedH2>

          {/* Encouraging message - gentle expansion with upward lift (simplified in power-saving mode) */}
          <AnimatedDiv
            className="my-6 p-4 rounded-lg"
            style={{
              background: createThemedOverlay(theme, 'medium'),
              borderRadius: '12px',
            }}
            initial={isPowerSaving ? { opacity: 0 } : { scale: 0.94, y: 10, rotate: -0.5 }}
            animate={
              isPowerSaving
                ? { opacity: 1 }
                : {
                    scale: [0.94, 1.02, 1],
                    y: [10, -2, 0],
                    rotate: [-0.5, 0.3, 0],
                    opacity: [0.5, 1, 1],
                  }
            }
            transition={
              isPowerSaving
                ? { duration: 0.2, delay: 0.2, ease: 'easeOut' }
                : {
                    duration: 0.45,
                    delay: timing.messageExpansion,
                    times: [0, 0.65, 1],
                    ease: [0.34, 1.18, 0.64, 1], // Soft encouraging bounce
                  }
            }
          >
            <p
              className="text-base leading-relaxed mb-2"
              style={createTextStyle('primary', theme)}
            >
              {prize.description || 'Better luck next time!'}
            </p>
            <p
              className="text-sm"
              style={createTextStyle('secondary', theme)}
            >
              Keep trying - your big win could be just around the corner!
            </p>
          </AnimatedDiv>

          {/* Try again button - warm invitation pop */}
          <ThemedButton
            onClick={onClaim}
            disabled={!canClaim}
            delay={timing.buttonInvitation}
            entranceAnimation="hero"
            className="w-full min-w-[120px] h-14 text-lg"
            testId="claim-prize-button"
          >
            Try Again
          </ThemedButton>
        </div>
      </div>
    </PopupOverlay>
  );
}
