/**
 * SlotList component - renders all prize slots with memoization
 * Handles slot positioning, win state, approach detection, and bucket collisions
 */

import { memo } from 'react';
import type { GameState, PrizeConfig, TrajectoryPoint } from '../../../../game/types';
import { Slot } from '../Slot';

export interface SlotData {
  index: number;
  prize: PrizeConfig;
  x: number;
  width: number;
  comboBadgeNumber?: number;
}

interface SlotListProps {
  slots: SlotData[];
  selectedIndex: number;
  currentTrajectoryPoint: TrajectoryPoint | null;
  ballState: GameState;
  boardWidth: number;
  bucketZoneY: number;
}

export const SlotList = memo(function SlotList({
  slots,
  selectedIndex,
  currentTrajectoryPoint,
  ballState,
  boardWidth,
  bucketZoneY,
}: SlotListProps) {

  return (
    <>
      {slots.map((slot) => {
        // Check if ball is directly above this slot (tighter detection for snappy lighting)
        const isApproaching =
          ballState === 'dropping' && currentTrajectoryPoint
            ? Math.abs(currentTrajectoryPoint.x - (slot.x + slot.width / 2)) < slot.width / 2
            : false;

        // Only show winning state during drop and end phase, not when idle
        const isWinning = ballState !== 'idle' && slot.index === selectedIndex;

        // Determine if ball is in this slot (bucket zone)
        const isInThisSlot =
          currentTrajectoryPoint && currentTrajectoryPoint.y >= bucketZoneY
            ? Math.abs(currentTrajectoryPoint.x - (slot.x + slot.width / 2)) < slot.width / 2
            : false;

        // Pass collision data if ball is in this slot
        const wallImpact = isInThisSlot ? currentTrajectoryPoint?.bucketWallHit : null;
        const floorImpact = isInThisSlot && currentTrajectoryPoint?.bucketFloorHit;

        return (
          <Slot
            key={`slot-${slot.index}`}
            index={slot.index}
            prize={slot.prize}
            x={slot.x}
            width={slot.width}
            isWinning={isWinning}
            isApproaching={isApproaching}
            wallImpact={wallImpact}
            floorImpact={floorImpact}
            prizeCount={slots.length}
            boardWidth={boardWidth}
            comboBadgeNumber={slot.comboBadgeNumber}
          />
        );
      })}
    </>
  );
});
