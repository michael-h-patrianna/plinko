/**
 * Checkout popup with premium professional orchestration
 *
 * Features sophisticated choreographed entrance sequence for checkout flow:
 * - Card container: Smooth scale with subtle anticipation (0s, 0.4s duration)
 * - Close button: Quick fade with subtle rotate (0.15s, 0.3s duration)
 * - Checkout header: Gentle slide down with fade (0.25s, 0.35s duration)
 * - Price display: Enhanced pop with importance (0.35s, 0.4s duration)
 * - Payment info card: Smooth slide-in from left (0.5s, 0.35s duration)
 * - Purchase button: Hero entrance emphasizing CTA (0.7s, ThemedButton hero)
 * - Disclaimer text: Quick fade for secondary info (0.85s, 0.25s duration)
 *
 * All animations are cross-platform safe (transforms + opacity only, no blur/filters/shadows)
 * Overlapping animations create smooth, confident, professional feel (~1.1s total sequence)
 * Personality is trustworthy and sophisticated - this is a payment flow, not a celebration
 *
 * Simulated checkout popup for purchase offers
 * Displays fake payment information and processes demo purchase with delay
 * Modal dialog with card background (appropriate for checkout flow)
 * @param isOpen - Whether the popup is currently visible
 * @param price - Price string to display (e.g., "$29.99")
 * @param offerTitle - Title of the offer being purchased
 * @param onClose - Callback to close the popup
 * @param onPurchase - Callback when purchase completes
 */

import { useState } from 'react';
import { useTheme } from '../../../theme';
import { ThemedButton } from '../../controls/ThemedButton';
import { useAnimationDriver } from '@theme/animationDrivers';
import { POPUP_ANIMATIONS } from '../../layout/popupAnimations';

interface CheckoutPopupProps {
  isOpen: boolean;
  price: string;
  offerTitle: string;
  onClose: () => void;
  onPurchase: () => void;
}

export function CheckoutPopup({
  isOpen,
  price,
  offerTitle,
  onClose,
  onPurchase,
}: CheckoutPopupProps) {
  const driver = useAnimationDriver();
const AnimatedDiv = driver.createAnimatedComponent('div');
const AnimatedButton = driver.createAnimatedComponent('button');
const AnimatedH3 = driver.createAnimatedComponent('h3');
const AnimatedP = driver.createAnimatedComponent('p');
const { AnimatePresence } = driver;

const { theme } = useTheme();
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Professional choreographed timing - smooth, confident sequence for checkout flow
  const timing = {
    cardEntrance: 0,         // Card establishes presence immediately
    closeButton: 0.15,       // Close button appears quickly (escape route)
    header: 0.25,            // Header establishes context
    priceDisplay: 0.35,      // Price is the hero moment (prominent)
    paymentCard: 0.5,        // Payment info builds trust
    purchaseButton: 0.7,     // CTA appears with confidence
    disclaimer: 0.85,        // Disclaimer is last (least important)
  };

  const handlePurchase = () => {
    setIsPurchasing(true);

    // Simulate purchase delay
    setTimeout(() => {
      onPurchase();
      setIsPurchasing(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <AnimatedDiv
          className="absolute inset-0 z-60 flex items-center justify-center p-6"
          style={{
            background: theme.colors.background.overlayDark || 'rgba(0, 0, 0, 0.8)',
          }}
          initial={POPUP_ANIMATIONS.entrance.initial}
          animate={POPUP_ANIMATIONS.entrance.animate}
          exit={POPUP_ANIMATIONS.exit.exit}
          transition={{
            duration: POPUP_ANIMATIONS.exit.duration,
            ease: POPUP_ANIMATIONS.exit.ease,
          }}
          onClick={onClose}
        >
          <AnimatedDiv
            className="relative rounded-xl p-6 max-w-sm w-full"
            style={{
              background: theme.gradients.backgroundCard || theme.components.modal.background,
              /* RN-compatible: removed boxShadow, using border for definition */
              border: `1px solid ${theme.colors.border.default}`,
              borderRadius: theme.components.modal.borderRadius,
            }}
            initial={{ scale: 0.9, y: 20, opacity: 0.5 }}
            animate={{
              scale: [0.9, 1.02, 1],
              y: [20, -2, 0],
              opacity: [0.5, 1, 1],
            }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{
              duration: 0.4,
              delay: timing.cardEntrance,
              times: [0, 0.6, 1],
              ease: [0.22, 1, 0.36, 1], // Smooth ease out
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Close button - quick fade with subtle rotate for presence */}
            <AnimatedButton
              onClick={onClose}
              className="absolute top-4 right-4 transition-colors"
              style={{
                color: theme.colors.text.tertiary,
                fontSize: '24px',
                lineHeight: 1,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
              initial={{ scale: 0.8, rotate: -90, opacity: 0.3 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: timing.closeButton,
                ease: [0.22, 1, 0.36, 1], // Smooth ease out
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = theme.colors.text.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.colors.text.tertiary)}
            >
              ×
            </AnimatedButton>

            {/* Checkout header - gentle slide down with fade for professional context */}
            <AnimatedDiv
              className="text-center mb-6"
              initial={{ y: -15, scale: 0.95, opacity: 0.5 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{
                duration: 0.35,
                delay: timing.header,
                ease: [0.22, 1, 0.36, 1], // Smooth ease out
              }}
            >
              <AnimatedH3
                className="text-2xl font-bold mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Checkout
              </AnimatedH3>
              <AnimatedP className="text-sm" style={{ color: theme.colors.text.tertiary }}>
                {offerTitle}
              </AnimatedP>
            </AnimatedDiv>

            {/* Price display - enhanced pop with importance (hero moment) */}
            <AnimatedDiv
              className="p-4 rounded-lg mb-6 text-center"
              style={{
                background: `${theme.colors.status.success}1a`,
                border: `1px solid ${theme.colors.status.success}4d`,
              }}
              initial={{ scale: 0.85, y: 15 }}
              animate={{
                scale: [0.85, 1.05, 1],
                y: 0,
                opacity: [0.3, 1, 1],
              }}
              transition={{
                duration: 0.4,
                delay: timing.priceDisplay,
                times: [0, 0.6, 1],
                ease: [0.34, 1.56, 0.64, 1], // Elastic bounce for importance
              }}
            >
              <div className="text-sm mb-1" style={{ color: theme.colors.text.tertiary }}>
                Total
              </div>
              <div className="text-4xl font-bold" style={{ color: theme.colors.text.primary }}>
                {price}
              </div>
            </AnimatedDiv>

            {/* Fake payment info - smooth slide-in from left for trust signal */}
            <AnimatedDiv
              className="space-y-3 mb-6"
              initial={{ x: -20, scale: 0.95, opacity: 0.5 }}
              animate={{ x: 0, scale: 1, opacity: 1 }}
              transition={{
                duration: 0.35,
                delay: timing.paymentCard,
                ease: [0.22, 1, 0.36, 1], // Smooth ease out
              }}
            >
              <div
                className="p-3 rounded-lg flex items-center gap-3"
                style={{
                  background: `${theme.colors.surface.elevated}33`,
                  border: `1px solid ${theme.colors.border.light}33`,
                }}
              >
                <div className="text-2xl">💳</div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>
                    Card ending in 4242
                  </div>
                  <div className="text-xs" style={{ color: theme.colors.text.tertiary }}>
                    Expires 12/25
                  </div>
                </div>
              </div>
            </AnimatedDiv>

            {/* Purchase button - hero entrance emphasizing CTA */}
            <ThemedButton
              onClick={handlePurchase}
              disabled={isPurchasing}
              delay={timing.purchaseButton}
              entranceAnimation="hero"
              className="w-full min-w-[120px] h-14 text-lg"
              testId="checkout-purchase-button"
            >
              {isPurchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <AnimatedDiv
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Processing...
                </span>
              ) : (
                `Purchase for ${price}`
              )}
            </ThemedButton>

            {/* Disclaimer text - quick fade for secondary info */}
            <AnimatedP
              className="text-xs text-center mt-4"
              style={{ color: theme.colors.text.disabled }}
              initial={{ y: 5, opacity: 0.3 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.25,
                delay: timing.disclaimer,
                ease: [0.22, 1, 0.36, 1], // Smooth ease out
              }}
            >
              This is a demo checkout. No actual payment will be processed.
            </AnimatedP>
          </AnimatedDiv>
        </AnimatedDiv>
      )}
    </AnimatePresence>
  );
}
