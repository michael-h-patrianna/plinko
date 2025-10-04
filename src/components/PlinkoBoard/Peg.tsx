/**
 * Individual peg component with AAA-quality hit animations
 */

import { useEffect, useState } from 'react';

interface PegProps {
  row: number;
  col: number;
  x: number;
  y: number;
  isActive?: boolean;
  shouldReset?: boolean;
}

export function Peg({ row, col, x, y, isActive = false, shouldReset = false }: PegProps) {
  const [wasHit, setWasHit] = useState(false);

  // Reset when new ball drop starts
  useEffect(() => {
    if (shouldReset) {
      setWasHit(false);
    }
  }, [shouldReset]);

  // Trigger animation when peg is hit
  useEffect(() => {
    if (isActive && !wasHit) {
      setWasHit(true);
      // Reset after animation completes
      const timer = setTimeout(() => setWasHit(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, wasHit]);

  return (
    <>
      {/* Glow effect when hit */}
      {wasHit && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: '32px',
            height: '32px',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(251,191,36,0.8) 0%, rgba(251,191,36,0.4) 40%, transparent 70%)',
            animation: 'pegGlowPulse 300ms ease-out',
            zIndex: 15
          }}
        />
      )}

      {/* Peg itself */}
      <div
        className="absolute rounded-full"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '16px',
          height: '16px',
          transform: wasHit
            ? 'translate(-50%, -50%) scale(1.1)'
            : 'translate(-50%, -50%)',
          background: wasHit
            ? 'radial-gradient(circle at 35% 35%, #fef3c7, #fde047, #facc15, #eab308)'
            : 'radial-gradient(circle at 35% 35%, #f1f5f9, #cbd5e1, #94a3b8, #64748b)',
          boxShadow: wasHit
            ? `
              0 0 15px rgba(251,191,36,0.8),
              0 3px 8px rgba(0,0,0,0.5),
              0 5px 15px rgba(0,0,0,0.3),
              inset -1px -1px 3px rgba(0,0,0,0.4),
              inset 1px 1px 3px rgba(255,255,255,0.8)
            `
            : `
              0 2px 6px rgba(0,0,0,0.4),
              0 4px 12px rgba(0,0,0,0.2),
              inset -1px -1px 2px rgba(0,0,0,0.3),
              inset 1px 1px 2px rgba(255,255,255,0.6)
            `,
          border: wasHit
            ? '1.5px solid rgba(251,191,36,0.6)'
            : '1px solid rgba(148, 163, 184, 0.3)',
          transition: 'all 100ms ease-out',
          animation: wasHit ? 'pegShake 300ms ease-out' : 'none',
          zIndex: 10
        }}
        data-testid={`peg-${row}-${col}`}
        data-peg-hit={isActive}
      />

      <style>{`
        @keyframes pegGlowPulse {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }

        @keyframes pegShake {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translate(-48%, -50%) scale(1.1);
          }
          20%, 40%, 60%, 80% {
            transform: translate(-52%, -50%) scale(1.1);
          }
        }
      `}</style>
    </>
  );
}
