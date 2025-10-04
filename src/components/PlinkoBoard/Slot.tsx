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
      className="absolute bottom-0 flex flex-col items-center justify-center text-center"
      style={{
        left: `${x}px`,
        width: `${width}px`,
        height: '80px',
        backgroundColor: prize.color,
        border: `3px solid ${isWinning ? '#fbbf24' : '#94a3b8'}`,
        borderRadius: '8px',
        transform: isWinning ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isWinning ? '0 0 20px rgba(251,146,60,0.6)' : 'none'
      }}
      data-testid={`slot-${index}`}
      data-active={isWinning}
    >
      <div className="text-white font-bold text-sm px-1 leading-tight">
        {prize.label}
      </div>
    </div>
  );
}
