/**
 * Prize claimed confirmation screen with success animation
 * Displays checkmark animation and allows user to close/reset game
 * @param prize - Prize configuration (not currently used in display)
 * @param onClose - Callback to close and reset the game
 */

import { motion } from 'framer-motion';
import type { PrizeConfig } from '../game/types';
import { useTheme } from '../theme';
import { ThemedButton } from './ThemedButton';

interface PrizeClaimedProps {
  prize: PrizeConfig;
  onClose: () => void;
}

export function PrizeClaimed({ onClose }: PrizeClaimedProps) {
  const { theme } = useTheme();
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Success checkmark stamp - single unified element */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `${theme.colors.status.success}1a`,
          left: '50%',
          top: '50%',
          zIndex: 5,
        }}
        initial={{
          x: '-50%',
          y: '-50%',
          scale: 0,
          opacity: 0
        }}
        animate={{
          x: '-50%',
          y: '-50%',
          scale: 1,
          opacity: 0.35
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.1
        }}
      >
        {/* Expanding rings - single pulse */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: `2px solid ${theme.colors.status.success}`,
              top: '0',
              left: '0',
            }}
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: 2.5,
              opacity: 0,
            }}
            transition={{
              duration: 1.2,
              delay: 0.15 + i * 0.15,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Checkmark symbol */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-6xl font-bold"
          style={{ color: theme.colors.status.success }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 0.6
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 15,
            delay: 0.15
          }}
        >
          ✓
        </motion.div>
      </motion.div>

      {/* Centered content container - appears on top of checkmark */}
      <div className="relative flex flex-col items-center text-center" style={{ zIndex: 10 }}>
        {/* Prize Claimed header - matching StartScreen title style */}
        <motion.h2
          className="text-4xl font-extrabold mb-6 text-center"
          style={{
            background: theme.gradients.titleGradient || theme.gradients.buttonPrimary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: theme.typography.fontFamily.display || theme.typography.fontFamily.primary,

          }}
          initial={{ scale: 0, rotate: -5, opacity: 0 }}
          animate={{
            scale: 1,
            rotate: 0,
            opacity: 1,
          }}
          transition={{
            duration: 0.35,
            delay: 0.5,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          Prize Claimed!
        </motion.h2>

        {/* Prize summary */}
        <motion.p
          className="mb-8 text-lg"
          style={{ color: theme.colors.text.secondary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.8 }}
        >
          Your reward has been claimed successfully.
        </motion.p>

        {/* Close button */}
        <ThemedButton onClick={onClose} delay={0.6} testId="close-button" style={{
            minWidth: '120px',
            height: '56px',
            fontSize: '18px',
            fontWeight: 700,
          }}

        >
          Close
        </ThemedButton>
      </div>
    </motion.div>
  );
}
