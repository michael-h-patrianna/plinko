/**
 * Legend component showing full reward details for combo prizes
 * Displays below the board with numbered badges matching slot combo badges
 * @param slots - Array of slot data with prizes and combo badge numbers
 */

import type { PrizeConfig } from '../../game/types';
import { getSlotDisplayText } from '../../game/prizeTypes';
import { abbreviateNumber } from '../../utils/formatNumber';
import { useTheme } from '../../theme';

interface ComboLegendProps {
  slots: Array<{
    prize: PrizeConfig;
    comboBadgeNumber?: number;
  }>;
}

export function ComboLegend({ slots }: ComboLegendProps) {
  const { theme } = useTheme();
  // Filter slots that have combo badges
  const comboSlots = slots.filter((slot) => slot.comboBadgeNumber !== undefined);

  if (comboSlots.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 px-3 text-xs space-y-1.5">
      {comboSlots.map((slot) => {
        const color = slot.prize.slotColor || slot.prize.color || theme.colors.game.slot.border;
        const fullComboText = getSlotDisplayText(slot.prize, abbreviateNumber, true);

        return (
          <div key={slot.comboBadgeNumber} className="flex items-center gap-2">
            {/* Badge number */}
            <div
              className="font-bold leading-none flex-shrink-0"
              style={{
                color: theme.colors.primary.contrast,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                boxShadow: `0 2px 6px ${theme.colors.shadows.default}4d, 0 0 0 1.5px ${theme.colors.text.inverse}33`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
              }}
            >
              {slot.comboBadgeNumber}
            </div>

            {/* Full combo text */}
            <div className="flex-1" style={{ color: theme.colors.text.primary }}>
              {fullComboText}
            </div>
          </div>
        );
      })}
    </div>
  );
}
