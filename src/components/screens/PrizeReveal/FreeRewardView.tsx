/**
 * Free reward reveal view with premium choreographed animations
 *
 * Features orchestrated entrance sequence inspired by StartScreen:
 * - YouWonText: Elastic bounce with scale overshoot and rotation (0s, 0.6s duration)
 * - Rewards container: Diagonal swoosh entrance (0.3s, 0.5s duration)
 * - Individual counters: Enhanced pop with anticipation (0.5s+, 60ms stagger)
 * - Claim button: Elastic hero entrance with bounce (1.0s, 0.7s duration)
 *
 * All animations are cross-platform safe (transforms + opacity only, no blur/filters/shadows)
 * Overlapping animations create fluid, professional feel (~1.3s total sequence)
 *
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

  // Premium choreographed timing - inspired by StartScreen's fluid overlapping sequence
  const timing = {
    youWonEntrance: 0,           // Title bounces in immediately with elastic animation
    rewardsContainerSwoosh: 0.3, // Container swooshes in while YouWon characters still revealing
    firstCounterEntrance: 0.5,   // First counter pops in during container entrance
    counterEntranceStagger: 60,  // Tight 60ms stagger for rapid-fire reveal (ms)
    counterEntranceDuration: 400, // Duration of counter entrance animation (ms)
    counterCountingDelay: 300,   // Start counting 300ms into entrance (70% through) (ms)
    claimButton: 1.0,            // Button appears with elastic bounce, earlier for momentum
  };

  // Calculate staggered delays for counter entrances and counting animations
  let counterIndex = 0;
  const getNextCounterTiming = () => {
    const entranceDelay = timing.firstCounterEntrance + (counterIndex * timing.counterEntranceStagger) / 1000;
    const countingDelay = (entranceDelay * 1000) + timing.counterCountingDelay;
    counterIndex++;
    return { entranceDelay, countingDelay };
  };

  return (
    <PopupOverlay zIndex={theme.zIndex[40]} testId="free-reward-overlay">
      {/* Content container - no card background */}
      <div className="max-w-md w-full">
        <div role="status" aria-live="polite" className="text-center">
          {/* Epic "You Won!" text with premium elastic bounce entrance */}
          <AnimatedDiv
            initial={{ scale: 0.85, y: 20, rotate: -2 }}
            animate={{
              scale: [0.85, 1.12, 0.98, 1.02, 1],
              y: [20, -5, 2, 0, 0],
              rotate: [-2, 1, 0, 0, 0],
              opacity: [0.3, 1, 1, 1, 1],
            }}
            transition={{
              duration: 0.6,
              delay: timing.youWonEntrance,
              times: [0, 0.4, 0.65, 0.85, 1],
              ease: [0.34, 1.56, 0.64, 1], // Elastic bounce
            }}
          >
            <YouWonText />
          </AnimatedDiv>

          {/* All rewards with counter animations - swooshes in diagonally while YouWon is still animating */}
          <AnimatedDiv
            className="flex flex-col gap-4 my-8"
            initial={{ x: 20, y: 40, scale: 0.9, rotate: 2, opacity: 0.5 }}
            animate={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: timing.rewardsContainerSwoosh,
              ease: [0.34, 1.56, 0.64, 1], // Elastic bounce
            }}
          >
            {/* GC Counter with enhanced pop entrance */}
            {hasGC && (() => {
              const { entranceDelay, countingDelay } = getNextCounterTiming();
              return (
                <AnimatedDiv
                  initial={{ scale: 0.7, rotate: -5 }}
                  animate={{
                    scale: [0.7, 1.1, 1],
                    rotate: [-5, 2, 0],
                    opacity: [0.3, 1, 1],
                  }}
                  transition={{
                    duration: timing.counterEntranceDuration / 1000,
                    delay: entranceDelay,
                    times: [0, 0.6, 1],
                    ease: [0.34, 1.56, 0.64, 1], // Elastic bounce
                  }}
                >
                  <CurrencyCounter
                    targetAmount={rewards.gc!}
                    label="Gold Coins"
                    icon={<img src={gcIcon} alt="GC" />}
                    delay={countingDelay}
                  />
                </AnimatedDiv>
              );
            })()}

            {/* SC Counter with enhanced pop entrance */}
            {hasSC && (() => {
              const { entranceDelay, countingDelay } = getNextCounterTiming();
              return (
                <AnimatedDiv
                  initial={{ scale: 0.7, rotate: -5 }}
                  animate={{
                    scale: [0.7, 1.1, 1],
                    rotate: [-5, 2, 0],
                    opacity: [0.3, 1, 1],
                  }}
                  transition={{
                    duration: timing.counterEntranceDuration / 1000,
                    delay: entranceDelay,
                    times: [0, 0.6, 1],
                    ease: [0.34, 1.56, 0.64, 1], // Elastic bounce
                  }}
                >
                  <CurrencyCounter
                    targetAmount={rewards.sc!}
                    label="FREE SC"
                    icon={<img src={scIcon} alt="SC" />}
                    delay={countingDelay}
                  />
                </AnimatedDiv>
              );
            })()}

            {/* Free Spins Counter with enhanced pop entrance */}
            {hasSpins && (() => {
              const { entranceDelay, countingDelay } = getNextCounterTiming();
              return (
                <AnimatedDiv
                  initial={{ scale: 0.7, rotate: -5 }}
                  animate={{
                    scale: [0.7, 1.1, 1],
                    rotate: [-5, 2, 0],
                    opacity: [0.3, 1, 1],
                  }}
                  transition={{
                    duration: timing.counterEntranceDuration / 1000,
                    delay: entranceDelay,
                    times: [0, 0.6, 1],
                    ease: [0.34, 1.56, 0.64, 1], // Elastic bounce
                  }}
                >
                  <CurrencyCounter
                    targetAmount={rewards.spins!}
                    label="Free Spins"
                    icon={<img src={spinsIcon} alt="Free Spins" />}
                    delay={countingDelay}
                  />
                </AnimatedDiv>
              );
            })()}

            {/* XP/Collectible Counter with enhanced pop entrance */}
            {hasXP && (() => {
              const { entranceDelay, countingDelay } = getNextCounterTiming();
              return (
                <AnimatedDiv
                  initial={{ scale: 0.7, rotate: -5 }}
                  animate={{
                    scale: [0.7, 1.1, 1],
                    rotate: [-5, 2, 0],
                    opacity: [0.3, 1, 1],
                  }}
                  transition={{
                    duration: timing.counterEntranceDuration / 1000,
                    delay: entranceDelay,
                    times: [0, 0.6, 1],
                    ease: [0.34, 1.56, 0.64, 1], // Elastic bounce
                  }}
                >
                  <CurrencyCounter
                    targetAmount={rewards.xp!.amount}
                    label={rewards.xp!.config.name}
                    icon={<img src={xpIcon} alt={rewards.xp!.config.name} />}
                    delay={countingDelay}
                  />
                </AnimatedDiv>
              );
            })()}

            {/* Random Reward with enhanced pop entrance */}
            {hasRandomReward && (() => {
              const { entranceDelay, countingDelay } = getNextCounterTiming();
              return (
                <AnimatedDiv
                  initial={{ scale: 0.7, rotate: -5 }}
                  animate={{
                    scale: [0.7, 1.1, 1],
                    rotate: [-5, 2, 0],
                    opacity: [0.3, 1, 1],
                  }}
                  transition={{
                    duration: timing.counterEntranceDuration / 1000,
                    delay: entranceDelay,
                    times: [0, 0.6, 1],
                    ease: [0.34, 1.56, 0.64, 1], // Elastic bounce
                  }}
                >
                  <CurrencyCounter
                    targetAmount={1}
                    label={rewards.randomReward!.config.name}
                    icon={<img src={randomRewardIcon} alt="Random Reward" />}
                    delay={countingDelay}
                  />
                </AnimatedDiv>
              );
            })()}
          </AnimatedDiv>

          {/* Description if available - simple fade for secondary content */}
          {prize.description && (
            <AnimatedP
              className="mb-6 text-sm"
              style={{ color: theme.colors.text.secondary }}
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              transition={{ delay: timing.claimButton, duration: 0.3 }}
            >
              {prize.description}
            </AnimatedP>
          )}

          {/* Claim button with elastic hero entrance */}
          <ThemedButton
            onClick={onClaim}
            disabled={!canClaim}
            delay={timing.claimButton}
            entranceAnimation="hero"
            className="w-full min-w-[120px] h-14 text-lg"
            testId="claim-prize-button"
          >
            Claim Prize
          </ThemedButton>
        </div>
      </div>
    </PopupOverlay>
  );
}
