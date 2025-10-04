/**
 * Slot Anticipation Animation
 * Disney Principle: ANTICIPATION - preparatory animation signaling the win
 * React Native compatible: transform (scale), opacity, radial gradients
 */

import { motion } from 'framer-motion';
import { useTheme } from '../theme';

interface SlotAnticipationProps {
  x: number;
  width: number;
  color: string;
  isActive: boolean;
}

export function SlotAnticipation({ x, width, color, isActive }: SlotAnticipationProps) {
  const { theme } = useTheme();
  if (!isActive) return null;

  return (
    <>
      {/* Ascending light particles - APPEAL & ANTICIPATION */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `${x + width * (0.3 + Math.random() * 0.4)}px`,
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
            delay: i * 0.2 + Math.random() * 0.3,
            repeat: Infinity,
            ease: [0.22, 1, 0.36, 1], // Ease-out cubic
          }}
        />
      ))}
    </>
  );
}
