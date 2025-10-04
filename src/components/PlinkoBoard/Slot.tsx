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
  isApproaching?: boolean; // Ball is getting close
}

export function Slot({ index, prize, x, width, isWinning = false, isApproaching = false }: SlotProps) {
  return (
    <div
      className="absolute bottom-0 flex flex-col items-center justify-end text-center"
      style={{
        left: `${x}px`,
        width: `${width}px`,
        height: '70px',
        // Hollow bucket with walls - transparent center with visible borders
        background: `
          linear-gradient(180deg, transparent 0%, transparent 40%, ${prize.color}33 70%, ${prize.color}66 100%)
        `,
        borderLeft: `3px solid ${isWinning ? '#fbbf24' : isApproaching ? prize.color : 'rgba(148,163,184,0.8)'}`,
        borderRight: `3px solid ${isWinning ? '#fbbf24' : isApproaching ? prize.color : 'rgba(148,163,184,0.8)'}`,
        borderBottom: `3px solid ${isWinning ? '#fbbf24' : isApproaching ? prize.color : 'rgba(148,163,184,0.8)'}`,
        borderTop: 'none',
        borderRadius: '0 0 8px 8px',
        transform: isWinning ? 'scale(1.08)' : 'scale(1)',
        boxShadow: isWinning
          ? `0 0 35px rgba(251,191,36,0.9),
             0 0 20px ${prize.color}cc,
             0 8px 20px rgba(0,0,0,0.6),
             inset 0 3px 10px rgba(255,255,255,0.25),
             inset 0 -3px 10px rgba(0,0,0,0.4),
             inset 0 0 30px ${prize.color}44`
          : isApproaching
          ? `0 0 25px ${prize.color}80,
             0 6px 16px rgba(0,0,0,0.5),
             0 3px 8px rgba(0,0,0,0.3),
             inset 0 3px 6px rgba(255,255,255,0.15),
             inset 0 -3px 6px rgba(0,0,0,0.25),
             inset 0 0 20px ${prize.color}33`
          : `0 6px 16px rgba(0,0,0,0.5),
             0 3px 8px rgba(0,0,0,0.3),
             inset 0 3px 6px rgba(255,255,255,0.12),
             inset 0 -3px 6px rgba(0,0,0,0.25)`,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        animation: isApproaching && !isWinning ? 'pulse 0.8s ease-in-out infinite' : 'none'
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

      <div className="text-white font-bold text-xs px-1 pb-2 leading-tight drop-shadow-lg relative z-10">
        {prize.label}
      </div>
    </div>
  );
}
