/**
 * Start screen with game title and drop button
 * Staggered entrance animation for polished reveal
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PrizeConfig } from '../game/types';
import { getSlotDisplayText } from '../game/prizeTypes';
import { abbreviateNumber } from '../utils/formatNumber';

interface StartScreenProps {
  prizes: PrizeConfig[];
  onStart: () => void;
  disabled: boolean;
}

export function StartScreen({ prizes, onStart, disabled }: StartScreenProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [expandedPrize, setExpandedPrize] = useState<string | null>(null);

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Title - first element */}
      <motion.h1
        className="text-4xl font-extrabold mb-6 text-center"
        style={{
          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.6)) drop-shadow(0 4px 12px rgba(0,0,0,0.9))',
        }}
        initial={{ scale: 0, rotate: -5 }}
        animate={{
          scale: 1,
          rotate: 0,
        }}
        transition={{
          duration: 0.6,
          delay: 0.1,
          ease: [0.34, 1.56, 0.64, 1]
        }}
      >
        Plinko Popup
      </motion.h1>

      {/* Prize list - second element with stagger */}
      <motion.div
        className="rounded-lg p-4 mb-8 w-full"
        style={{
          maxWidth: 'calc(100% - 40px)',
          background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid rgba(71,85,105,0.4)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <h2 className="text-lg font-semibold text-slate-200 mb-3 text-center">
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
              displayText = prize.label;
            } else {
              displayText = getSlotDisplayText(prize as any, abbreviateNumber, true) || prize.label;
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
                  className="flex items-center justify-between text-sm px-2 py-1 rounded"
                  style={{
                    background: `linear-gradient(90deg, ${prize.color}15 0%, transparent 100%)`,
                    borderLeft: `2px solid ${prize.color}`,
                    cursor: isCombo ? 'pointer' : 'default',
                  }}
                  onClick={() => isCombo && setExpandedPrize(isExpanded ? null : prize.id)}
                >
                  <span className="text-slate-200 font-medium flex items-center gap-1">
                    {displayText}
                    {isCombo && <span className="text-xs text-slate-400">{isExpanded ? '▼' : '▶'}</span>}
                  </span>
                  <span className="text-amber-400 font-semibold">
                    {(prize.probability * 100).toFixed(0)}%
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {isCombo && isExpanded && (
                    <motion.div
                      className="text-xs text-slate-300 px-2 py-2 rounded overflow-hidden"
                      style={{
                        background: `${prize.color}08`,
                        marginLeft: '8px',
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
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      {getSlotDisplayText(prize as any, abbreviateNumber, true)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Button - final element with slight delay and hover anticipation */}
      <motion.button
        onClick={onStart}
        disabled={disabled}
        className="btn-primary"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          opacity: { duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] },
        }}
        data-testid="drop-ball-button"
      >
        Drop Ball
      </motion.button>
    </motion.div>
  );
}
