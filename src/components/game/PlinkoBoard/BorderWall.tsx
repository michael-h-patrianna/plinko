/**
 * Border wall component with impact flash animation
 * Renders left, right, top, or bottom wall with visual feedback when ball collides
 * @param side - Which side of the board ('left', 'right', 'top', or 'bottom')
 * @param width - Width of the wall in pixels
 * @param hasImpact - Whether ball is currently impacting this wall
 * @param offset - Optional offset from edge (for bottom wall)
 */

import React, { useRef } from 'react';
import { useTheme } from '../../../theme';
import { useAnimationDriver } from '@theme/animationDrivers';

interface BorderWallProps {
  side: 'left' | 'right' | 'top' | 'bottom';
  width: number;
  hasImpact: boolean;
  offset?: number;
  boardWidth?: number;
}

export function BorderWall({ side, width, offset = 0, boardWidth }: BorderWallProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');
  const { AnimatePresence } = driver;

  const { theme } = useTheme();
  const isVertical = side === 'left' || side === 'right';
  const isMobile = boardWidth !== undefined && boardWidth <= 375;

  // Track wall hit state via data attribute (imperative updates from driver)
  const [isHit, setIsHit] = React.useState(false);
  const [impactY, setImpactY] = React.useState<number | null>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const wallContainerRef = useRef<HTMLDivElement>(null);

  // Stable key for impact animation - increment counter when impact triggers
  const impactKeyRef = useRef(0);

  // Watch for data attribute changes (set by driver)
  React.useEffect(() => {
    const wallEl = wallRef.current;
    if (!wallEl) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          if (mutation.attributeName === 'data-wall-hit') {
            const hitValue = wallEl.getAttribute('data-wall-hit');
            const isNowHit = hitValue === 'true';

            if (isNowHit && !isHit) {
              // Wall was just hit - increment key to trigger new animation
              impactKeyRef.current += 1;

              // Get impact Y position if available
              const impactYStr = wallEl.getAttribute('data-impact-y');
              const impactYValue = impactYStr ? parseFloat(impactYStr) : null;
              setImpactY(impactYValue);
              setIsHit(true);
            } else if (!isNowHit && isHit) {
              setIsHit(false);
              setImpactY(null);
            }
          }
        }
      });
    });

    observer.observe(wallEl, { attributes: true });

    return () => observer.disconnect();
  }, [isHit]);

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

  // Calculate directional movement based on wall side
  // Move wall in direction of ball impact, then spring back
  const getDirectionalMovement = () => {
    if (!isVertical || !isHit) return { x: 0 };

    // Left wall: move left (negative x), Right wall: move right (positive x)
    // Small movement: 3px outward, then spring back
    const direction = side === 'left' ? -1 : 1;
    return {
      x: [0, direction * 3, direction * 1, 0], // Push out, small overshoot back, settle
    };
  };

  return (
    <AnimatedDiv
      ref={wallContainerRef}
      className="absolute"
      style={{ ...positionStyle, zIndex: 5 }}
      animate={getDirectionalMovement()}
      transition={{
        duration: 0.25,
        ease: [0.34, 1.56, 0.64, 1], // Spring easing for bounce effect
      }}
    >
      <div
        ref={wallRef}
        className="absolute inset-0"
        style={{ ...baseStyle }}
        data-wall-side={side}
        data-wall-hit="false"
      >
        {/* Wall impact glow - Small, focused on ball contact point */}
        <AnimatePresence>
          {isHit && (
            <AnimatedDiv
              key={`impact-${side}-${impactKeyRef.current}`}
              className="absolute pointer-events-none"
              style={{
                // Position: Small 50px tall glow at inner edge, centered on ball impact
                ...(isVertical
                  ? side === 'left'
                    ? {
                        left: `${width - 3}px`,
                        top: impactY !== null ? `${Math.max(0, impactY - 25)}px` : 0,
                        height: impactY !== null ? '50px' : '100%',
                        width: '6px',
                      }
                    : {
                        right: `${width - 3}px`,
                        top: impactY !== null ? `${Math.max(0, impactY - 25)}px` : 0,
                        height: impactY !== null ? '50px' : '100%',
                        width: '6px',
                      }
                  : { left: 0, right: 0, bottom: 0, height: '6px' }),
                // Cross-platform: linear gradient from bright to transparent
                background: isVertical
                  ? side === 'left'
                    ? `linear-gradient(to right, ${theme.colors.status.warning}ff 0%, ${theme.colors.game.ball.primary}ff 50%, transparent 100%)`
                    : `linear-gradient(to left, ${theme.colors.status.warning}ff 0%, ${theme.colors.game.ball.primary}ff 50%, transparent 100%)`
                  : `linear-gradient(to bottom, ${theme.colors.status.warning}ff 0%, ${theme.colors.game.ball.primary}ff 50%, transparent 100%)`,
                borderRadius: isVertical ? '3px' : 'inherit',
              }}
              initial={{ opacity: 0, scaleY: isVertical ? 0.6 : 1, scaleX: isVertical ? 1 : 0.6 }}
              animate={{
                opacity: [0, 1, 0.6, 0],
                scaleY: isVertical ? [0.6, 1.1, 1, 1] : 1,
                scaleX: isVertical ? 1 : [0.6, 1.1, 1, 1]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
                times: [0, 0.2, 0.6, 1]
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </AnimatedDiv>
  );
}
