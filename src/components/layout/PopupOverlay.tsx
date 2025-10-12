/**
 * PopupOverlay - Standardized overlay wrapper for all popup/modal views
 * Provides:
 * - Semi-transparent themed background overlay
 * - Consistent entrance/exit animations
 * - Centered content container with standard padding
 * - Proper z-index layering
 *
 * Usage: Wrap popup content with this component for consistent styling
 */

import { useAnimation } from '@theme/animationDrivers/useAnimation';
import { useTheme } from '@theme/index';
import { ReactNode } from 'react';
import { getOverlayBackground, POPUP_ANIMATIONS, POPUP_PADDING } from './popupAnimations';

interface PopupOverlayProps {
  children: ReactNode;
  zIndex?: number;
  testId?: string;
  onBackgroundClick?: () => void;
}

export function PopupOverlay({ children, zIndex = 40, testId, onBackgroundClick }: PopupOverlayProps) {
  const { AnimatedDiv } = useAnimation();
  const { theme } = useTheme();

  return (
    <AnimatedDiv
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: getOverlayBackground(theme),
        zIndex,
        padding: POPUP_PADDING,
      }}
      initial={POPUP_ANIMATIONS.entrance.initial}
      animate={POPUP_ANIMATIONS.entrance.animate}
      exit={POPUP_ANIMATIONS.exit.exit}
      transition={{
        duration: POPUP_ANIMATIONS.entrance.duration,
        ease: POPUP_ANIMATIONS.entrance.ease,
      }}
      onClick={onBackgroundClick}
      data-testid={testId}
    >
      {/* Content container - prevents click events from bubbling to background */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {children}
      </div>
    </AnimatedDiv>
  );
}
