/**
 * Purchase offer reveal view with premium choreographed animations
 *
 * Features sophisticated orchestrated entrance sequence for purchase flow:
 * - 120% EXTRA badge: Elastic pop with scale overshoot (0s, 0.5s duration)
 * - Sparkles: Enhanced decorative particles with scale pop (0.1s, 2s duration)
 * - Special Offer title: Diagonal swoosh entrance with elastic bounce (0.25s, 0.5s duration)
 * - Rewards container: Opposite diagonal swoosh (0.4s, 0.5s duration)
 * - Individual rewards: Enhanced pop with anticipation (0.5s+, 70ms stagger)
 * - Additional benefits: Subtle fade for secondary content (0.8s, 0.4s duration)
 * - Purchase button: Elastic hero entrance emphasizing CTA (0.9s, 0.7s duration)
 * - Limited time text: Quick fade for urgency (1.1s, 0.3s duration)
 *
 * All animations are cross-platform safe (transforms + opacity only, no blur/filters/shadows)
 * Overlapping animations create premium, sophisticated feel (~1.2-1.5s total sequence)
 * Personality is exciting but refined - premium value proposition vs purely celebratory
 *
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
import { useAppConfig } from '@config/AppConfigContext';

interface PurchaseOfferViewProps {
  prize: Prize;
  onClaim: () => void;
  canClaim: boolean;
}

export function PurchaseOfferView({ prize, onClaim, canClaim }: PurchaseOfferViewProps) {
  const { AnimatedDiv, AnimatedH2, AnimatedP } = useAnimation();
  const { theme } = useTheme();
  const { performance } = useAppConfig();
  const [showCheckout, setShowCheckout] = useState(false);

  // Disable complex animations in power-saving mode
  const isPowerSaving = performance.mode === 'power-saving';

  const offer = prize.purchaseOffer;
  if (!offer) return null;

  // Extract price from offer description or default
  const priceMatch = offer.description?.match(/\$[\d.]+/) ||
    offer.title.match(/\$[\d.]+/) || ['$29.99'];
  const price = priceMatch[0];

  // Premium choreographed timing - sophisticated overlapping sequence for purchase flow
  const timing = {
    badge: 0,                    // 120% EXTRA badge pops in immediately with elastic bounce
    sparkles: 0.1,               // Sparkles start slightly after badge for layered effect
    sparkleStagger: 80,          // Tight 80ms stagger for rapid sparkle burst (ms)
    title: 0.25,                 // Title swooshes in while badge still settling
    rewardsContainer: 0.4,       // Container swooshes in while title animating (overlap)
    firstReward: 0.5,            // First reward item pops during container entrance
    rewardStagger: 70,           // Tight 70ms stagger for rapid-fire reward reveals (ms)
    benefits: 0.8,               // Benefits fade in as rewards complete
    purchaseButton: 0.9,         // CTA appears with prominent hero entrance
    limitedTime: 1.1,            // Urgency text appears near end for time pressure
  };

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
          {/* "120% EXTRA" Badge - premium seal entrance with elastic pop (simplified in power-saving mode) */}
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
            initial={isPowerSaving ? { opacity: 0 } : { scale: 0.8, y: -10, rotate: -3 }}
            animate={
              isPowerSaving
                ? { opacity: 1 }
                : {
                    scale: [0.8, 1.15, 0.95, 1],
                    y: [-10, 5, -2, 0],
                    rotate: [-3, 2, -1, 0],
                    opacity: [0.3, 1, 1, 1],
                  }
            }
            transition={
              isPowerSaving
                ? { duration: 0.2, delay: 0, ease: 'easeOut' }
                : {
                    duration: 0.5,
                    delay: timing.badge,
                    times: [0, 0.5, 0.75, 1],
                    ease: [0.34, 1.56, 0.64, 1], // Elastic bounce
                  }
            }
          >
            120% EXTRA
          </AnimatedDiv>

          {/* Sparkles for offer - ONLY render in non-power-saving mode to avoid CPU/GPU cost */}
          {!isPowerSaving &&
            Array.from({ length: 4 }).map((_, i) => {
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
                  initial={{ x: 0, y: 0, scale: 0 }}
                  animate={{
                    x: offsetX,
                    y: [-80, -100],
                    scale: [0, 1.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    delay: timing.sparkles + (i * timing.sparkleStagger) / 1000,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              );
            })}

          <div role="status" aria-live="polite" className="text-center">
            {/* Special Offer header - diagonal swoosh entrance with premium feel (simplified in power-saving mode) */}
            <AnimatedH2
              className="text-3xl font-extrabold mb-6"
              style={{
                color: theme.colors.text.primary,
              }}
              initial={isPowerSaving ? { opacity: 0 } : { x: -30, y: 30, scale: 0.9, rotate: 3, opacity: 0.5 }}
              animate={isPowerSaving ? { opacity: 1 } : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
              transition={
                isPowerSaving
                  ? { duration: 0.2, delay: 0.1, ease: 'easeOut' }
                  : {
                      duration: 0.5,
                      delay: timing.title,
                      ease: [0.34, 1.56, 0.64, 1], // Elastic bounce
                    }
              }
            >
              {offer.title}
            </AnimatedH2>

            {/* Reward grid (offer contents) */}
            {rewardItems.length > 0 && (
              <>
                <AnimatedDiv
                  className="flex flex-wrap gap-3 justify-center my-6"
                  initial={isPowerSaving ? { opacity: 0 } : { x: 20, y: 30, scale: 0.95, rotate: -2, opacity: 0.5 }}
                  animate={isPowerSaving ? { opacity: 1 } : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
                  transition={
                    isPowerSaving
                      ? { duration: 0.2, delay: 0.2, ease: 'easeOut' }
                      : {
                          duration: 0.5,
                          delay: timing.rewardsContainer,
                          ease: [0.34, 1.56, 0.64, 1], // Elastic bounce
                        }
                  }
                >
                  {rewardItems.map((item, index) => (
                    <div key={`${item.type}-${index}`} style={{ width: '120px' }}>
                      <RewardItem
                        {...item}
                        delay={timing.firstReward + (index * timing.rewardStagger) / 1000}
                        index={index}
                        totalCount={rewardItems.length}
                      />
                    </div>
                  ))}
                </AnimatedDiv>

                {/* Additional benefits - subtle fade for secondary content (simplified in power-saving mode) */}
                <AnimatedDiv
                  className="text-center mb-6"
                  initial={isPowerSaving ? { opacity: 0 } : { y: 15, opacity: 0.3 }}
                  animate={isPowerSaving ? { opacity: 1 } : { y: 0, opacity: 1 }}
                  transition={
                    isPowerSaving
                      ? { duration: 0.2, delay: 0.3, ease: 'easeOut' }
                      : {
                          duration: 0.4,
                          delay: timing.benefits,
                          ease: [0.22, 1, 0.36, 1], // Smooth ease out
                        }
                  }
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

            {/* Purchase button with price - prominent elastic hero entrance for CTA */}
            <ThemedButton
              onClick={handlePurchaseClick}
              disabled={!canClaim}
              delay={timing.purchaseButton}
              entranceAnimation="hero"
              className="w-full min-w-[120px] h-14 text-lg"
              testId="claim-prize-button"
            >
              {price}
            </ThemedButton>

            {/* Limited time text - quick fade for urgency (simplified in power-saving mode) */}
            <AnimatedP
              className="text-slate-400 text-xs mt-3"
              initial={isPowerSaving ? { opacity: 0 } : { y: 5, opacity: 0.3 }}
              animate={isPowerSaving ? { opacity: 1 } : { y: 0, opacity: 1 }}
              transition={
                isPowerSaving
                  ? { duration: 0.2, delay: 0.4, ease: 'easeOut' }
                  : {
                      duration: 0.3,
                      delay: timing.limitedTime,
                      ease: [0.22, 1, 0.36, 1], // Smooth ease out
                    }
              }
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
