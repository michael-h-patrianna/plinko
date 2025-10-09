/**
 * Utility function to calculate slot positions and combo badge numbers
 * Shared between PlinkoBoard and its sub-components
 */

import type { PrizeConfig } from '../../../../game/types';
import type { SlotData } from '../components/SlotList';

export function calculateSlots(
  prizes: PrizeConfig[],
  borderWidth: number,
  slotWidth: number
): SlotData[] {
  let comboBadgeCounter = 1;

  return prizes.map((prize, index) => {
    // Check if prize has multiple rewards (combo)
    // Only free rewards with multiple prizes get badges, not purchase offers
    const prizeType = prize.type;
    const isPurchaseOffer = prizeType === 'purchase';
    const prizeReward = prize.freeReward;
    const rewardCount = prizeReward
      ? [
          prizeReward.sc,
          prizeReward.gc,
          prizeReward.spins,
          prizeReward.xp,
          prizeReward.randomReward,
        ].filter(Boolean).length
      : 0;

    const isCombo = rewardCount >= 2 && !isPurchaseOffer;
    const comboBadgeNumber = isCombo ? comboBadgeCounter++ : undefined;

    return {
      index,
      prize,
      x: borderWidth + index * slotWidth,
      width: slotWidth,
      comboBadgeNumber,
    };
  });
}
