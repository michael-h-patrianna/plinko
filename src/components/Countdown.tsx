/**
 * 3-2-1 Countdown animation overlay
 * Mobile game style countdown before ball drop
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface CountdownProps {
  onComplete: () => void;
  boardHeight?: number;
  pegRows?: number;
}

export function Countdown({ onComplete, boardHeight = 500, pegRows = 10 }: CountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      // Delay slightly before calling onComplete to let "GO!" animation finish
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 800); // Each number shows for 800ms

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  const displayText = count === 0 ? 'GO!' : count.toString();

  // Calculate vertical center between first and last peg rows
  const BORDER_WIDTH = 8;
  const playableHeight = boardHeight * 0.65;
  const verticalSpacing = playableHeight / (pegRows + 1);

  const firstPegY = verticalSpacing * 1 + BORDER_WIDTH + 20;
  const lastPegY = verticalSpacing * pegRows + BORDER_WIDTH + 20;
  const pegRowsCenter = (firstPegY + lastPegY) / 2;

  // Subtract half the countdown element height (200px / 2 = 100px) to center it
  const countdownTop = pegRowsCenter - 100;

  return (
    <motion.div
      className="absolute inset-0 z-40 flex justify-center pointer-events-none"
      style={{
        alignItems: 'flex-start',
        paddingTop: `${countdownTop}px`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Countdown number with explosive animation */}
      <motion.div
        key={count} // Key forces re-mount for each number
        className="relative flex items-center justify-center"
        style={{
          width: '200px',
          height: '200px',
        }}
        initial={{ scale: 0, rotate: -30, opacity: 0 }}
        animate={{
          scale: [0, 1.3, 1],
          rotate: [-30, 10, 0],
          opacity: [0, 1, 1],
        }}
        exit={{ scale: 1.5, opacity: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1], // Spring easing
        }}
      >
        {/* Expanding ring behind number */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: count === 0 ? '6px solid #10b981' : '6px solid #fbbf24',
            boxShadow: count === 0
              ? '0 0 40px rgba(16,185,129,0.8), inset 0 0 40px rgba(16,185,129,0.3)'
              : '0 0 40px rgba(251,191,36,0.8), inset 0 0 40px rgba(251,191,36,0.3)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.2, 1],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
        />

        {/* Pulsing glow */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '250px',
            height: '250px',
            left: '-25px',
            top: '-25px',
            background: count === 0
              ? 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(16,185,129,0.2) 40%, transparent 70%)'
              : 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(251,191,36,0.2) 40%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 0.6,
            repeat: count > 0 ? 1 : 0,
            ease: 'easeInOut',
          }}
        />

        {/* Main number */}
        <motion.div
          className="text-9xl font-black relative z-10"
          style={{
            textShadow: count === 0
              ? `
                0 0 40px rgba(16,185,129,1),
                0 0 20px rgba(16,185,129,0.8),
                0 8px 30px rgba(0,0,0,0.9),
                0 4px 15px rgba(0,0,0,0.6)
              `
              : `
                0 0 40px rgba(251,191,36,1),
                0 0 20px rgba(251,191,36,0.8),
                0 8px 30px rgba(0,0,0,0.9),
                0 4px 15px rgba(0,0,0,0.6)
              `,
            background: count === 0
              ? 'linear-gradient(135deg, #6ee7b7 0%, #10b981 50%, #059669 100%)'
              : 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          initial={{ y: 30 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {displayText}
        </motion.div>

        {/* Particle burst */}
        {[...Array(8)].map((_, i) => {
          const angle = (360 / 8) * i;
          const radian = (angle * Math.PI) / 180;
          const distance = 80;
          const x = Math.cos(radian) * distance;
          const y = Math.sin(radian) * distance;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: '12px',
                height: '12px',
                left: '94px',
                top: '94px',
                background: count === 0
                  ? 'radial-gradient(circle, #10b981 0%, transparent 70%)'
                  : 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
                boxShadow: count === 0
                  ? '0 0 20px rgba(16,185,129,0.8)'
                  : '0 0 20px rgba(251,191,36,0.8)',
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x,
                y,
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0.4],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
}
