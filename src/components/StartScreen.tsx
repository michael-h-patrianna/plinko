/**
 * Start screen with game title and drop button
 */

import { useState } from 'react';
import type { PrizeConfig } from '../game/types';

interface StartScreenProps {
  prizes: PrizeConfig[];
  onStart: () => void;
  disabled: boolean;
}

export function StartScreen({ prizes, onStart, disabled }: StartScreenProps) {
  const [isPressed, setIsPressed] = useState(false);
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(15,23,42,0.98) 0%, rgba(2,6,23,0.99) 100%)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <h1
        className="text-4xl font-extrabold text-white mb-6 text-center"
        style={{
          textShadow: `
            0 0 30px rgba(251,191,36,0.5),
            0 2px 10px rgba(0,0,0,0.8),
            0 4px 20px rgba(0,0,0,0.6)
          `,
          background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Plinko Popup
      </h1>

      <div
        className="rounded-lg p-4 mb-8 max-w-sm"
        style={{
          background: `
            linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)
          `,
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.6),
            0 4px 16px rgba(0,0,0,0.4),
            inset 0 1px 2px rgba(255,255,255,0.08),
            inset 0 -1px 2px rgba(0,0,0,0.5)
          `,
          border: '1px solid rgba(71,85,105,0.4)'
        }}
      >
        <h2 className="text-lg font-semibold text-slate-200 mb-3 text-center">
          Available Prizes
        </h2>
        <div className="space-y-2">
          {prizes.map((prize) => (
            <div
              key={prize.id}
              className="flex items-center justify-between text-sm px-2 py-1 rounded"
              style={{
                background: `linear-gradient(90deg, ${prize.color}15 0%, transparent 100%)`,
                borderLeft: `2px solid ${prize.color}`
              }}
            >
              <span className="text-slate-200 font-medium">{prize.label}</span>
              <span className="text-amber-400 font-semibold">
                {(prize.probability * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        disabled={disabled}
        className="px-8 py-4 text-white font-bold text-lg rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          transform: isPressed && !disabled ? 'scale(0.95)' : 'scale(1)',
          background: disabled
            ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
            : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
          boxShadow: disabled
            ? '0 4px 12px rgba(0,0,0,0.4)'
            : isPressed
            ? `
              0 4px 15px rgba(251,191,36,0.3),
              0 2px 8px rgba(251,146,60,0.2),
              0 2px 6px rgba(0,0,0,0.4),
              inset 0 2px 4px rgba(0,0,0,0.3)
            `
            : `
              0 10px 30px rgba(251,191,36,0.4),
              0 6px 20px rgba(251,146,60,0.3),
              0 4px 12px rgba(0,0,0,0.5),
              inset 0 1px 2px rgba(255,255,255,0.3),
              inset 0 -1px 2px rgba(0,0,0,0.3)
            `,
          border: disabled
            ? '1px solid rgba(71,85,105,0.3)'
            : '1px solid rgba(217,119,6,0.6)',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          filter: isPressed && !disabled ? 'brightness(1.1)' : 'brightness(1)'
        }}
        data-testid="drop-ball-button"
      >
        Drop Ball
      </button>
    </div>
  );
}
