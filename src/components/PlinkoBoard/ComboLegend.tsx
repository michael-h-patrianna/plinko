/**
 * Legend showing combo reward details for numbered badges
 */

import type { PrizeConfig } from '../../game/types';
import { getSlotDisplayText } from '../../game/prizeTypes';
import { abbreviateNumber } from '../../utils/formatNumber';

interface ComboLegendProps {
  slots: Array<{
    prize: PrizeConfig;
    comboBadgeNumber?: number;
  }>;
}

export function ComboLegend({ slots }: ComboLegendProps) {
  // Filter slots that have combo badges
  const comboSlots = slots.filter(slot => slot.comboBadgeNumber !== undefined);

  if (comboSlots.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 px-3 text-xs space-y-1.5">
      {comboSlots.map((slot) => {
        const color = (slot.prize as any).slotColor || slot.prize.color || '#64748B';
        const fullComboText = getSlotDisplayText(slot.prize as any, abbreviateNumber, true);

        return (
          <div
            key={slot.comboBadgeNumber}
            className="flex items-center gap-2"
          >
            {/* Badge number */}
            <div
              className="font-bold text-white leading-none flex-shrink-0"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                boxShadow: `0 2px 6px rgba(0,0,0,0.3), 0 0 0 1.5px rgba(255,255,255,0.2)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
              }}
            >
              {slot.comboBadgeNumber}
            </div>

            {/* Full combo text */}
            <div className="text-slate-200 flex-1">
              {fullComboText}
            </div>
          </div>
        );
      })}
    </div>
  );
}
