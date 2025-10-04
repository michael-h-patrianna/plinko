/**
 * Prize reveal overlay with enhanced triple-A animations
 * Uses Framer Motion for smooth, appealing transitions
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { PrizeConfig } from '../game/types';

interface PrizeRevealProps {
  prize: PrizeConfig;
  onClaim: () => void;
  canClaim: boolean;
}

export function PrizeReveal({ prize, onClaim, canClaim }: PrizeRevealProps) {
  const claimButtonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  // Auto-focus claim button when revealed
  useEffect(() => {
    if (canClaim && claimButtonRef.current) {
      claimButtonRef.current.focus();
    }
  }, [canClaim]);

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center p-6"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.98) 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Animated background glow - APPEAL */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${prize.color}22 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main card - STAGING & SQUASH & STRETCH */}
      <motion.div
        className="relative rounded-2xl p-8 max-w-sm"
        style={{
          background: `
            linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%),
            radial-gradient(circle at 50% 0%, ${prize.color}33 0%, transparent 70%)
          `,
          boxShadow: `
            0 0 80px ${prize.color}66,
            0 20px 60px rgba(0,0,0,0.8),
            0 10px 30px rgba(0,0,0,0.6),
            inset 0 2px 4px rgba(255,255,255,0.1),
            inset 0 -2px 4px rgba(0,0,0,0.5)
          `,
          border: `2px solid ${prize.color}88`,
        }}
        initial={{ scale: 0, rotate: -10, opacity: 0 }}
        animate={{
          scale: [0, 1.1, 1],
          rotate: [-10, 5, 0],
          opacity: [0, 1, 1],
        }}
        transition={{
          duration: 0.7,
          ease: [0.34, 1.56, 0.64, 1], // Spring ease
        }}
      >
        {/* Floating particles - APPEAL */}
        {Array.from({ length: 6 }).map((_, i) => {
          const colors = ['#fbbf24', '#fb923c', '#a78bfa', '#60a5fa', '#34d399', '#f97316'];
          const color = colors[i % colors.length];
          const offsetX = [-60, -40, -20, 20, 40, 60][i];

          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: '10px',
                height: '10px',
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                boxShadow: `0 0 15px ${color}`,
                left: '50%',
                top: '50%',
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: offsetX,
                y: [-100, -120],
                opacity: [0, 1, 0.8, 0],
                scale: [0, 1.2, 0.8, 0.4],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}

        <div
          role="status"
          aria-live="polite"
          className="text-center"
        >
          {/* Congratulations header - STAGING */}
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
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            🎉 Congratulations!
          </motion.h2>

          {/* Prize card - SQUASH & STRETCH entrance */}
          <motion.div
            className="relative my-6 p-6 rounded-xl"
            style={{
              background: `
                linear-gradient(135deg, ${prize.color} 0%, ${prize.color}dd 100%),
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)
              `,
              boxShadow: `
                0 10px 40px rgba(0,0,0,0.6),
                0 5px 20px ${prize.color}66,
                inset 0 2px 4px rgba(255,255,255,0.4),
                inset 0 -2px 4px rgba(0,0,0,0.4)
              `,
              border: `1px solid ${prize.color}cc`,
            }}
            initial={{ scale: 0, opacity: 0, rotate: -5 }}
            animate={{
              scale: [0, 1.15, 1],
              opacity: [0, 1, 1],
              rotate: [-5, 2, 0],
            }}
            transition={{
              duration: 0.6,
              delay: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            {/* Shimmer effect - APPEAL */}
            <motion.div
              className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none"
            >
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                }}
                animate={{
                  left: ['100%', '-100%'],
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.8,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            <motion.div
              className="text-2xl font-bold text-white mb-2"
              style={{ textShadow: '0 3px 10px rgba(0,0,0,0.7)' }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              {prize.label}
            </motion.div>
            <motion.div
              className="text-sm text-white/95"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              {prize.description}
            </motion.div>
          </motion.div>

          <motion.p
            className="text-slate-300 mb-6 text-center"
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            Congratulations! You won {prize.label}.
          </motion.p>

          {/* Claim button - ANTICIPATION on hover */}
          <motion.button
            ref={claimButtonRef}
            onClick={onClaim}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            disabled={!canClaim}
            className="w-full px-6 py-4 text-white font-bold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: !canClaim
                ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              boxShadow: !canClaim
                ? '0 4px 12px rgba(0,0,0,0.4)'
                : isPressed
                ? `
                  0 3px 12px rgba(16,185,129,0.25),
                  0 2px 8px rgba(59,130,246,0.25),
                  0 2px 6px rgba(0,0,0,0.4),
                  inset 0 2px 4px rgba(0,0,0,0.3)
                `
                : `
                  0 10px 30px rgba(16,185,129,0.4),
                  0 5px 20px rgba(59,130,246,0.4),
                  0 4px 12px rgba(0,0,0,0.5),
                  inset 0 2px 4px rgba(255,255,255,0.2),
                  inset 0 -2px 4px rgba(0,0,0,0.3)
                `,
              border: !canClaim
                ? '1px solid rgba(71,85,105,0.3)'
                : '1px solid rgba(16,185,129,0.6)',
              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
            }}
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: isPressed && canClaim ? 0.95 : 1,
            }}
            whileHover={
              canClaim
                ? {
                    scale: 1.05,
                    boxShadow: `
                      0 12px 35px rgba(16,185,129,0.5),
                      0 6px 24px rgba(59,130,246,0.5),
                      0 5px 15px rgba(0,0,0,0.6)
                    `,
                  }
                : {}
            }
            transition={{
              y: { duration: 0.4, delay: 1 },
              opacity: { duration: 0.4, delay: 1 },
              scale: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] },
            }}
            data-testid="claim-prize-button"
          >
            Claim Prize
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
