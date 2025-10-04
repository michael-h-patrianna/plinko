/**
 * Fake checkout popup for purchase offers
 * Simulates checkout flow
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface CheckoutPopupProps {
  isOpen: boolean;
  price: string;
  offerTitle: string;
  onClose: () => void;
  onPurchase: () => void;
}

export function CheckoutPopup({ isOpen, price, offerTitle, onClose, onPurchase }: CheckoutPopupProps) {
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
              background: 'linear-gradient(135deg, rgba(30,41,59,0.98) 0%, rgba(15,23,42,1) 100%)',
              boxShadow: `
                0 20px 60px rgba(0,0,0,0.9),
                0 10px 30px rgba(0,0,0,0.7),
                inset 0 1px 2px rgba(255,255,255,0.1)
              `,
              border: '1px solid rgba(148,163,184,0.3)',
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
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              style={{ fontSize: '24px', lineHeight: 1 }}
            >
              ×
            </button>

            {/* Checkout header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Checkout</h3>
              <p className="text-slate-400 text-sm">{offerTitle}</p>
            </div>

            {/* Price display */}
            <div
              className="p-4 rounded-lg mb-6 text-center"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              <div className="text-slate-400 text-sm mb-1">Total</div>
              <div className="text-4xl font-bold text-white">{price}</div>
            </div>

            {/* Fake payment info */}
            <div className="space-y-3 mb-6">
              <div
                className="p-3 rounded-lg flex items-center gap-3"
                style={{
                  background: 'rgba(71,85,105,0.2)',
                  border: '1px solid rgba(148,163,184,0.2)',
                }}
              >
                <div className="text-2xl">💳</div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">Card ending in 4242</div>
                  <div className="text-slate-400 text-xs">Expires 12/25</div>
                </div>
              </div>
            </div>

            {/* Purchase button */}
            <motion.button
              onClick={handlePurchase}
              disabled={isPurchasing}
              className="w-full btn-primary"
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
            </motion.button>

            <p className="text-slate-500 text-xs text-center mt-4">
              This is a demo checkout. No actual payment will be processed.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
