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
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(15,23,42,0.98) 0%, rgba(2,6,23,0.99) 100%)',
      }}
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
          background: `radial-gradient(circle, ${prize.color}33 0%, ${prize.color}11 70%, transparent 100%)`,
          boxShadow: `0 0 60px ${prize.color}44`,
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
          className="text-3xl font-extrabold text-white mb-4"
          style={{
            textShadow: `
              0 0 30px ${prize.color}99,
              0 3px 10px rgba(0,0,0,0.9)
            `,
            background: `linear-gradient(135deg, #fef3c7 0%, ${prize.color} 50%, ${prize.color}dd 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
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
          Your <span className="font-bold" style={{ color: prize.color }}>{prize.label}</span> has been claimed successfully.
        </motion.p>

        {/* Close button */}
        <motion.button
          onClick={onClose}
          className="px-8 py-4 text-white font-bold text-lg rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            boxShadow: `
              0 10px 30px rgba(16,185,129,0.4),
              0 5px 20px rgba(59,130,246,0.4),
              0 4px 12px rgba(0,0,0,0.5),
              inset 0 2px 4px rgba(255,255,255,0.2),
              inset 0 -2px 4px rgba(0,0,0,0.3)
            `,
            border: '1px solid rgba(16,185,129,0.6)',
            textShadow: '0 2px 6px rgba(0,0,0,0.6)',
          }}
          initial={{ y: 20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          whileHover={{
            scale: 1.05,
            boxShadow: `
              0 12px 35px rgba(16,185,129,0.5),
              0 6px 24px rgba(59,130,246,0.5),
              0 5px 15px rgba(0,0,0,0.6)
            `,
          }}
          whileTap={{ scale: 0.95 }}
          transition={{
            y: { duration: 0.4, delay: 0.9 },
            opacity: { duration: 0.4, delay: 0.9 },
            scale: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] },
          }}
          data-testid="close-button"
        >
          Close
        </motion.button>
      </div>
    </motion.div>
  );
}
