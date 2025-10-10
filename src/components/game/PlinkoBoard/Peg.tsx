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
        // GPU ACCELERATION
        willChange: 'background',
        backfaceVisibility: 'hidden',
      }}
      data-testid={`peg-${row}-${col}`}
      data-peg-hit="false"
    >
      <style>
        {`
          /* Peg background transition controlled by data-peg-hit attribute */
          [data-peg-hit="false"] {
            background: ${theme.gradients.pegDefault};
            transition: ${theme.effects.transitions.fast || 'background 150ms ease-out'};
          }
          [data-peg-hit="true"] {
            background: ${theme.gradients.pegActive};
            transition: ${theme.effects.transitions.fast || 'background 150ms ease-out'};
          }

          /* Pulse ring animation - triggered by data-peg-hit="true" */
          [data-peg-hit="true"]::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            width: 14px;
            height: 14px;
            border: 2px solid ${theme.colors.game.peg.highlight};
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: pegPulse 300ms ease-out;
            pointer-events: none;
            z-index: 5;
          }

          @keyframes pegPulse {
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
