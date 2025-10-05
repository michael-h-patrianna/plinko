/**
 * "You Won!" text animation adapted from animations library
 * Uses theme colors instead of hardcoded golden gradients
 * Premium text reveal with character-by-character animation
 */

import { motion } from 'framer-motion';
import { useTheme } from '../../theme';
import './YouWonText.css';

export function YouWonText() {
  const { theme } = useTheme();
  const mainText = 'YOU WON!';

  return (
    <div className="you-won-container">
      <div className="you-won-text-container">
        {/* Shadow layers for depth */}
        <motion.div
          className="you-won-shadow-far"
          initial={{ opacity: 0, scale: 1.2, y: 10 }}
          animate={{
            opacity: 0.2,
            scale: 1,
            y: 6,
          }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {mainText}
        </motion.div>

        <motion.div
          className="you-won-shadow-mid"
          initial={{ opacity: 0, scale: 1.1, y: 5 }}
          animate={{
            opacity: 0.3,
            scale: 1,
            y: 3,
          }}
          transition={{
            duration: 0.45,
            delay: 0.05,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {mainText}
        </motion.div>

        {/* Main text with character animation */}
        <motion.div
          className="you-won-main-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {mainText.split('').map((char, index) => (
            <motion.span
              key={index}
              className="you-won-char"
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.5,
                rotateY: -90,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotateY: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.1 + index * 0.04,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <span
                className="you-won-char-inner"
                style={{
                  color: theme.colors.primary.light,
                }}
              >
                {char === ' ' ? '\u00A0' : char}

                {/* Character glow burst */}
                <motion.span
                  className="you-won-char-glow"
                  style={{
                    background: `radial-gradient(circle, ${theme.colors.primary.main}33, transparent 60%)`,
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: [0, 1, 0.3],
                    scale: [0.8, 1.4, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.5 + index * 0.04,
                    times: [0, 0.3, 1],
                    ease: 'easeOut',
                  }}
                />
              </span>
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
