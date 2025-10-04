/**
 * Start screen with game title and drop button
 * FULLY THEMEABLE - No hard-coded styles
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PrizeConfig } from '../game/types';
import { getSlotDisplayText } from '../game/prizeTypes';
import { abbreviateNumber } from '../utils/formatNumber';
import { useTheme } from '../theme';
import { ThemedButton } from './ThemedButton';

interface StartScreenProps {
  prizes: PrizeConfig[];
  onStart: () => void;
  disabled: boolean;
}

export function StartScreen({ prizes, onStart, disabled }: StartScreenProps) {
  const [expandedPrize, setExpandedPrize] = useState<string | null>(null);
  const { theme } = useTheme();

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Title - using theme */}
      <motion.h1
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
          duration: 0.25,
          delay: 0.1,
          ease: [0.34, 1.56, 0.64, 1]
        }}
      >
        Plinko Popup
      </motion.h1>

      {/* Prize list - using theme component styles */}
      <motion.div
        className="p-4 mb-8 w-full"
        style={{
          maxWidth: 'calc(100% - 40px)',
          background: theme.components?.card?.background || theme.colors.surface.primary,
          boxShadow: theme.components?.card?.shadow || theme.effects.shadows.card,
          border: theme.components?.card?.border || `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.components?.card?.borderRadius || theme.borderRadius.card,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.25,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <h2
          className="text-lg font-semibold mb-3 text-center"
          style={{
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily.primary,
          }}
        >
          Available Prizes
        </h2>
        <div className="space-y-2">
          {prizes.map((prize, index) => {
            const prizeType = (prize as any).type;
            const isPurchaseOffer = prizeType === 'purchase';
            const prizeReward = (prize as any).freeReward;
            const rewardCount = prizeReward ? [
              prizeReward.sc,
              prizeReward.gc,
              prizeReward.spins,
              prizeReward.xp,
              prizeReward.randomReward
            ].filter(Boolean).length : 0;
            const isCombo = rewardCount >= 2 && !isPurchaseOffer;
            const isExpanded = expandedPrize === prize.id;

            // Display text logic
            let displayText: string;
            if (isPurchaseOffer) {
              displayText = '200% Special Offer';
            } else if (isCombo) {
              displayText = prize.label || '';
            } else {
              displayText = getSlotDisplayText(prize as any, abbreviateNumber, true) || prize.label || '';
            }

            return (
              <motion.div
                key={prize.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.3 + index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div
                  className="flex items-center justify-between text-sm px-2 py-1"
                  style={{
                    background: `linear-gradient(90deg, ${prize.color}15 0%, transparent 100%)`,
                    borderLeft: `2px solid ${prize.color}`,
                    borderRadius: theme.borderRadius.sm,
                    cursor: isCombo ? 'pointer' : 'default',
                  }}
                  onClick={() => isCombo && setExpandedPrize(isExpanded ? null : prize.id)}
                >
                  <span
                    className="font-medium flex items-center gap-1"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {displayText}
                    {isCombo && (
                      <span style={{ color: theme.colors.text.tertiary }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    )}
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: theme.colors.accent.main }}
                  >
                    {(prize.probability * 100).toFixed(0)}%
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {isCombo && isExpanded && (
                    <motion.div
                      className="text-xs px-2 py-2"
                      style={{
                        background: `${prize.color}08`,
                        marginLeft: '8px',
                        borderRadius: theme.borderRadius.sm,
                        color: theme.colors.text.secondary,
                      }}
                      initial={{ opacity: 0, maxHeight: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                      animate={{
                        opacity: 1,
                        maxHeight: 100,
                        marginTop: 4,
                        paddingTop: 8,
                        paddingBottom: 8,
                      }}
                      exit={{
                        opacity: 0,
                        maxHeight: 0,
                        marginTop: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: 'easeInOut'
                      }}
                    >
                      {prizeReward.sc && <div>• Coins: {abbreviateNumber(prizeReward.sc)}</div>}
                      {prizeReward.gc && <div>• Gold Coins: {abbreviateNumber(prizeReward.gc)}</div>}
                      {prizeReward.spins && <div>• Free Spins: {prizeReward.spins}</div>}
                      {prizeReward.xp && <div>• XP Points: {abbreviateNumber(prizeReward.xp)}</div>}
                      {prizeReward.randomReward && <div>• Mystery Reward</div>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Play button */}
      <ThemedButton
        onClick={onStart}
        disabled={disabled}
        delay={0.3}
        testId="drop-ball-button"
      >
        Drop Ball
      </ThemedButton>
    </motion.div>
  );
}