/**
 * Start screen with game title and drop button
 */

import type { PrizeConfig } from '../game/types';

interface StartScreenProps {
  prizes: PrizeConfig[];
  onStart: () => void;
  disabled: boolean;
}

export function StartScreen({ prizes, onStart, disabled }: StartScreenProps) {
  return (
    <div className="absolute inset-0 bg-slate-900/95 z-30 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-extrabold text-white mb-6 text-center">
        Plinko Popup
      </h1>

      <div className="bg-slate-800 rounded-lg p-4 mb-8 max-w-sm">
        <h2 className="text-lg font-semibold text-slate-200 mb-3 text-center">
          Available Prizes
        </h2>
        <div className="space-y-2">
          {prizes.map((prize) => (
            <div
              key={prize.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-slate-300">{prize.label}</span>
              <span className="text-slate-400">
                {(prize.probability * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={disabled}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-lg rounded-lg shadow-xl hover:from-blue-600 hover:to-violet-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="drop-ball-button"
      >
        Drop Ball
      </button>
    </div>
  );
}
