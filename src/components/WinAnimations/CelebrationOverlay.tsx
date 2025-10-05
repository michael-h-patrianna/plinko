/**
 * Full-screen celebration overlay with confetti, prize card, and star bursts
 * Implements Disney staging and appeal principles for final win sequence
 * @param prize - Prize configuration with color and label
 * @param isVisible - Whether the overlay should be shown
 * @param onComplete - Callback when animation completes
 */

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PrizeConfig } from '../../game/types';
import { useTheme } from '../../theme';

interface CelebrationOverlayProps {
  prize: PrizeConfig;
  isVisible: boolean;
  onComplete?: () => void;
}

export function CelebrationOverlay({ prize, isVisible, onComplete }: CelebrationOverlayProps) {
  const { theme } = useTheme();

  // Memoize confetti particle configurations to avoid Math.random() on every render
  const confettiParticles = useMemo(() => {
    const colors = [
      theme.colors.game.ball.primary,
      theme.colors.status.warning,
      theme.colors.status.success,
      theme.colors.accent.light,
      theme.colors.primary.light,
      theme.colors.prizes.violet.main,
    ];

    return Array.from({ length: 12 }).map(() => {
      const startX = Math.random() * 100;
      const endX = startX + (Math.random() - 0.5) * 30;
      return {
        startX,
        endX,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotate: Math.random() * 720,
      };
    });
  }, [theme]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(circle at 50% 50%, ${theme.colors.background.primary}98 0%, rgba(2,6,23,0.99) 100%)`,
          }}
        >
          {/* Confetti particles from top - FOLLOW THROUGH & OVERLAPPING ACTION */}
          {/* Reduced to 12 particles for mobile performance */}
          {confettiParticles.map((particle, i) => (
              <motion.div
                key={`confetti-${i}`}
                className="absolute rounded-sm"
                style={{
                  width: '8px',
                  height: '8px',
                  background: particle.color,
                  boxShadow: `0 0 10px ${particle.color}88`,
                  top: '-20px',
                  left: `${particle.startX}%`,
                }}
                initial={{
                  y: 0,
                  x: 0,
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                }}
                animate={{
                  y: 600,
                  x: `${particle.endX - particle.startX}%`,
                  opacity: [1, 1, 0.8, 0],
                  rotate: particle.rotate,
                  scale: [1, 0.8, 0.6],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}

          {/* Prize card container - STAGING */}
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -20, opacity: 0 }}
            animate={{
              scale: [0, 1.1, 1],
              rotate: [-20, 5, 0],
              opacity: [0, 1, 1],
            }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.34, 1.56, 0.64, 1], // Spring ease
            }}
            onAnimationComplete={onComplete}
          >
            {/* Pulsing glow background - SQUASH & STRETCH rhythm */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${prize.color}66 0%, ${prize.color}22 50%, transparent 100%)`,
                filter: 'blur(30px)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Main prize card */}
            <div
              className="relative rounded-3xl p-12 max-w-sm"
              style={{
                background: `
                  linear-gradient(135deg, ${theme.colors.background.secondary}98 0%, ${theme.colors.background.primary}99 100%),
                  radial-gradient(circle at 50% 0%, ${prize.color}33 0%, transparent 70%)
                `,
                boxShadow: `
                  0 0 80px ${prize.color}66,
                  0 20px 60px ${theme.colors.shadows.default}80,
                  0 10px 30px ${theme.colors.shadows.default}60,
                  inset 0 2px 4px ${theme.colors.text.inverse}10,
                  inset 0 -2px 4px ${theme.colors.shadows.default}50
                `,
                border: `2px solid ${prize.color}88`,
              }}
            >
              {/* Congratulations text - APPEAL */}
              <motion.h2
                className="text-4xl font-extrabold mb-6 text-center"
                style={{
                  textShadow: `
                    0 0 30px ${prize.color}99,
                    0 3px 10px ${theme.colors.shadows.default}90
                  `,
                  background: `linear-gradient(135deg, ${theme.colors.text.primary} 0%, ${prize.color} 50%, ${prize.color}dd 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                🎉 You Won! 🎉
              </motion.h2>

              {/* Prize display - STAGING sequence */}
              <motion.div
                className="relative mb-8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 1],
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.7,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                <div
                  className="p-8 rounded-2xl"
                  style={{
                    background: `
                      linear-gradient(135deg, ${prize.color} 0%, ${prize.color}dd 100%),
                      radial-gradient(circle at 30% 30%, ${theme.colors.text.inverse}30 0%, transparent 60%)
                    `,
                    boxShadow: `
                      0 10px 40px ${theme.colors.shadows.default}60,
                      0 5px 20px ${prize.color}66,
                      inset 0 2px 4px ${theme.colors.text.inverse}40,
                      inset 0 -2px 4px ${theme.colors.shadows.default}40
                    `,
                    border: `1px solid ${prize.color}cc`,
                  }}
                >
                  <div
                    className="text-3xl font-bold text-white mb-3 text-center"
                    style={{ textShadow: `0 3px 10px ${theme.colors.shadows.default}70` }}
                  >
                    {prize.label}
                  </div>
                  <div
                    className="text-base text-white/95 text-center"
                    style={{ textShadow: `0 2px 6px ${theme.colors.shadows.default}60` }}
                  >
                    {prize.description}
                  </div>
                </div>

                {/* Rotating sparkle ring - APPEAL */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    border: `2px solid ${prize.color}44`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={`sparkle-${i}`}
                      className="absolute rounded-full"
                      style={{
                        width: '6px',
                        height: '6px',
                        background: theme.colors.text.inverse,
                        boxShadow: `0 0 12px ${prize.color}`,
                        top: i % 2 === 0 ? '0' : 'auto',
                        bottom: i % 2 === 1 ? '0' : 'auto',
                        left: i < 2 ? '0' : 'auto',
                        right: i >= 2 ? '0' : 'auto',
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 1,
                        delay: i * 0.25,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>

              {/* Success message */}
              <motion.p
                className="text-slate-300 text-center text-lg mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1 }}
              >
                Congratulations on your amazing win!
              </motion.p>
            </div>
          </motion.div>

          {/* Corner star bursts - APPEAL */}
          {[
            { x: '10%', y: '10%' },
            { x: '90%', y: '10%' },
            { x: '10%', y: '90%' },
            { x: '90%', y: '90%' },
          ].map((pos, i) => (
            <motion.div
              key={`starburst-${i}`}
              className="absolute"
              style={{
                left: pos.x,
                top: pos.y,
              }}
              initial={{ scale: 0, opacity: 0, rotate: 0 }}
              animate={{
                scale: [0, 1, 0.8],
                opacity: [0, 1, 0.6],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1,
                delay: 0.3 + i * 0.1,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              {/* 8-pointed star using gradients */}
              {Array.from({ length: 8 }).map((_, rayIndex) => (
                <div
                  key={`ray-${rayIndex}`}
                  className="absolute"
                  style={{
                    width: '3px',
                    height: '40px',
                    background: `linear-gradient(to top, ${prize.color} 0%, transparent 100%)`,
                    transformOrigin: 'bottom center',
                    transform: `rotate(${(360 / 8) * rayIndex}deg) translate(-50%, 0)`,
                    left: '50%',
                    bottom: '50%',
                  }}
                />
              ))}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
