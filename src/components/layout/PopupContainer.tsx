/**
 * Container wrapper for the popup/modal layout
 * Provides entrance animation and responsive sizing for mobile overlay mode
 * @param children - Child elements to render inside the container
 * @param isMobileOverlay - Whether to use full-height mobile overlay layout
 */

import type { ReactNode } from 'react';
import { useAnimationDriver } from '../../theme/animationDrivers';
import { UI_SIZE } from '../../constants';

interface PopupContainerProps {
  children: ReactNode;
  isMobileOverlay?: boolean;
}

export function PopupContainer({ children, isMobileOverlay = false }: PopupContainerProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  return (
    <AnimatedDiv
      className="relative w-full"
      style={{
        minHeight: isMobileOverlay ? '100vh' : `${UI_SIZE.MIN_POPUP_HEIGHT}px`,
        overflow: isMobileOverlay ? 'hidden' : 'visible',
      }}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1], // Ease-out cubic for smooth, natural entrance
      }}
      data-testid="popup-container"
    >
      {children}
    </AnimatedDiv>
  );
}
