/**
 * Initial start screen displaying game title, prize list, and play button
 * Prize list shows probabilities and supports expandable combo rewards
 * @param prizes - Array of available prizes with probabilities
 * @param onStart - Callback to start the game
 * @param disabled - Whether the start button should be disabled
 */

import { useState } from 'react';
import { getSlotDisplayText } from '../../game/prizeTypes';
import type { PrizeConfig } from '../../game/types';
import { useTheme } from '../../theme';
import { getPrizeThemeColor, getPrizeThemeColorWithOpacity } from '../../theme/prizeColorMapper';
import { abbreviateNumber } from '../../utils/formatNumber';
import { ThemedButton } from '../controls/ThemedButton';
import { useAnimation } from '../../theme/animationDrivers/useAnimation';

interface StartScreenProps {
  prizes: PrizeConfig[];
  onStart: () => void;
  disabled: boolean;
  winningIndex?: number;
}

export function StartScreen({ prizes, onStart, disabled, winningIndex }: StartScreenProps) {
  const { AnimatedDiv, AnimatedH1, AnimatePresence } = useAnimation();
  const [expandedPrize, setExpandedPrize] = useState<string | null>(null);
  const { theme } = useTheme();

  // Determine if title should use gradient text or solid color
  const titleGradient = theme.gradients.titleGradient || theme.gradients.buttonPrimary;
  const isGradient = titleGradient.includes('gradient');

  return (
    <AnimatedDiv
      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Title - using theme */}
      <AnimatedH1
        key={titleGradient}
        className="text-4xl font-extrabold mb-6 text-center"
        style={{
          ...(isGradient
            ? {
                background: titleGradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }
            : {
                color: titleGradient,
              }),
          fontFamily: theme.typography.fontFamily.display || theme.typography.fontFamily.primary,
        }}
        initial={{ scale: 0, rotate: -5 }}
        animate={{
          scale: 1,
          rotate: 0,
        }}
        transition={{
          duration: 0.25,
          delay: 0.1,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        Plinko Popup
      </AnimatedH1>

      {/* Prize list - using theme component styles */}
      <AnimatedDiv
        className="p-4 mb-8 w-full max-w-md"
        style={{
          background: theme.components.card.background || theme.colors.surface.primary,
          /* RN-compatible: removed boxShadow, using border for definition */
          border: theme.components.card.border || `1px solid ${theme.colors.border.default}`,
          borderRadius: theme.components.card.borderRadius || theme.borderRadius.card,
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
            const prizeType = prize.type;
            const isPurchaseOffer = prizeType === 'purchase';
            const prizeReward = prize.freeReward;
            const rewardCount = prizeReward
              ? [
                  prizeReward.sc,
                  prizeReward.gc,
                  prizeReward.spins,
                  prizeReward.xp,
                  prizeReward.randomReward,
                ].filter(Boolean).length
              : 0;
            const isCombo = rewardCount >= 2 && !isPurchaseOffer;
            const isExpanded = expandedPrize === prize.id;

            // Display text logic
            let displayText: string;
            if (isPurchaseOffer) {
              displayText = '200% Special Offer';
            } else if (isCombo) {
              displayText = prize.label || '';
            } else {
              displayText = getSlotDisplayText(prize, abbreviateNumber, true) || prize.label || '';
            }

            return (
              <AnimatedDiv
                key={prize.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{
                  scale: 1.02,
                  transition: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 17,
                  },
                }}
                transition={{
                  duration: 0.3,
                  delay: 0.3 + index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div
                  className="flex items-center justify-between text-sm px-2 py-1"
                  style={{
                    background: `linear-gradient(90deg, ${getPrizeThemeColorWithOpacity(prize, theme, 0.15)} 0%, transparent 100%)`,
                    borderLeft: `2px solid ${getPrizeThemeColor(prize, theme)}`,
                    borderRadius: theme.borderRadius.sm,
                    cursor: isCombo ? 'pointer' : 'default',
                    position: 'relative',
                  }}
                  onClick={() => isCombo && setExpandedPrize(isExpanded ? null : prize.id)}
                >
                  {winningIndex === index && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '-6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#EF4444',
                        border: '1px solid #ffffff',
                        /* RN-compatible: removed boxShadow glow */
                        zIndex: 10,
                      }}
                    />
                  )}
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
                  <span className="font-semibold" style={{ color: theme.colors.accent.main }}>
                    {(prize.probability * 100).toFixed(0)}%
                  </span>
                </div>
                <AnimatePresence>
                  {isCombo && isExpanded && (
                    <AnimatedDiv
                      className="text-xs px-2 py-2"
                      style={{
                        background: getPrizeThemeColorWithOpacity(prize, theme, 0.08),
                        marginLeft: '8px',
                        borderRadius: theme.borderRadius.sm,
                        color: theme.colors.text.secondary,
                      }}
                      initial={{
                        opacity: 0,
                        maxHeight: 0,
                        marginTop: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                      }}
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
                        ease: 'easeInOut',
                      }}
                    >
                      {prizeReward?.sc && <div>• Free SC: {abbreviateNumber(prizeReward.sc)}</div>}
                      {prizeReward?.gc && <div>• GC: {abbreviateNumber(prizeReward.gc)}</div>}
                      {prizeReward?.spins && <div>• Free Spins: {prizeReward.spins}</div>}
                      {prizeReward?.xp && (
                        <div>
                          • {prizeReward.xp.config.name}: {abbreviateNumber(prizeReward.xp.amount)}
                        </div>
                      )}
                      {prizeReward?.randomReward && <div>• Bronze Wheel</div>}
                    </AnimatedDiv>
                  )}
                </AnimatePresence>
              </AnimatedDiv>
            );
          })}
        </div>
      </AnimatedDiv>

      {/* Play button */}
      <ThemedButton
        onClick={onStart}
        disabled={disabled}
        entranceAnimation="hero"
  delay={0.24}
        testId="drop-ball-button"
        className="min-w-[120px] h-14 text-lg"
      >
        Drop Ball
      </ThemedButton>
    </AnimatedDiv>
  );
}
