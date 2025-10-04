/**
 * Prize reveal overlay with confetti and claim button
 */

import { useEffect, useRef } from 'react';
import type { PrizeConfig } from '../game/types';

interface PrizeRevealProps {
  prize: PrizeConfig;
  onClaim: () => void;
  canClaim: boolean;
}

export function PrizeReveal({ prize, onClaim, canClaim }: PrizeRevealProps) {
  const claimButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus claim button when revealed
  useEffect(() => {
    if (canClaim && claimButtonRef.current) {
      claimButtonRef.current.focus();
    }
  }, [canClaim]);

  return (
    <div className="absolute inset-0 bg-slate-900/90 z-40 flex items-center justify-center p-6">
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-sm shadow-2xl border-4 border-yellow-400 animate-[fadeIn_0.5s_ease-out]"
        style={{
          animation: 'fadeIn 0.5s ease-out, scaleIn 0.5s ease-out'
        }}
      >
        {/* Confetti effect (CSS-based) */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping opacity-75" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.1s' }} />
        <div className="absolute -bottom-3 -left-3 w-7 h-7 bg-blue-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.2s' }} />
        <div className="absolute -bottom-4 -right-4 w-5 h-5 bg-emerald-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.3s' }} />

        <div
          role="status"
          aria-live="polite"
          className="text-center"
        >
          <h2 className="text-3xl font-extrabold text-white mb-4">
            🎉 Congratulations!
          </h2>

          <div
            className="my-6 p-6 rounded-xl"
            style={{ backgroundColor: prize.color }}
          >
            <div className="text-2xl font-bold text-white mb-2">
              {prize.label}
            </div>
            <div className="text-sm text-white/90">
              {prize.description}
            </div>
          </div>

          <p className="text-slate-300 mb-6" aria-live="polite">
            Congratulations! You won {prize.label}.
          </p>

          <button
            ref={claimButtonRef}
            onClick={onClaim}
            disabled={!canClaim}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:from-emerald-600 hover:to-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="claim-prize-button"
          >
            Claim Prize
          </button>
        </div>
      </div>
    </div>
  );
}
