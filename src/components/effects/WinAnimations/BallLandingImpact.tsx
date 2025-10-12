/**
 * Ball landing impact animation with shockwave ring and glow pulse
 * Subtle, polished effect triggered when ball lands in winning slot
 *
 * REFACTORED: Removed key counter useState pattern
 * - Uses AnimatePresence with trigger-based key management
 * - Animation lifecycle managed by driver, not React state
 * - Component key derived from trigger timestamp for proper remounting
 *
 * @param x - X position of impact
 * @param y - Y position of impact
 * @param color - Color for the impact effect
 * @param trigger - Whether to trigger the animation
 */

import { useAnimationDriver } from '@theme/animationDrivers';

interface BallLandingImpactProps {
  x: number;
  y: number;
  color: string;
  trigger: boolean;
}

export function BallLandingImpact({ x, y, color, trigger }: BallLandingImpactProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');
  const { AnimatePresence } = driver;

  // Use timestamp-based key for AnimatePresence to ensure proper remounting
  // When trigger changes from false to true, generate new key for fresh animation
  const impactKey = trigger ? `impact-${Date.now()}` : 'no-impact';

  return (
    <AnimatePresence mode="wait">
      {trigger && (
        <div
          key={impactKey}
          className="absolute pointer-events-none"
          style={{ left: 0, top: 0, zIndex: 30 }}
        >
      {/* Single clean shockwave ring */}
      <AnimatedDiv
        className="absolute"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          border: `2px solid ${color}`,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0.8, opacity: 0.7 }}
        animate={{
          scale: [0.8, 3],
          opacity: [0.7, 0],
        }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
      />

      {/* Subtle glow pulse - Cross-platform: linear gradient approximation of radial glow */}
      <AnimatedDiv
        className="absolute"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}88 0%, ${color}44 50%, transparent 100%)`,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{
          scale: [0.5, 1.5],
          opacity: [0.8, 0],
        }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
        </div>
      )}
    </AnimatePresence>
  );
}
