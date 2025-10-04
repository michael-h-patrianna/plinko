/**
 * Free reward reveal view
 * Celebratory with grid-based reward display
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Prize } from '../../game/prizeTypes';
import { RewardItem } from './RewardItem';

interface FreeRewardViewProps {
  prize: Prize;
  onClaim: () => void;
  canClaim: boolean;
}

export function FreeRewardView({ prize, onClaim, canClaim }: FreeRewardViewProps) {
  const claimButtonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (canClaim && claimButtonRef.current) {
      claimButtonRef.current.focus();
    }
  }, [canClaim]);

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
  if (rewards.xp) rewardItems.push({ type: 'xp', amount: rewards.xp.amount, xpConfig: rewards.xp.config });
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
          background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)',
          border: `2px solid ${prize.slotColor}88`,
        }}
        initial={{ scale: 0, rotate: -10, opacity: 0 }}
        animate={{
          scale: [0, 1.1, 1],
          rotate: [-10, 5, 0],
          opacity: [0, 1, 1],
        }}
        transition={{
          duration: 0.7,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        <div role="status" aria-live="polite" className="text-center">
          {/* Congratulations header */}
          <motion.h2
            className="text-3xl font-extrabold text-white mb-4"
            style={{
              textShadow: `
                0 0 30px ${prize.slotColor}99,
                0 3px 10px rgba(0,0,0,0.9)
              `,
              background: `linear-gradient(135deg, #fef3c7 0%, ${prize.slotColor} 50%, ${prize.slotColor}dd 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            🎉 Congratulations!
          </motion.h2>

          {/* Prize title */}
          <motion.div
            className="text-xl font-bold text-white mb-6"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {prize.title}
          </motion.div>

          {/* Reward grid */}
          <motion.div
            className="flex flex-wrap gap-3 justify-center my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            {rewardItems.map((item, index) => (
              <RewardItem
                key={`${item.type}-${index}`}
                {...item}
                delay={0.7 + index * 0.1}
              />
            ))}
          </motion.div>

          {/* Description if available */}
          {prize.description && (
            <motion.p
              className="text-slate-300 mb-6 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1 }}
            >
              {prize.description}
            </motion.p>
          )}

          {/* Claim button */}
          <motion.button
            ref={claimButtonRef}
            onClick={onClaim}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            disabled={!canClaim}
            className="w-full px-6 py-4 text-white font-bold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: !canClaim
                ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              boxShadow: !canClaim
                ? '0 4px 12px rgba(0,0,0,0.4)'
                : isPressed
                ? `
                  0 3px 12px rgba(16,185,129,0.25),
                  0 2px 8px rgba(59,130,246,0.25),
                  0 2px 6px rgba(0,0,0,0.4),
                  inset 0 2px 4px rgba(0,0,0,0.3)
                `
                : `
                  0 10px 30px rgba(16,185,129,0.4),
                  0 5px 20px rgba(59,130,246,0.4),
                  0 4px 12px rgba(0,0,0,0.5),
                  inset 0 2px 4px rgba(255,255,255,0.2),
                  inset 0 -2px 4px rgba(0,0,0,0.3)
                `,
              border: !canClaim
                ? '1px solid rgba(71,85,105,0.3)'
                : '1px solid rgba(16,185,129,0.6)',
              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
            }}
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: isPressed && canClaim ? 0.95 : 1,
            }}
            whileHover={
              canClaim
                ? {
                    scale: 1.05,
                    boxShadow: `
                      0 12px 35px rgba(16,185,129,0.5),
                      0 6px 24px rgba(59,130,246,0.5),
                      0 5px 15px rgba(0,0,0,0.6)
                    `,
                  }
                : {}
            }
            transition={{
              y: { duration: 0.4, delay: 1.2 },
              opacity: { duration: 0.4, delay: 1.2 },
              scale: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] },
            }}
          >
            Claim Prize
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
