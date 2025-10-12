/**
 * No win result view with encouraging messaging
 * Uses subdued styling and gentle animations, not celebratory
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

interface NoWinViewProps {
  prize: Prize;
  onClaim: () => void;
  canClaim: boolean;
}

export function NoWinView({ prize, onClaim, canClaim }: NoWinViewProps) {
  const { AnimatedDiv, AnimatedH2, AnimatedImg } = useAnimation();
  const { theme } = useTheme();

  return (
    <PopupOverlay zIndex={theme.zIndex[40]} testId="no-win-overlay">
      {/* Content container - no card background */}
      <div className="max-w-sm w-full">
        <div role="status" aria-live="polite" className="text-center">
          {/* No win image */}
          <AnimatedImg
            src={noWinImage}
            alt="No Win"
            className="w-24 h-24 mx-auto mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ duration: 0.25, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          />

          {/* Title - match other views with gradient styling */}
          <AnimatedH2
            className="text-3xl font-extrabold mb-6"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.text.primary} 0%, ${theme.colors.text.secondary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              /* RN-compatible: removed textShadow */
            }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.3 }}
          >
            {prize.title}
          </AnimatedH2>

          {/* Encouraging message - styled like CurrencyCounter items */}
          <AnimatedDiv
            className="my-6 p-4 rounded-lg"
            style={{
              background: createThemedOverlay(theme, 'medium'),
              borderRadius: '12px',
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.4 }}
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

          {/* Try again button */}
          <ThemedButton
            onClick={onClaim}
            disabled={!canClaim}
            delay={0.6}
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
