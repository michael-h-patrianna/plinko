/**
 * Free reward reveal view with celebratory animations
 * Displays grid of reward items with staggered entrance animations
 * @param prize - Prize configuration with free rewards
 * @param onClaim - Callback when user claims the prize
 * @param canClaim - Whether the claim button should be enabled
 */

import { motion } from 'framer-motion';
import type { Prize } from '../../game/prizeTypes';
import { RewardItem } from './RewardItem';
import { useTheme } from '../../theme';
import { ThemedButton } from '../ThemedButton';

interface FreeRewardViewProps {
  prize: Prize;
  onClaim: () => void;
  canClaim: boolean;
}

export function FreeRewardView({ prize, onClaim, canClaim }: FreeRewardViewProps) {
  const { theme } = useTheme();

  const rewards = prize.freeReward;
  if (!rewards) return null;

  // Build reward items array
  const rewardItems: Array<{
    type: 'gc' | 'sc' | 'spins' | 'xp' | 'randomReward';
    amount?: number;
    xpConfig?: { icon: string; name: string };
  }> = [];

  if (rewards.sc) rewardItems.push({ type: 'sc', amount: rewards.sc });
  if (rewards.gc) rewardItems.push({ type: 'gc', amount: rewards.gc });
  if (rewards.spins) rewardItems.push({ type: 'spins', amount: rewards.spins });
  if (rewards.xp)
    rewardItems.push({ type: 'xp', amount: rewards.xp.amount, xpConfig: rewards.xp.config });
  if (rewards.randomReward) rewardItems.push({ type: 'randomReward' });

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Main card */}
      <motion.div
        className="relative rounded-2xl p-8 max-w-md w-full"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.background.secondary}e6 0%, ${theme.colors.background.primary}f2 100%)`,
          boxShadow: `0 4px 12px ${theme.colors.shadows.default}4d`,
          border: `1px solid ${theme.colors.surface.elevated}66`,
        }}
        initial={{ scale: 0, rotate: -10, opacity: 0 }}
        animate={{
          scale: [0, 1.1, 1],
          rotate: [-10, 5, 0],
          opacity: [0, 1, 1],
        }}
        transition={{
          duration: 0.25,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        <div role="status" aria-live="polite" className="text-center">
          {/* Congratulations header with gradient and glow */}
          <motion.h2
            className="text-4xl font-extrabold mb-4 relative inline-block"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary.light} 0%, ${theme.colors.primary.main} 50%, ${theme.colors.primary.dark} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `drop-shadow(0 0 20px ${theme.colors.primary.main}99) drop-shadow(0 4px 12px ${theme.colors.shadows.default}90)`,
            }}
            initial={{ scale: 0, rotate: -5 }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              duration: 0.35,
              delay: 0.3,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            You won!
          </motion.h2>

          {/* Reward grid */}
          <motion.div
            className="flex flex-wrap gap-3 justify-center my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.6 }}
          >
            {rewardItems.map((item, index) => (
              <RewardItem key={`${item.type}-${index}`} {...item} delay={0.7 + index * 0.1} />
            ))}
          </motion.div>

          {/* Description if available */}
          {prize.description && (
            <motion.p
              className="mb-6 text-sm"
              style={{ color: theme.colors.text.secondary }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: 1 }}
            >
              {prize.description}
            </motion.p>
          )}

          {/* Claim button */}
          <ThemedButton onClick={onClaim} disabled={!canClaim} delay={0.5} className="w-full">
            Claim Prize
          </ThemedButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
