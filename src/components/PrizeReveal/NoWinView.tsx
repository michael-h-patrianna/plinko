/**
 * No win result view
 * Subdued, encouraging, not celebratory
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Prize } from '../../game/prizeTypes';

interface NoWinViewProps {
  prize: Prize;
  onClaim: () => void;
  canClaim: boolean;
}

export function NoWinView({ prize, onClaim, canClaim }: NoWinViewProps) {
  const claimButtonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (canClaim && claimButtonRef.current) {
      claimButtonRef.current.focus();
    }
  }, [canClaim]);

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Main card - subdued colors */}
      <motion.div
        className="relative rounded-2xl p-8 max-w-sm w-full"
        style={{
          background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
          border: '1px solid rgba(148,163,184,0.3)',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        <div role="status" aria-live="polite" className="text-center">
          {/* No celebration header - encouraging instead */}
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            😔
          </motion.div>

          <motion.h2
            className="text-2xl font-bold text-slate-300 mb-4"
            style={{
              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
            }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {prize.title}
          </motion.h2>

          {/* Encouraging message */}
          <motion.div
            className="my-6 p-4 rounded-lg"
            style={{
              background: 'rgba(71,85,105,0.2)',
              border: '1px solid rgba(148,163,184,0.2)',
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <p className="text-slate-300 text-base leading-relaxed">
              {prize.description || "Better luck next time!"}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Keep trying - your big win could be just around the corner!
            </p>
          </motion.div>

          {/* Try again button - different color scheme */}
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
                : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
              boxShadow: !canClaim
                ? '0 4px 12px rgba(0,0,0,0.4)'
                : isPressed
                ? `
                  0 2px 8px rgba(0,0,0,0.4),
                  inset 0 2px 4px rgba(0,0,0,0.3)
                `
                : `
                  0 8px 20px rgba(0,0,0,0.5),
                  0 4px 12px rgba(0,0,0,0.4),
                  inset 0 1px 2px rgba(255,255,255,0.1),
                  inset 0 -1px 2px rgba(0,0,0,0.3)
                `,
              border: '1px solid rgba(148,163,184,0.3)',
              textShadow: '0 2px 4px rgba(0,0,0,0.6)',
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
                    scale: 1.02,
                    boxShadow: `
                      0 10px 25px rgba(0,0,0,0.6),
                      0 5px 15px rgba(0,0,0,0.5)
                    `,
                  }
                : {}
            }
            transition={{
              y: { duration: 0.4, delay: 0.6 },
              opacity: { duration: 0.4, delay: 0.6 },
              scale: { duration: 0.15 },
            }}
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
