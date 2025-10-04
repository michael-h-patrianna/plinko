/**
 * No win result view
 * Subdued, encouraging, not celebratory
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Prize } from '../../game/prizeTypes';
import noWinImage from '../../assets/nowin.png';

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
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid rgba(71,85,105,0.4)',
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
          {/* No win image */}
          <motion.img
            src={noWinImage}
            alt="No Win"
            className="w-24 h-24 mx-auto mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          />

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

          {/* Try again button */}
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
              y: { duration: 0.4, delay: 0.6 },
              opacity: { duration: 0.4, delay: 0.6 },
            }}
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
