/**
 * No win result view with encouraging messaging
 * Uses subdued styling and gentle animations, not celebratory
 * @param prize - Prize configuration with no-win messaging
 * @param onClaim - Callback to try again
 * @param canClaim - Whether the try again button should be enabled
 */

import { motion } from 'framer-motion';
import type { Prize } from '../../game/prizeTypes';
import noWinImage from '../../assets/nowin.png';
import { useTheme } from '../../theme';
import { ThemedButton } from '../ThemedButton';

interface NoWinViewProps {
  prize: Prize;
  onClaim: () => void;
  canClaim: boolean;
}

export function NoWinView({ prize, onClaim, canClaim }: NoWinViewProps) {
  const { theme } = useTheme();

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Main card - subdued colors */}
      <motion.div
        className="relative rounded-2xl p-8 max-w-sm w-full"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.background.secondary}e6 0%, ${theme.colors.background.primary}f2 100%)`,
          boxShadow: `0 4px 12px ${theme.colors.shadows.default}4d`,
          border: `1px solid ${theme.colors.surface.elevated}66`,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.25,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        <div role="status" aria-live="polite" className="text-center">
          {/* No win image */}
          <motion.img
            src={noWinImage}
            alt="No Win"
            className="w-24 h-24 mx-auto mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ duration: 0.25, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          />

          <motion.h2
            className="text-2xl font-bold mb-4"
            style={{
              color: theme.colors.text.primary,
              textShadow: `0 2px 6px ${theme.colors.shadows.default}99`,
            }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.3 }}
          >
            {prize.title}
          </motion.h2>

          {/* Encouraging message */}
          <motion.div
            className="my-6 p-4 rounded-lg"
            style={{
              background: `${theme.colors.surface.elevated}33`,
              border: `1px solid ${theme.colors.text.tertiary}33`,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.4 }}
          >
            <p className="text-base leading-relaxed" style={{ color: theme.colors.text.secondary }}>
              {prize.description || 'Better luck next time!'}
            </p>
            <p className="text-sm mt-2" style={{ color: theme.colors.text.tertiary }}>
              Keep trying - your big win could be just around the corner!
            </p>
          </motion.div>

          {/* Try again button */}
          <ThemedButton onClick={onClaim} disabled={!canClaim} delay={0.6} className="w-full">
            Try Again
          </ThemedButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
