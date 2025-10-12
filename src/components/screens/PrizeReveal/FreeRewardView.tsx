/**
 * Free reward reveal view with quality text animations
 * Uses premium text effects from animations library for professional celebration
 * Handles ALL prize types: GC, SC, spins, XP, randomReward
 * Uses PopupOverlay for consistent semi-transparent background
 * @param prize - Prize configuration with free rewards
 * @param onClaim - Callback when user claims the prize
 * @param canClaim - Whether the claim button should be enabled
 */

import spinsIcon from '../../../assets/images/free-spins.png';
import gcIcon from '../../../assets/images/gc.png';
import randomRewardIcon from '../../../assets/images/random_reward.png';
import scIcon from '../../../assets/images/sc.png';
import xpIcon from '../../../assets/images/xp.png';
import type { Prize } from '@game/prizeTypes';
import { useTheme } from '../../../theme';
import { ThemedButton } from '../../controls/ThemedButton';
import { CurrencyCounter } from '../../effects/CurrencyCounter';
import { YouWonText } from '../../effects/YouWonText';
import { useAnimation } from '@theme/animationDrivers/useAnimation';
import { PopupOverlay } from '../../layout/PopupOverlay';

interface FreeRewardViewProps {
  prize: Prize;
  onClaim: () => void;
  canClaim: boolean;
}

export function FreeRewardView({ prize, onClaim, canClaim }: FreeRewardViewProps) {
  const { AnimatedDiv, AnimatedP } = useAnimation();
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
    <PopupOverlay zIndex={theme.zIndex[40]} testId="free-reward-overlay">
      {/* Content container - no card background */}
      <div className="max-w-md w-full">
        <div role="status" aria-live="polite" className="text-center">
          {/* Epic "You Won!" text */}
          <AnimatedDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: timing.youWonStart, duration: 0.3 }}
          >
            <YouWonText />
          </AnimatedDiv>

          {/* All rewards with counter animations - fades in while YouWon is still animating */}
          <AnimatedDiv
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
                label="FREE SC"
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
          </AnimatedDiv>

          {/* Description if available */}
          {prize.description && (
            <AnimatedP
              className="mb-6 text-sm"
              style={{ color: theme.colors.text.secondary }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: timing.claimButton, duration: 0.3 }}
            >
              {prize.description}
            </AnimatedP>
          )}

          {/* Claim button */}
          <AnimatedDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: timing.claimButton, duration: 0.3 }}
          >
            <ThemedButton
              onClick={onClaim}
              disabled={!canClaim}
              className="w-full min-w-[120px] h-14 text-lg"
              testId="claim-prize-button"
            >
              Claim Prize
            </ThemedButton>
          </AnimatedDiv>
        </div>
      </div>
    </PopupOverlay>
  );
}
