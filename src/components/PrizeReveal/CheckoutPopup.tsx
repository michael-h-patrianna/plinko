/**
 * Fake checkout popup for purchase offers
 * Simulates checkout flow
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '../../theme';
import { ThemedButton } from '../ThemedButton';

interface CheckoutPopupProps {
  isOpen: boolean;
  price: string;
  offerTitle: string;
  onClose: () => void;
  onPurchase: () => void;
}

export function CheckoutPopup({ isOpen, price, offerTitle, onClose, onPurchase }: CheckoutPopupProps) {
  const { theme } = useTheme();
  const [isPurchasing, setIsPurchasing] = useState(false);

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
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center p-6"

          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="relative rounded-xl p-6 max-w-sm w-full"
            style={{
              background: `linear-gradient(135deg, rgba(30,30,48,0.98) 0%, rgba(16,15,29,1) 100%)`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 10px 30px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.1)`,
              border: `1px solid rgba(148,163,184,0.3)`,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 transition-colors"
              style={{
                color: theme.colors.text.tertiary,
                fontSize: '24px',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.text.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.text.tertiary}
            >
              ×
            </button>

            {/* Checkout header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>Checkout</h3>
              <p className="text-sm" style={{ color: theme.colors.text.tertiary }}>{offerTitle}</p>
            </div>

            {/* Price display */}
            <div
              className="p-4 rounded-lg mb-6 text-center"
              style={{
                background: `${theme.colors.status.success}1a`,
                border: `1px solid ${theme.colors.status.success}4d`,
              }}
            >
              <div className="text-sm mb-1" style={{ color: theme.colors.text.tertiary }}>Total</div>
              <div className="text-4xl font-bold" style={{ color: theme.colors.text.primary }}>{price}</div>
            </div>

            {/* Fake payment info */}
            <div className="space-y-3 mb-6">
              <div
                className="p-3 rounded-lg flex items-center gap-3"
                style={{
                  background: `${theme.colors.surface.elevated}33`,
                  border: `1px solid ${theme.colors.border.light}33`,
                }}
              >
                <div className="text-2xl">💳</div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>Card ending in 4242</div>
                  <div className="text-xs" style={{ color: theme.colors.text.tertiary }}>Expires 12/25</div>
                </div>
              </div>
            </div>

            {/* Purchase button */}
            <ThemedButton
              onClick={handlePurchase}
              disabled={isPurchasing}
              delay={0.2}
              className="w-full"
            >
              {isPurchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
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

            <p className="text-xs text-center mt-4" style={{ color: theme.colors.text.disabled }}>
              This is a demo checkout. No actual payment will be processed.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
