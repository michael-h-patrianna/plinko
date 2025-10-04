/**
 * Prize slot component at bottom of board
 */

import type { PrizeConfig } from '../../game/types';

interface SlotProps {
  index: number;
  prize: PrizeConfig;
  x: number;
  width: number;
  isWinning?: boolean;
}

export function Slot({ index, prize, x, width, isWinning = false }: SlotProps) {
  return (
    <div
      className="absolute bottom-0 flex flex-col items-center justify-center text-center overflow-hidden"
      style={{
        left: `${x}px`,
        width: `${width}px`,
        height: '90px',
        background: `
          linear-gradient(180deg, ${prize.color}ee 0%, ${prize.color} 60%, ${prize.color}dd 100%),
          radial-gradient(ellipse at 50% 120%, rgba(0,0,0,0.4) 0%, transparent 60%)
        `,
        border: `3px solid ${isWinning ? '#fbbf24' : 'rgba(148,163,184,0.6)'}`,
        borderRadius: '12px',
        transform: isWinning ? 'scale(1.08)' : 'scale(1)',
        boxShadow: isWinning
          ? `0 0 35px rgba(251,191,36,0.9),
             0 0 20px ${prize.color}cc,
             0 8px 20px rgba(0,0,0,0.6),
             inset 0 3px 10px rgba(255,255,255,0.25),
             inset 0 -3px 10px rgba(0,0,0,0.4),
             inset 0 0 30px ${prize.color}44`
          : `0 6px 16px rgba(0,0,0,0.5),
             0 3px 8px rgba(0,0,0,0.3),
             inset 0 3px 6px rgba(255,255,255,0.12),
             inset 0 -3px 6px rgba(0,0,0,0.25)`,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      data-testid={`slot-${index}`}
      data-active={isWinning}
    >
      {/* Shine effect */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
          pointerEvents: 'none'
        }}
      />

      <div className="text-white font-bold text-xs px-1 leading-tight drop-shadow-lg relative z-10">
        {prize.label}
      </div>
    </div>
  );
}
