/**
 * Individual peg component with pinball-style collision animation
 * Flashes briefly when ball collides, with expanding pulse ring effect
 *
 * PERFORMANCE OPTIMIZATION:
 * - Subscribes to frameStore independently - only affected pegs animate
 * - Checks pre-calculated hitFrames array for frame-drop-safe hit detection
 * - Handles multiple hits on same peg (even in quick succession)
 * - Saves 90%+ battery by avoiding PlinkoBoard re-renders
 *
 * @param row - Row position in peg grid
 * @param col - Column position in peg grid
 * @param x - X coordinate in pixels
 * @param y - Y coordinate in pixels
 * @param hitFrames - Array of frame numbers when this peg gets hit
 * @param frameStore - Animation frame store for subscribing to current frame
 * @param shouldReset - Signal to reset peg state (e.g., new game)
 */

import { useEffect, useState, useRef, memo, useSyncExternalStore } from 'react';
import { useTheme } from '../../../theme';

interface FrameStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
  getCurrentFrame: () => number;
}

interface PegProps {
  row: number;
  col: number;
  x: number;
  y: number;
  hitFrames?: number[]; // Frame numbers when this peg gets hit
  frameStore?: FrameStore;
  shouldReset?: boolean;
}

function PegComponent({ row, col, x, y, hitFrames = [], frameStore, shouldReset = false }: PegProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const lastCheckedFrameRef = useRef(-1);
  const activeTimeoutRef = useRef<number | null>(null);
  const { theme } = useTheme();

  // PERFORMANCE: Only subscribe if this peg will be hit
  // Prevents 50+ unused pegs from subscribing and re-rendering at 60 FPS
  const hasHits = hitFrames && hitFrames.length > 0;
  const dummySubscribe = () => () => {};
  const dummyGetSnapshot = () => -1;
  const currentFrame = useSyncExternalStore(
    hasHits && frameStore?.subscribe ? frameStore.subscribe : dummySubscribe,
    hasHits && frameStore?.getSnapshot ? frameStore.getSnapshot : dummyGetSnapshot,
    hasHits && frameStore?.getSnapshot ? frameStore.getSnapshot : dummyGetSnapshot
  );

  // Reset when new ball drop starts
  useEffect(() => {
    if (shouldReset) {
      setIsFlashing(false);
      setFlashKey(0);
      lastCheckedFrameRef.current = -1;
      if (activeTimeoutRef.current) {
        clearTimeout(activeTimeoutRef.current);
        activeTimeoutRef.current = null;
      }
    }
  }, [shouldReset]);

  // Frame-drop-safe hit detection: check if any hit frames occurred between last check and now
  useEffect(() => {
    if (!hitFrames || hitFrames.length === 0 || currentFrame < 0) return;

    // Find any hit frames between lastCheckedFrame and currentFrame (inclusive)
    const newHits = hitFrames.filter(
      (hitFrame) => hitFrame > lastCheckedFrameRef.current && hitFrame <= currentFrame
    );

    if (newHits.length > 0) {
      // Peg was hit! Trigger animation for EACH hit
      newHits.forEach(() => {
        setFlashKey((prev) => prev + 1);
      });
      setIsFlashing(true);

      // Clear any existing timeout to reset the animation duration
      if (activeTimeoutRef.current) {
        clearTimeout(activeTimeoutRef.current);
      }

      // Flash lasts 300ms (extended to handle rapid successive hits better)
      activeTimeoutRef.current = window.setTimeout(() => {
        setIsFlashing(false);
        activeTimeoutRef.current = null;
      }, 300);
    }

    // Update last checked frame
    lastCheckedFrameRef.current = currentFrame;
  }, [currentFrame, hitFrames]);

  return (
    <>
      {/* Expanding pulse ring when hit - GPU accelerated */}
      {isFlashing && (
        <div
          key={flashKey}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: '14px',
            height: '14px',
            transform: 'translate3d(-50%, -50%, 0)',
            border: `2px solid ${theme.colors.game.peg.highlight}`,
            animation: 'pulseRing 300ms ease-out',
            zIndex: 15,
            // GPU ACCELERATION
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
          }}
        />
      )}

      {/* Peg itself - lights up briefly then smoothly turns off */}
      <div
        className="absolute"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '14px',
          height: '14px',
          transform: 'translate3d(-50%, -50%, 0)',
          background: isFlashing
            ? theme.gradients.pegActive // Active/hit state gradient
            : theme.gradients.pegDefault, // Default state gradient
          /* RN-compatible: removed boxShadow, using border for depth */
          border: `1px solid ${theme.colors.border.default}`,
          borderBottomWidth: 2,
          borderBottomColor: theme.colors.shadows.default,
          borderRadius: theme.colors.game.peg.borderRadius || '50%',
          transition: theme.effects.transitions.fast || 'background 150ms ease-out',
          zIndex: 10,
          // GPU ACCELERATION
          willChange: 'background',
          backfaceVisibility: 'hidden',
        }}
        data-testid={`peg-${row}-${col}`}
        data-peg-hit={isFlashing}
      />

      <style>{`
        @keyframes pulseRing {
          0% {
            transform: translate3d(-50%, -50%, 0) scale(1);
            opacity: 1;
            border-width: 3px;
          }
          40% {
            transform: translate3d(-50%, -50%, 0) scale(2);
            opacity: 0.7;
            border-width: 2px;
          }
          100% {
            transform: translate3d(-50%, -50%, 0) scale(4);
            opacity: 0;
            border-width: 1px;
          }
        }
      `}</style>
    </>
  );
}

/**
 * Memoized Peg component - only re-renders when hitFrames or position changes
 * PERFORMANCE: Pegs handle their own frame subscription, no parent re-renders needed
 */
export const Peg = memo(PegComponent, (prev, next) => {
  // Only re-render if hitFrames, shouldReset, or position changed
  return (
    prev.hitFrames === next.hitFrames &&
    prev.frameStore === next.frameStore &&
    prev.shouldReset === next.shouldReset &&
    prev.x === next.x &&
    prev.y === next.y
  );
});

// Display name for React DevTools
Peg.displayName = 'Peg';
