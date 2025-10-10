/**
 * Individual peg component with pinball-style collision animation
 * Flashes briefly when ball collides, with expanding pulse ring effect
 *
 * PERFORMANCE OPTIMIZATION (IMPERATIVE UPDATE STRATEGY):
 * - No frameStore subscription (eliminates 3,000+ React re-renders per second)
 * - Static component that renders once during board setup
 * - Flash state controlled imperatively via BallAnimationDriver.updatePegFlash()
 * - Visual state driven by data-peg-hit attribute (CSS transitions handle animation)
 * - Pulse ring managed by driver triggering CSS keyframe animations
 *
 * ARCHITECTURE:
 * - Component renders static DOM structure with data attributes
 * - Driver queries pegs by data-testid and updates data-peg-hit imperatively
 * - CSS transitions/keyframes provide smooth visual feedback
 * - No React state, no re-renders, only DOM manipulation
 *
 * NEW VISUAL EFFECTS:
 * - Color-coded flash using winning slot theme color (via --peg-flash-color CSS var)
 * - Shake/wobble animation on impact (translateX/Y jitter)
 * - Ripple chain reaction on adjacent pegs (scale pulse)
 * - Progressive brightness by row for depth perception
 *
 * @param row - Row position in peg grid
 * @param col - Column position in peg grid
 * @param x - X coordinate in pixels
 * @param y - Y coordinate in pixels
 */

import { memo } from 'react';
import { useTheme } from '../../../theme';

interface PegProps {
  row: number;
  col: number;
  x: number;
  y: number;
}

function PegComponent({ row, col, x, y }: PegProps) {
  const { theme } = useTheme();

  // Calculate progressive brightness based on row (depth cue)
  // Rows 0-2: 70%, Rows 3-6: 85%, Rows 7+: 100%
  const calculateBrightness = (row: number): number => {
    if (row <= 2) return 0.7;
    if (row <= 6) return 0.85;
    return 1.0;
  };

  const brightness = calculateBrightness(row);

  return (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: '14px',
        height: '14px',
        transform: 'translate3d(-50%, -50%, 0)',
        /* RN-compatible: removed boxShadow, using border for depth */
        border: `1px solid ${theme.colors.border.default}`,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.shadows.default,
        borderRadius: theme.colors.game.peg.borderRadius || '50%',
        zIndex: 10,
        // GPU ACCELERATION - added transform for shake animation
        willChange: 'background, transform',
        backfaceVisibility: 'hidden',
        opacity: brightness,
      }}
      data-testid={`peg-${row}-${col}`}
      data-peg-hit="false"
      data-peg-ripple="false"
      data-peg-row={row}
      data-peg-col={col}
    >
      <style>
        {`
          /* Peg background transition controlled by data-peg-hit attribute */
          [data-testid="peg-${row}-${col}"][data-peg-hit="false"] {
            background: ${theme.gradients.pegDefault};
            transition: ${theme.effects.transitions.fast || 'background 150ms ease-out, box-shadow 150ms ease-out'};
          }

          /* Bright light-up flash using highlight color - much brighter and more visible */
          [data-testid="peg-${row}-${col}"][data-peg-hit="true"] {
            background: ${theme.colors.game.peg.highlight} !important;
            transition: ${theme.effects.transitions.fast || 'background 150ms ease-out, box-shadow 150ms ease-out, transform 150ms ease-out'};
            animation: pegShake-${row}-${col} 150ms ease-out;
            /* Add strong glow effect for extra brightness and visibility */
            box-shadow: 0 0 16px ${theme.colors.game.peg.highlight}, 0 0 8px ${theme.colors.game.peg.highlight}, 0 0 4px ${theme.colors.game.peg.highlight};
            /* Scale up slightly for emphasis */
            transform: translate3d(-50%, -50%, 0) scale(1.2);
          }

          /* Ripple effect on adjacent pegs (subtle scale pulse) */
          [data-testid="peg-${row}-${col}"][data-peg-ripple="true"] {
            animation: pegRipple-${row}-${col} 150ms ease-out 50ms;
          }

          /* Pulse ring animation - triggered by data-peg-hit="true" */
          [data-testid="peg-${row}-${col}"][data-peg-hit="true"]::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            width: 14px;
            height: 14px;
            border: 2px solid ${theme.colors.game.peg.highlight};
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: pegPulse-${row}-${col} 300ms ease-out;
            pointer-events: none;
            z-index: 5;
          }

          /* CROSS-PLATFORM COMPATIBLE: Shake animation using translate only */
          @keyframes pegShake-${row}-${col} {
            0% {
              transform: translate3d(-50%, -50%, 0) translate(0, 0) scale(1);
            }
            20% {
              transform: translate3d(-50%, -50%, 0) translate(1px, -1px) scale(1.2);
            }
            40% {
              transform: translate3d(-50%, -50%, 0) translate(-1px, 1px) scale(1.2);
            }
            60% {
              transform: translate3d(-50%, -50%, 0) translate(1px, 0px) scale(1.2);
            }
            80% {
              transform: translate3d(-50%, -50%, 0) translate(-1px, -1px) scale(1.2);
            }
            100% {
              transform: translate3d(-50%, -50%, 0) translate(0, 0) scale(1);
            }
          }

          /* CROSS-PLATFORM COMPATIBLE: Ripple animation using scale only */
          @keyframes pegRipple-${row}-${col} {
            0% {
              transform: translate3d(-50%, -50%, 0) scale(1);
            }
            50% {
              transform: translate3d(-50%, -50%, 0) scale(1.05);
            }
            100% {
              transform: translate3d(-50%, -50%, 0) scale(1);
            }
          }

          @keyframes pegPulse-${row}-${col} {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            40% {
              transform: translate(-50%, -50%) scale(2);
              opacity: 0.7;
            }
            100% {
              transform: translate(-50%, -50%) scale(4);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}

/**
 * Memoized Peg component - only re-renders when position changes
 * PERFORMANCE: Static component with no state, no subscriptions, only position props
 * Flash state controlled imperatively by BallAnimationDriver, not React state
 */
export const Peg = memo(PegComponent, (prev, next) => {
  // Only re-render if position changed (which should never happen after initial render)
  return (
    prev.x === next.x &&
    prev.y === next.y &&
    prev.row === next.row &&
    prev.col === next.col
  );
});

// Display name for React DevTools
Peg.displayName = 'Peg';
