/**
 * Free reward reveal view with quality text animations
 * Uses premium text effects from animations library for professional celebration
 * Handles ALL prize types: GC, SC, spins, XP, randomReward
 * @param prize - Prize configuration with free rewards
 * @param onClaim - Callback when user claims the prize
 * @param canClaim - Whether the claim button should be enabled
 */

import { motion } from 'framer-motion';
import spinsIcon from '../../assets/free-spins.png';
import gcIcon from '../../assets/gc.png';
import randomRewardIcon from '../../assets/random_reward.png';
import scIcon from '../../assets/sc.png';
import xpIcon from '../../assets/xp.png';
import type { Prize } from '../../game/prizeTypes';
import { useTheme } from '../../theme';
import { ThemedButton } from '../ThemedButton';
import { CurrencyCounter } from '../effects/CurrencyCounter';
import { YouWonText } from '../effects/YouWonText';

interface FreeRewardViewProps {
  prize: Prize;
  onClaim: () => void;
  canClaim: boolean;
}

export function FreeRewardView({ prize, onClaim, canClaim }: FreeRewardViewProps) {
  const { theme } = useTheme();

  const rewards = prize.freeReward;
  if (!rewards) return null;

  const hasGC = rewards.gc && rewards.gc > 0;
  const hasSC = rewards.sc && rewards.sc > 0;
  const hasSpins = rewards.spins && rewards.spins > 0;
  const hasXP = rewards.xp && rewards.xp.amount > 0;
  const hasRandomReward = !!rewards.randomReward;

  // Choreographed timing - overlapping animations for fluid feel
  const timing = {
    cardEntrance: 0,
    youWonStart: 0.2,
    rewardsContainerFade: 0.5, // Rewards container fades in while "You Won!" is still animating
    firstCounterStart: 0.7, // First counter starts counting while text is finishing
    counterStagger: 150, // Reduced from 300ms - tighter spacing
    claimButton: 1.2, // Button appears early, overlapping with counters
  };

  // Calculate counter delays with tight staggering
  let counterDelay = timing.firstCounterStart * 1000;
  const getNextCounterDelay = () => {
    const delay = counterDelay;
    counterDelay += timing.counterStagger;
    return delay;
  };

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main card */}
      <motion.div
        className="relative rounded-2xl p-8 max-w-md w-full"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.background.secondary}e6 0%, ${theme.colors.background.primary}f2 100%)`,
          boxShadow: `0 8px 24px ${theme.colors.shadows.default}66`,
          border: `1px solid ${theme.colors.surface.elevated}66`,
        }}
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: timing.cardEntrance,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        <div role="status" aria-live="polite" className="text-center">
          {/* Epic "You Won!" text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: timing.youWonStart, duration: 0.3 }}
          >
            <YouWonText />
          </motion.div>

          {/* All rewards with counter animations - fades in while YouWon is still animating */}
          <motion.div
            className="flex flex-col gap-4 my-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: timing.rewardsContainerFade, duration: 0.3 }}
          >
            {/* GC Counter */}
            {hasGC && (
              <CurrencyCounter
                targetAmount={rewards.gc!}
                label="Gold Coins"
                icon={<img src={gcIcon} alt="GC" />}
                delay={getNextCounterDelay()}
              />
            )}

            {/* SC Counter */}
            {hasSC && (
              <CurrencyCounter
                targetAmount={rewards.sc!}
                label="Sweeps Coins"
                icon={<img src={scIcon} alt="SC" />}
                delay={getNextCounterDelay()}
              />
            )}

            {/* Free Spins Counter */}
            {hasSpins && (
              <CurrencyCounter
                targetAmount={rewards.spins!}
                label="Free Spins"
                icon={<img src={spinsIcon} alt="Free Spins" />}
                delay={getNextCounterDelay()}
              />
            )}

            {/* XP/Collectible Counter */}
            {hasXP && (
              <CurrencyCounter
                targetAmount={rewards.xp!.amount}
                label={rewards.xp!.config.name}
                icon={<img src={xpIcon} alt={rewards.xp!.config.name} />}
                delay={getNextCounterDelay()}
              />
            )}

            {/* Random Reward - Use CurrencyCounter for consistent styling */}
            {hasRandomReward && (
              <CurrencyCounter
                targetAmount={1}
                label={rewards.randomReward!.config.name}
                icon={<img src={randomRewardIcon} alt="Random Reward" />}
                delay={getNextCounterDelay()}
              />
            )}
          </motion.div>

          {/* Description if available */}
          {prize.description && (
            <motion.p
              className="mb-6 text-sm"
              style={{ color: theme.colors.text.secondary }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: timing.claimButton, duration: 0.3 }}
            >
              {prize.description}
            </motion.p>
          )}

          {/* Claim button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: timing.claimButton, duration: 0.3 }}
          >
            <ThemedButton onClick={onClaim} disabled={!canClaim} className="w-full" style={{
            minWidth: '120px',
            height: '56px',
            fontSize: '18px',
            fontWeight: 700,
          }}>
              Claim Prize
            </ThemedButton>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
