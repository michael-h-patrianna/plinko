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
import { motion } from 'framer-motion';
import { useTheme } from '../../theme';

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
  const { theme } = useTheme();

  // Memoize sparkle positions to avoid recalculating Math.random() on every render
  const sparklePositions = useMemo(
    () =>
      Array.from({ length: 8 }).map(() => ({
        offsetX: (Math.random() - 0.5) * width,
        offsetY: Math.random() * height,
      })),
    [width, height]
  );

  if (!isActive) return null;

  return (
    <div className="absolute pointer-events-none" style={{ left: 0, top: 0, zIndex: 25 }}>
      {/* Radial light rays expanding from slot - STAGING */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (360 / 12) * i;

        return (
          <motion.div
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
              boxShadow: `0 0 8px ${color}`,
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

      {/* Rotating aura rings - FOLLOW THROUGH */}
      {[0, 1].map((i) => (
        <motion.div
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
            boxShadow: `0 0 20px ${color}66`,
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
      <motion.div
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
            boxShadow: `
              0 8px 24px ${color}66,
              0 4px 12px ${theme.colors.shadows.default}50,
              inset 0 1px 2px ${theme.colors.text.inverse}30,
              inset 0 -1px 2px ${theme.colors.shadows.default}30
            `,
            border: `1px solid ${color}88`,
            textShadow: `0 2px 4px ${theme.colors.shadows.default}60`,
          }}
        >
          {label}
        </div>
      </motion.div>

      {/* Shimmer sweep across slot - APPEAL */}
      <motion.div
        className="absolute overflow-hidden"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: '0 0 8px 8px',
        }}
      >
        <motion.div
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
      </motion.div>

      {/* Floating sparkles - APPEAL */}
      {sparklePositions.map((pos, i) => {
        return (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${x + width / 2 + pos.offsetX}px`,
              top: `${y + pos.offsetY}px`,
              width: '4px',
              height: '4px',
              background: `radial-gradient(circle, ${theme.colors.text.inverse} 0%, ${color} 70%, transparent 100%)`,
              boxShadow: `0 0 8px ${color}`,
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
