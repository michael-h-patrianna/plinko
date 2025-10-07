/**
 * Slot win reveal animation with radial light rays and sparkles
 * Implements Disney animation principles: staging and anticipation
 * @param x - X position of the winning slot
 * @param y - Y position of the winning slot
 * @param width - Width of the slot
 * @param height - Height of the slot
 * @param color - Color theme for the animation effects
 * @param label - Prize label to display
 * @param isActive - Whether the animation should be shown
 */

import { useMemo } from 'react';
import { useTheme } from '../../../theme';
import { useAnimationDriver } from '../../../theme/animationDrivers';
import { useAppConfig } from '../../../config/AppConfigContext';
import { getPerformanceSetting } from '../../../config/appConfig';

interface SlotWinRevealProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  isActive: boolean;
}

export function SlotWinReveal({ x, y, width, height, color, label, isActive }: SlotWinRevealProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  const { theme } = useTheme();
  const { performance } = useAppConfig();

  // PERFORMANCE: Control particle count and infinite animations based on mode
  const particleMultiplier = getPerformanceSetting(performance, 'particleMultiplier') ?? 1.0;
  const enableInfiniteAnimations = getPerformanceSetting(performance, 'enableInfiniteAnimations') ?? true;

  // Calculate ray count based on particle multiplier (12 high-quality, 8 balanced, 6 power-saving)
  const rayCount = Math.max(6, Math.round(12 * particleMultiplier));

  // Calculate sparkle count based on particle multiplier (8 high-quality, 6 balanced, 4 power-saving)
  const sparkleCount = Math.max(4, Math.round(8 * particleMultiplier));

  // Memoize sparkle positions to avoid recalculating Math.random() on every render
  // Note: sparkleCount is NOT in dependencies to prevent sparkles from jumping when performance mode changes
  const sparklePositions = useMemo(
    () =>
      Array.from({ length: sparkleCount }).map(() => ({
        offsetX: (Math.random() - 0.5) * width,
        offsetY: Math.random() * height,
      })),
    [width, height]
  );

  if (!isActive) return null;

  return (
    <div className="absolute pointer-events-none" style={{ left: 0, top: 0, zIndex: 25 }}>
      {/* Radial light rays expanding from slot - STAGING - PERFORMANCE: reduced count in power-saving */}
      {Array.from({ length: rayCount }).map((_, i) => {
        const angle = (360 / rayCount) * i;

        return (
          <AnimatedDiv
            key={`ray-${i}`}
            className="absolute origin-bottom"
            style={{
              left: `${x + width / 2}px`,
              top: `${y + height}px`,
              width: '3px',
              height: '120px',
              background: `linear-gradient(to top, ${color}dd 0%, ${color}66 50%, transparent 100%)`,
              transformOrigin: 'bottom center',
              rotate: angle,
              /* RN-compatible: removed boxShadow glow */
            }}
            initial={{
              scaleY: 0,
              opacity: 0,
            }}
            animate={{
              scaleY: [0, 1.2, 1],
              opacity: [0, 0.9, 0.7],
            }}
            transition={{
              duration: 0.6,
              delay: i * 0.03,
              ease: [0.34, 1.56, 0.64, 1], // Spring ease
            }}
          />
        );
      })}

      {/* Rotating aura rings - FOLLOW THROUGH - PERFORMANCE: disabled infinite animations in power-saving */}
      {enableInfiniteAnimations && [0, 1].map((i) => (
        <AnimatedDiv
          key={`aura-${i}`}
          className="absolute"
          style={{
            left: `${x + width / 2}px`,
            top: `${y + height / 2}px`,
            width: `${width * 1.4}px`,
            height: `${width * 1.4}px`,
            borderRadius: '50%',
            border: `2px solid ${color}${i === 0 ? '66' : '44'}`,
            transform: 'translate(-50%, -50%)',
            /* RN-compatible: removed boxShadow glow */
          }}
          animate={{
            rotate: i === 0 ? 360 : -360,
            scale: [1, 1.15, 1],
          }}
          transition={{
            rotate: {
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            },
            scale: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        />
      ))}

      {/* Prize label scale-up - SQUASH & STRETCH */}
      <AnimatedDiv
        className="absolute"
        style={{
          left: `${x + width / 2}px`,
          top: `${y + height / 2}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 26,
        }}
        initial={{ scale: 0, opacity: 0, rotate: -10 }}
        animate={{
          scale: [0, 1.3, 1],
          opacity: [0, 1, 1],
          rotate: [10, -5, 0],
        }}
        transition={{
          duration: 0.7,
          delay: 0.3,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        <div
          className="px-4 py-2 rounded-lg font-bold text-white text-sm whitespace-nowrap"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            /* RN-compatible: removed boxShadow and textShadow, using border for definition */
            border: `1px solid ${color}88`,
          }}
        >
          {label}
        </div>
      </AnimatedDiv>

      {/* Shimmer sweep across slot - APPEAL - PERFORMANCE: disabled infinite animations in power-saving */}
      {enableInfiniteAnimations && (
        <AnimatedDiv
          className="absolute overflow-hidden"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: `${width}px`,
            height: `${height}px`,
            borderRadius: '0 0 8px 8px',
          }}
        >
          <AnimatedDiv
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent 0%, ${theme.colors.text.inverse}60 50%, transparent 100%)`,
            }}
            animate={{
              left: ['100%', '-100%'],
            }}
            transition={{
              duration: 1.5,
              delay: 0.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
          />
        </AnimatedDiv>
      )}

      {/* Floating sparkles - APPEAL - Cross-platform: linear gradient - PERFORMANCE: disabled infinite animations in power-saving */}
      {enableInfiniteAnimations && sparklePositions.map((pos, i) => {
        return (
          <AnimatedDiv
            key={`sparkle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${x + width / 2 + pos.offsetX}px`,
              top: `${y + pos.offsetY}px`,
              width: '4px',
              height: '4px',
              background: `linear-gradient(135deg, ${theme.colors.text.inverse} 0%, ${color} 50%, transparent 100%)`,
              /* RN-compatible: removed boxShadow glow */
            }}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
              y: [0, -30],
            }}
            transition={{
              duration: 1.5,
              delay: 0.4 + i * 0.1,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        );
      })}
    </div>
  );
}
