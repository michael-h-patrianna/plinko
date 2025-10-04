/**
 * Free reward reveal view
 * Celebratory with grid-based reward display
 */

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
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
          background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid rgba(71,85,105,0.4)',
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
          {/* Congratulations header with gradient and glow */}
          <motion.h2
            className="text-4xl font-extrabold mb-4 relative inline-block"
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
              delay: 0.3,
              ease: [0.34, 1.56, 0.64, 1]
            }}
          >
            You won!
          </motion.h2>



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
            disabled={!canClaim}
            className="w-full btn-primary"
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            transition={{
              y: { duration: 0.4, delay: 1.2 },
              opacity: { duration: 0.4, delay: 1.2 },
            }}
          >
            Claim Prize
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
