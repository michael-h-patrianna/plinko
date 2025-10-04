/**
 * Prize claimed confirmation screen
 * Shows success message with Close button to reset game
 */

import { motion } from 'framer-motion';
import type { PrizeConfig } from '../game/types';
import { useTheme } from '../theme';
import { ThemedButton } from './ThemedButton';

interface PrizeClaimedProps {
  prize: PrizeConfig;
  onClose: () => void;
}

export function PrizeClaimed({ prize, onClose }: PrizeClaimedProps) {
  const { theme } = useTheme();
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
          background: `${theme.colors.status.success}1a`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-6xl"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.35, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        >
          ✓
        </motion.div>
      </motion.div>

      <div className="relative text-center">
        {/* Prize Claimed header - matching StartScreen title style */}
        <motion.h2
          className="text-4xl font-extrabold mb-6 text-center"
          style={{
            background: theme.gradients.titleGradient || theme.gradients.buttonPrimary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: theme.typography.fontFamily.display || theme.typography.fontFamily.primary,
            filter: `drop-shadow(0 0 20px ${theme.colors.shadows.colored}) drop-shadow(0 4px 12px ${theme.colors.shadows.default})`,
          }}
          initial={{ scale: 0, rotate: -5 }}
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{
            duration: 0.35,
            delay: 0.2,
            ease: [0.34, 1.56, 0.64, 1]
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
          transition={{ duration: 0.25, delay: 0.7 }}
        >
          Your reward has been claimed successfully.
        </motion.p>

        {/* Close button */}
        <ThemedButton
          onClick={onClose}
          delay={0.3}
          testId="close-button"
        >
          Close
        </ThemedButton>
      </div>
    </motion.div>
  );
}
