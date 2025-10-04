/**
 * Prize claimed confirmation screen
 * Shows success message with Close button to reset game
 */

import { motion } from 'framer-motion';
import type { PrizeConfig } from '../game/types';

interface PrizeClaimedProps {
  prize: PrizeConfig;
  onClose: () => void;
}

export function PrizeClaimed({ prize, onClose }: PrizeClaimedProps) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Success checkmark with scale animation */}
      <motion.div
        className="absolute"
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(16,15,29,0.1)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-6xl"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        >
          ✓
        </motion.div>
      </motion.div>

      <div className="relative text-center">
        {/* Prize Claimed header */}
        <motion.h2
          className="text-4xl font-extrabold mb-4"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.5)) drop-shadow(0 0 20px rgba(139,92,246,0.5)) drop-shadow(0 4px 12px rgba(0,0,0,0.9))',
          }}
          initial={{ scale: 0, rotate: -10 }}
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 0.5,
            ease: [0.34, 1.56, 0.64, 1]
          }}
        >
          Prize Claimed!
        </motion.h2>

        {/* Prize summary */}
        <motion.p
          className="text-slate-300 mb-8 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          Your reward has been claimed successfully.
        </motion.p>

        {/* Close button */}
        <motion.button
          onClick={onClose}
          className="btn-primary"
          initial={{ y: 20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            y: { duration: 0.4, delay: 0.9 },
            opacity: { duration: 0.4, delay: 0.9 },
          }}
          data-testid="close-button"
        >
          Close
        </motion.button>
      </div>
    </motion.div>
  );
}
