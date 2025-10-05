/**
 * Individual chamber component - uses BallLauncher component directly
 * Selected launcher is scaled up and has enhanced idle animation
 */

import { motion } from 'framer-motion';
import { BallLauncher } from './BallLauncher';

interface DropPositionChamberProps {
  x: number;
  y: number;
  isSelected: boolean;
  onClick: () => void;
}

export function DropPositionChamber({ x, y, isSelected, onClick }: DropPositionChamberProps) {
  return (
    <motion.div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        position: 'relative',
        zIndex: isSelected ? 25 : 20,
      }}
      animate={{
        scale: isSelected ? 1.3 : 1,
        y: isSelected ? [0, -3, 0] : 0,
      }}
      transition={{
        scale: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
        y: isSelected
          ? {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : { duration: 0.3 },
      }}
    >
      <BallLauncher x={x} y={y} isLaunching={false} />
    </motion.div>
  );
}
