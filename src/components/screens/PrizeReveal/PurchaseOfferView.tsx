/**
 * Purchase offer reveal view with special deal styling
 * Displays rewards with ribbon banner and price button, opens checkout popup
 * Uses PopupOverlay for consistent semi-transparent background
 * @param prize - Prize configuration with purchase offer details
 * @param onClaim - Callback when purchase completes
 * @param canClaim - Whether the purchase button should be enabled
 */

import { useState } from 'react';
import type { Prize } from '@game/prizeTypes';
import { useTheme } from '../../../theme';
import { ThemedButton } from '../../controls/ThemedButton';
import { CheckoutPopup } from './CheckoutPopup';
import { RewardItem } from './RewardItem';
import { useAnimation } from '@theme/animationDrivers/useAnimation';
import { PopupOverlay } from '../../layout/PopupOverlay';

interface PurchaseOfferViewProps {
  prize: Prize;
  onClaim: () => void;
  canClaim: boolean;
}

export function PurchaseOfferView({ prize, onClaim, canClaim }: PurchaseOfferViewProps) {
  const { AnimatedDiv, AnimatedH2, AnimatedP } = useAnimation();
  const { theme } = useTheme();
  const [showCheckout, setShowCheckout] = useState(false);

  const offer = prize.purchaseOffer;
  if (!offer) return null;

  // Extract price from offer description or default
  const priceMatch = offer.description?.match(/\$[\d.]+/) ||
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
      <PopupOverlay zIndex={theme.zIndex[40]} testId="purchase-offer-overlay">
        {/* Content container - no card background, but keep decorative elements */}
        <div className="max-w-md w-full overflow-visible relative">
          {/* "120% EXTRA" Badge - positioned above title */}
          <AnimatedDiv
            className="font-bold uppercase whitespace-nowrap mx-auto mb-4 w-fit"
            style={{
              color: theme.colors.primary.contrast,
              background: `linear-gradient(135deg, ${theme.colors.status.error} 0%, ${theme.colors.status.error} 100%)`,
              /* RN-compatible: removed boxShadow and textShadow */
              padding: '6px 24px',
              fontSize: '12px',
              borderRadius: '20px',
              letterSpacing: '1px',
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            120% EXTRA
          </AnimatedDiv>

          {/* Sparkles for offer - Cross-platform: linear gradient instead of radial */}
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
              <AnimatedDiv
                key={`sparkle-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: '8px',
                  height: '8px',
                  background: `linear-gradient(135deg, ${color} 0%, ${color}aa 50%, transparent 100%)`,
                  /* RN-compatible: removed boxShadow glow */
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
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            );
          })}

          <div role="status" aria-live="polite" className="text-center">
            {/* Special Offer header - aligned with other views */}
            <AnimatedH2
              className="text-3xl font-extrabold mb-6"
              style={{
                color: theme.colors.text.primary,
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.3 }}
            >
              {offer.title}
            </AnimatedH2>

            {/* Reward grid (offer contents) */}
            {rewardItems.length > 0 && (
              <>
                <AnimatedDiv
                  className="flex flex-wrap gap-3 justify-center my-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: 0.5 }}
                >
                  {rewardItems.map((item, index) => (
                    <div key={`${item.type}-${index}`} style={{ width: '120px' }}>
                      <RewardItem
                        {...item}
                        delay={0.6 + index * 0.1}
                        index={index}
                        totalCount={rewardItems.length}
                      />
                    </div>
                  ))}
                </AnimatedDiv>

                {/* Additional benefits */}
                <AnimatedDiv
                  className="text-center mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.8 }}
                >
                  <div
                    className="text-sm font-medium"
                    style={{
                      color: theme.colors.text.secondary,
                      lineHeight: '1.6',
                    }}
                  >
                    + Live Chat Support
                    <br />
                    + Exclusive Gold Coin Games
                  </div>
                </AnimatedDiv>
              </>
            )}

            {/* Purchase button with price */}
            <ThemedButton
              onClick={handlePurchaseClick}
              disabled={!canClaim}
              delay={0.5}
              className="w-full min-w-[120px] h-14 text-lg"
              testId="claim-prize-button"
            >
              {price}
            </ThemedButton>

            <AnimatedP
              className="text-slate-400 text-xs mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: 1.4 }}
            >
              Limited time offer - claim it now!
            </AnimatedP>
          </div>
        </div>
      </PopupOverlay>

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
