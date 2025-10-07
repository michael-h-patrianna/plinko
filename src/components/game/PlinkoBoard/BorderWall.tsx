/**
 * Border wall component with impact flash animation
 * Renders left, right, top, or bottom wall with visual feedback when ball collides
 * @param side - Which side of the board ('left', 'right', 'top', or 'bottom')
 * @param width - Width of the wall in pixels
 * @param hasImpact - Whether ball is currently impacting this wall
 * @param offset - Optional offset from edge (for bottom wall)
 */

import { useRef } from 'react';
import { useTheme } from '../../../theme';
import { useAnimationDriver } from '../../../theme/animationDrivers';

interface BorderWallProps {
  side: 'left' | 'right' | 'top' | 'bottom';
  width: number;
  hasImpact: boolean;
  offset?: number;
  boardWidth?: number;
}

export function BorderWall({ side, width, hasImpact, offset = 0, boardWidth }: BorderWallProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');
  const { AnimatePresence } = driver;

  const { theme } = useTheme();
  const isVertical = side === 'left' || side === 'right';
  const isMobile = boardWidth !== undefined && boardWidth <= 375;

  // Stable key for impact animation - increment counter when impact triggers
  const impactKeyRef = useRef(0);
  const prevHasImpactRef = useRef(false);

  // Increment key when impact changes from false to true
  if (hasImpact && !prevHasImpactRef.current) {
    impactKeyRef.current += 1;
  }

  // Update previous state
  prevHasImpactRef.current = hasImpact;

  const baseStyle = {
    background: `${theme.colors.surface.elevated}66`,
    borderRadius:
      side === 'top' ? (isMobile ? '0' : '12px 12px 0 0') :
      side === 'bottom' ? '0 0 12px 12px' :
      side === 'left' ? '0 0 0 12px' :  // Left wall never has top corners
      '0 12px 0 0',  // Right wall never has top corners (they meet the top wall)
  };

  const positionStyle =
    side === 'top'
      ? { top: 0, left: 0, right: 0, height: `${width}px` }
      : side === 'bottom'
        ? { bottom: offset, left: 0, right: 0, height: `${width}px` }
        : side === 'left'
          ? { top: isMobile ? 0 : `${width}px`, left: 0, bottom: offset, width: `${width}px` }
          : { top: isMobile ? 0 : `${width}px`, right: 0, bottom: offset, width: `${width}px` };

  return (
    <div className="absolute" style={{ ...positionStyle, ...baseStyle }}>
      {/* Impact flash */}
      <AnimatePresence>
        {hasImpact && (
          <AnimatedDiv
            key={`impact-${side}-${impactKeyRef.current}`}
            className="absolute inset-0 pointer-events-none"
            style={{
              // Cross-platform compatible: linear gradients only (no radial for RN compatibility)
              background: isVertical
                ? side === 'left'
                  ? `linear-gradient(to right, ${theme.colors.text.inverse}cc 0%, ${theme.colors.status.warning}99 30%, transparent 70%)`
                  : `linear-gradient(to left, ${theme.colors.text.inverse}cc 0%, ${theme.colors.status.warning}99 30%, transparent 70%)`
                : `linear-gradient(to bottom, ${theme.colors.text.inverse}cc 0%, ${theme.colors.status.warning}99 30%, transparent 70%)`,
              /* RN-compatible: removed boxShadow glow effect */
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
