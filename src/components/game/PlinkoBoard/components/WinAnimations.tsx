/**
 * WinAnimations component - orchestrates all win-related animations
 * Includes landing impact, slot anticipation, and win reveal effects
 */

import { memo } from 'react';
import type { PrizeConfig, BallPosition } from '../../../../game/types';
import { BallLandingImpact } from '../../../effects/WinAnimations/BallLandingImpact';
import { SlotAnticipation } from '../../../effects/WinAnimations/SlotAnticipation';
import { SlotWinReveal } from '../../../effects/WinAnimations/SlotWinReveal';
import { useTheme } from '../../../../theme';
import { getPrizeThemeColor } from '../../../../theme/prizeColorMapper';

interface WinAnimationsProps {
  showLandingImpact: boolean;
  showAnticipation: boolean;
  showWinReveal: boolean;
  getBallPosition?: () => BallPosition | null;
  selectedIndex: number;
  winningSlot: {
    prize: PrizeConfig;
    x: number;
    width: number;
  } | null;
  bucketZoneY: number;
  boardHeight: number;
}

export const WinAnimations = memo(function WinAnimations({
  showLandingImpact,
  showAnticipation,
  showWinReveal,
  getBallPosition,
  selectedIndex,
  winningSlot,
  bucketZoneY,
  boardHeight,
}: WinAnimationsProps) {
  const { theme } = useTheme();

  // Early return if no winning slot is available
  if (!winningSlot || selectedIndex < 0) {
    return null;
  }

  const color = getPrizeThemeColor(winningSlot.prize, theme);
  const ballPosition = getBallPosition?.();

  return (
    <>
      {/* Ball Landing Impact - triggers when ball lands */}
      {showLandingImpact && ballPosition && (
        <BallLandingImpact
          x={ballPosition.x}
          y={ballPosition.y}
          color={color}
          trigger={showLandingImpact}
        />
      )}

      {/* Slot Anticipation - rising particles during landed state */}
      {showAnticipation && (
        <SlotAnticipation
          x={winningSlot.x}
          width={winningSlot.width}
          color={color}
          isActive={showAnticipation}
        />
      )}

      {/* Win Reveal Animation */}
      {showWinReveal && (
        <SlotWinReveal
          x={winningSlot.x}
          y={bucketZoneY}
          width={winningSlot.width}
          height={boardHeight - bucketZoneY}
          color={color}
          label={winningSlot.prize.title || ''}
          isActive={showWinReveal}
        />
      )}
    </>
  );
});
