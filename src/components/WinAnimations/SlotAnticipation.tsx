/**
 * Slot anticipation animation with ascending light particles
 * Implements Disney anticipation principle - preparatory animation signaling the win
 * @param x - X position of the slot
 * @param width - Width of the slot
 * @param color - Color for the particle effects
 * @param isActive - Whether the animation should be shown
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SlotAnticipationProps {
  x: number;
  width: number;
  color: string;
  isActive: boolean;
}

export function SlotAnticipation({ x, width, color, isActive }: SlotAnticipationProps) {
  // Memoize particle positions and delays to avoid Math.random() on every render
  const particles = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        x: x + width * (0.3 + Math.random() * 0.4),
        delay: i * 0.2 + Math.random() * 0.3,
      })),
    [x, width]
  );

  if (!isActive) return null;

  return (
    <>
      {/* Ascending light particles - APPEAL & ANTICIPATION */}
      {particles.map((particle, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `${particle.x}px`,
            bottom: '0px',
            width: '6px',
            height: '6px',
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            boxShadow: `0 0 12px ${color}`,
          }}
          initial={{ y: 0, opacity: 0, scale: 0 }}
          animate={{
            y: -80,
            opacity: [0, 1, 0.8, 0],
            scale: [0, 1, 0.8, 0.3],
          }}
          transition={{
            duration: 2,
            delay: particle.delay,
            repeat: Infinity,
            ease: [0.22, 1, 0.36, 1], // Ease-out cubic
          }}
        />
      ))}
    </>
  );
}
