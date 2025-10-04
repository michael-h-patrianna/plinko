/**
 * Start screen with game title and drop button
 * Staggered entrance animation for polished reveal
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PrizeConfig } from '../game/types';

interface StartScreenProps {
  prizes: PrizeConfig[];
  onStart: () => void;
  disabled: boolean;
}

export function StartScreen({ prizes, onStart, disabled }: StartScreenProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(15,23,42,0.98) 0%, rgba(2,6,23,0.99) 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Title - first element */}
      <motion.h1
        className="text-4xl font-extrabold text-white mb-6 text-center"
        style={{
          textShadow: `
            0 0 30px rgba(251,191,36,0.5),
            0 2px 10px rgba(0,0,0,0.8),
            0 4px 20px rgba(0,0,0,0.6)
          `,
          background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.1,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        Plinko Popup
      </motion.h1>

      {/* Prize list - second element with stagger */}
      <motion.div
        className="rounded-lg p-4 mb-8 w-full"
        style={{
          maxWidth: 'calc(100% - 40px)',
          background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.6),
            0 4px 16px rgba(0,0,0,0.4),
            inset 0 1px 2px rgba(255,255,255,0.08),
            inset 0 -1px 2px rgba(0,0,0,0.5)
          `,
          border: '1px solid rgba(71,85,105,0.4)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <h2 className="text-lg font-semibold text-slate-200 mb-3 text-center">
          Available Prizes
        </h2>
        <div className="space-y-2">
          {prizes.map((prize, index) => (
            <motion.div
              key={prize.id}
              className="flex items-center justify-between text-sm px-2 py-1 rounded"
              style={{
                background: `linear-gradient(90deg, ${prize.color}15 0%, transparent 100%)`,
                borderLeft: `2px solid ${prize.color}`,
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.3 + index * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className="text-slate-200 font-medium">{prize.label}</span>
              <span className="text-amber-400 font-semibold">
                {(prize.probability * 100).toFixed(0)}%
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Button - final element with slight delay and hover anticipation */}
      <motion.button
        onClick={onStart}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        disabled={disabled}
        className="px-8 py-4 text-white font-bold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: disabled
            ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
            : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
          boxShadow: disabled
            ? '0 4px 12px rgba(0,0,0,0.4)'
            : isPressed
            ? `
              0 4px 15px rgba(251,191,36,0.3),
              0 2px 8px rgba(251,146,60,0.2),
              0 2px 6px rgba(0,0,0,0.4),
              inset 0 2px 4px rgba(0,0,0,0.3)
            `
            : `
              0 10px 30px rgba(251,191,36,0.4),
              0 6px 20px rgba(251,146,60,0.3),
              0 4px 12px rgba(0,0,0,0.5),
              inset 0 1px 2px rgba(255,255,255,0.3),
              inset 0 -1px 2px rgba(0,0,0,0.3)
            `,
          border: disabled
            ? '1px solid rgba(71,85,105,0.3)'
            : '1px solid rgba(217,119,6,0.6)',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        }}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isPressed && !disabled ? 0.95 : 1,
        }}
        whileHover={
          !disabled
            ? {
                scale: 1.05,
                boxShadow: `
                  0 12px 35px rgba(251,191,36,0.5),
                  0 8px 25px rgba(251,146,60,0.4),
                  0 6px 15px rgba(0,0,0,0.6)
                `,
              }
            : {}
        }
        transition={{
          opacity: { duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] },
          scale: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] },
        }}
        data-testid="drop-ball-button"
      >
        Drop Ball
      </motion.button>
    </motion.div>
  );
}
