/**
 * Purchase offer reveal view
 * Similar to free rewards but with ribbon and price button
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Prize } from '../../game/prizeTypes';
import { RewardItem } from './RewardItem';
import { CheckoutPopup } from './CheckoutPopup';

interface PurchaseOfferViewProps {
  prize: Prize;
  onClaim: () => void;
  canClaim: boolean;
}

export function PurchaseOfferView({ prize, onClaim, canClaim }: PurchaseOfferViewProps) {
  const claimButtonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (canClaim && claimButtonRef.current) {
      claimButtonRef.current.focus();
    }
  }, [canClaim]);

  const offer = prize.purchaseOffer;
  if (!offer) return null;

  // Extract price from offer description or default
  const priceMatch = offer.description?.match(/\$[\d.]+/) || offer.title.match(/\$[\d.]+/) || ['$29.99'];
  const price = priceMatch[0];

  const handlePurchaseClick = () => {
    setShowCheckout(true);
  };

  const handlePurchaseComplete = () => {
    setShowCheckout(false);
    onClaim();
  };

  // Build reward items if the offer contains free rewards
  const rewards = prize.freeReward;
  const rewardItems: Array<{
    type: 'gc' | 'sc' | 'spins' | 'xp' | 'randomReward';
    amount?: number;
    xpConfig?: { icon: string; name: string };
  }> = [];

  if (rewards) {
    if (rewards.sc) rewardItems.push({ type: 'sc', amount: rewards.sc });
    if (rewards.gc) rewardItems.push({ type: 'gc', amount: rewards.gc });
    if (rewards.spins) rewardItems.push({ type: 'spins', amount: rewards.spins });
    if (rewards.xp) rewardItems.push({ type: 'xp', amount: rewards.xp.amount, xpConfig: rewards.xp.config });
    if (rewards.randomReward) rewardItems.push({ type: 'randomReward' });
  }

  return (
    <>
      <motion.div
        className="absolute inset-0 z-40 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Main card */}
        <motion.div
          className="relative rounded-2xl p-8 max-w-md w-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)',
            border: '2px solid rgba(239,68,68,0.6)',
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
          {/* "200% SPECIAL DEAL" Ribbon */}
          <motion.div
            className="absolute -top-1 -right-8 font-bold text-white text-sm rotate-45 z-10"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              boxShadow: `
                0 4px 12px rgba(185,28,28,0.6),
                inset 0 1px 2px rgba(255,255,255,0.3),
                inset 0 -1px 2px rgba(0,0,0,0.3)
              `,
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              padding: '8px 48px',
            }}
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            200% SPECIAL DEAL
          </motion.div>

          {/* Sparkles for offer */}
          {Array.from({ length: 4 }).map((_, i) => {
            const colors = ['#fbbf24', '#f97316', '#dc2626', '#fb923c'];
            const color = colors[i % colors.length];
            const offsetX = [-50, -30, 30, 50][i];

            return (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: '8px',
                  height: '8px',
                  background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                  boxShadow: `0 0 12px ${color}`,
                  left: '50%',
                  top: '20%',
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: offsetX,
                  y: [-80, -100],
                  opacity: [0, 1, 0.6, 0],
                  scale: [0, 1, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            );
          })}

          <div role="status" aria-live="polite" className="text-center">
            {/* Special Offer header */}
            <motion.h2
              className="text-3xl font-extrabold text-white mb-2"
              style={{
                textShadow: `
                  0 0 30px rgba(239,68,68,0.8),
                  0 3px 10px rgba(0,0,0,0.9)
                `,
                background: 'linear-gradient(135deg, #fef3c7 0%, #fb923c 50%, #dc2626 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              ⭐ Special Offer!
            </motion.h2>

            {/* Reward grid (offer contents) */}
            {rewardItems.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-3 justify-center my-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                {rewardItems.map((item, index) => (
                  <RewardItem
                    key={`${item.type}-${index}`}
                    {...item}
                    delay={0.6 + index * 0.1}
                  />
                ))}
              </motion.div>
            )}

            {/* Purchase button with price */}
            <motion.button
              ref={claimButtonRef}
              onClick={handlePurchaseClick}
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
                  : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                boxShadow: !canClaim
                  ? '0 4px 12px rgba(0,0,0,0.4)'
                  : isPressed
                  ? `
                    0 3px 12px rgba(220,38,38,0.4),
                    0 2px 8px rgba(185,28,28,0.4),
                    0 2px 6px rgba(0,0,0,0.4),
                    inset 0 2px 4px rgba(0,0,0,0.3)
                  `
                  : `
                    0 10px 30px rgba(220,38,38,0.6),
                    0 5px 20px rgba(185,28,28,0.5),
                    0 4px 12px rgba(0,0,0,0.5),
                    inset 0 2px 4px rgba(255,255,255,0.2),
                    inset 0 -2px 4px rgba(0,0,0,0.3)
                  `,
                border: !canClaim
                  ? '1px solid rgba(71,85,105,0.3)'
                  : '1px solid rgba(220,38,38,0.8)',
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
                        0 12px 35px rgba(220,38,38,0.7),
                        0 6px 24px rgba(185,28,28,0.6),
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
              {price}
            </motion.button>

            <motion.p
              className="text-slate-400 text-xs mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.4 }}
            >
              Limited time offer - claim it now!
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Checkout popup */}
      <CheckoutPopup
        isOpen={showCheckout}
        price={price}
        offerTitle={offer.title}
        onClose={() => setShowCheckout(false)}
        onPurchase={handlePurchaseComplete}
      />
    </>
  );
}
