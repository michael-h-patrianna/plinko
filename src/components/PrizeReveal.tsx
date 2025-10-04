/**
 * Prize reveal overlay with confetti and claim button
 */

import { useEffect, useRef, useState } from 'react';
import type { PrizeConfig } from '../game/types';

interface PrizeRevealProps {
  prize: PrizeConfig;
  onClaim: () => void;
  canClaim: boolean;
}

export function PrizeReveal({ prize, onClaim, canClaim }: PrizeRevealProps) {
  const claimButtonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  // Auto-focus claim button when revealed
  useEffect(() => {
    if (canClaim && claimButtonRef.current) {
      claimButtonRef.current.focus();
    }
  }, [canClaim]);

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-6"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.98) 100%)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div
        className="rounded-2xl p-8 max-w-sm animate-[fadeIn_0.5s_ease-out]"
        style={{
          animation: 'fadeIn 0.5s ease-out, scaleIn 0.5s ease-out',
          background: `
            linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%),
            radial-gradient(circle at 50% 0%, rgba(251,191,36,0.1) 0%, transparent 70%)
          `,
          boxShadow: `
            0 0 60px rgba(251,191,36,0.3),
            0 20px 60px rgba(0,0,0,0.8),
            0 10px 30px rgba(0,0,0,0.6),
            inset 0 1px 2px rgba(255,255,255,0.1),
            inset 0 -1px 2px rgba(0,0,0,0.5)
          `,
          border: '2px solid rgba(251,191,36,0.5)'
        }}
      >
        {/* Enhanced confetti effect */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping opacity-75" style={{ boxShadow: '0 0 20px rgba(251,191,36,0.8)' }} />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.1s', boxShadow: '0 0 15px rgba(167,139,250,0.8)' }} />
        <div className="absolute -bottom-3 -left-3 w-7 h-7 bg-blue-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.2s', boxShadow: '0 0 15px rgba(96,165,250,0.8)' }} />
        <div className="absolute -bottom-4 -right-4 w-5 h-5 bg-emerald-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.3s', boxShadow: '0 0 12px rgba(52,211,153,0.8)' }} />

        <div
          role="status"
          aria-live="polite"
          className="text-center"
        >
          <h2
            className="text-3xl font-extrabold text-white mb-4"
            style={{
              textShadow: `
                0 0 20px rgba(251,191,36,0.6),
                0 2px 8px rgba(0,0,0,0.8)
              `,
              background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            🎉 Congratulations!
          </h2>

          <div
            className="my-6 p-6 rounded-xl"
            style={{
              background: `
                linear-gradient(135deg, ${prize.color} 0%, ${prize.color}dd 100%),
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)
              `,
              boxShadow: `
                0 8px 32px rgba(0,0,0,0.6),
                0 4px 16px ${prize.color}40,
                inset 0 1px 2px rgba(255,255,255,0.3),
                inset 0 -1px 2px rgba(0,0,0,0.3)
              `,
              border: `1px solid ${prize.color}88`
            }}
          >
            <div
              className="text-2xl font-bold text-white mb-2"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
            >
              {prize.label}
            </div>
            <div
              className="text-sm text-white/90"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
            >
              {prize.description}
            </div>
          </div>

          <p className="text-slate-300 mb-6" aria-live="polite">
            Congratulations! You won {prize.label}.
          </p>

          <button
            ref={claimButtonRef}
            onClick={onClaim}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            disabled={!canClaim}
            className="w-full px-6 py-3 text-white font-bold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              transform: isPressed && canClaim ? 'scale(0.95)' : 'scale(1)',
              background: !canClaim
                ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              boxShadow: !canClaim
                ? '0 4px 12px rgba(0,0,0,0.4)'
                : isPressed
                ? `
                  0 3px 12px rgba(16,185,129,0.25),
                  0 2px 8px rgba(59,130,246,0.25),
                  0 2px 6px rgba(0,0,0,0.4),
                  inset 0 2px 4px rgba(0,0,0,0.3)
                `
                : `
                  0 8px 24px rgba(16,185,129,0.3),
                  0 4px 16px rgba(59,130,246,0.3),
                  0 4px 12px rgba(0,0,0,0.5),
                  inset 0 1px 2px rgba(255,255,255,0.2),
                  inset 0 -1px 2px rgba(0,0,0,0.3)
                `,
              border: !canClaim
                ? '1px solid rgba(71,85,105,0.3)'
                : '1px solid rgba(16,185,129,0.5)',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              filter: isPressed && canClaim ? 'brightness(1.1)' : 'brightness(1)'
            }}
            data-testid="claim-prize-button"
          >
            Claim Prize
          </button>
        </div>
      </div>
    </div>
  );
}
