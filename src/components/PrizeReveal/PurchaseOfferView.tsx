/**
 * Purchase offer reveal view with special deal styling
 * Displays rewards with ribbon banner and price button, opens checkout popup
 * @param prize - Prize configuration with purchase offer details
 * @param onClaim - Callback when purchase completes
 * @param canClaim - Whether the purchase button should be enabled
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Prize } from '../../game/prizeTypes';
import { useTheme } from '../../theme';
import { ThemedButton } from '../ThemedButton';
import { CheckoutPopup } from './CheckoutPopup';
import { RewardItem } from './RewardItem';

interface PurchaseOfferViewProps {
  prize: Prize;
  onClaim: () => void;
  canClaim: boolean;
}

export function PurchaseOfferView({ prize, onClaim, canClaim }: PurchaseOfferViewProps) {
  const { theme } = useTheme();
  const [showCheckout, setShowCheckout] = useState(false);

  const offer = prize.purchaseOffer;
  if (!offer) return null;

  // Extract price from offer description or default
  const priceMatch = offer.description.match(/\$[\d.]+/) ||
    offer.title.match(/\$[\d.]+/) || ['$29.99'];
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
    if (rewards.xp)
      rewardItems.push({ type: 'xp', amount: rewards.xp.amount, xpConfig: rewards.xp.config });
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
          {/* "200% SPECIAL DEAL" Ribbon */}
          <motion.div
            className="absolute -top-1 -right-8 font-bold text-sm rotate-45 z-10"
            style={{
              color: theme.colors.primary.contrast,
              background: `linear-gradient(135deg, ${theme.colors.status.error} 0%, ${theme.colors.status.error} 100%)`,
              boxShadow: `0 4px 12px rgba(185,28,28,0.6), inset 0 1px 2px ${theme.colors.text.inverse}4d, inset 0 -1px 2px ${theme.colors.shadows.default}4d`,
              textShadow: `0 2px 4px ${theme.colors.shadows.default}cc`,
              padding: '8px 48px',
            }}
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            200% SPECIAL DEAL
          </motion.div>

          {/* Sparkles for offer */}
          {Array.from({ length: 4 }).map((_, i) => {
            const colors = [
              theme.colors.game.ball.primary,
              theme.colors.status.warning,
              theme.colors.status.error,
              theme.colors.status.warning,
            ];
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
              className="text-3xl font-extrabold mb-2"
              style={{
                textShadow: `0 0 30px ${theme.colors.status.error}cc, 0 3px 10px ${theme.colors.shadows.default}e6`,
                background: `linear-gradient(135deg, ${theme.colors.text.primary} 0%, ${theme.colors.status.warning} 50%, ${theme.colors.status.error} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.3 }}
            >
              ⭐ Special Offer!
            </motion.h2>

            {/* Reward grid (offer contents) */}
            {rewardItems.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-3 justify-center my-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: 0.5 }}
              >
                {rewardItems.map((item, index) => (
                  <RewardItem
                    key={`${item.type}-${index}`}
                    {...item}
                    delay={0.6 + index * 0.1}
                    index={index}
                    totalCount={rewardItems.length}
                  />
                ))}
              </motion.div>
            )}

            {/* Purchase button with price */}
            <ThemedButton
              onClick={handlePurchaseClick}
              disabled={!canClaim}
              delay={0.5}
              className="w-full" style={{
            minWidth: '120px',
            height: '56px',
            fontSize: '18px',
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.colors.game.ball.primary} 0%, ${theme.colors.game.ball.secondary} 100%)`,
            border: `2px solid ${theme.colors.game.ball.highlight}80`,
            boxShadow: `0 4px 12px ${theme.colors.game.ball.primary}80, 0 0 30px ${theme.colors.game.ball.primary}50`,
          }}
            >
              {price}
            </ThemedButton>

            <motion.p
              className="text-slate-400 text-xs mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: 1.4 }}
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
