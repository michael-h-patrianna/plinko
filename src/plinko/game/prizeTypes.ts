/**
 * Production prize type system
 * Supports NoWin, Free rewards, and Purchase offers
 */

export type PrizeType = 'no_win' | 'free' | 'purchase';

export interface CollectibleConfig {
  icon: string;
  name: string; // e.g., "Stars", "Bats", "Pumpkins"
}

export interface RandomRewardConfig {
  icon: string;
  name: string; // e.g., "Bronze Wheel", "Silver Wheel", "Gold Wheel"
}

export interface FreeReward {
  gc?: number; // Gold Coins
  sc?: number; // Sweeps Coins
  spins?: number; // Free Spins
  xp?: {
    // Collectible reward (Stars, Bats, Pumpkins, etc.)
    amount: number;
    config: CollectibleConfig;
  };
  randomReward?: {
    // Random reward (configurable wheel)
    config: RandomRewardConfig;
  };
}

export interface PurchaseOffer {
  offerId: string;
  title: string;
  description?: string;
}

export interface Prize {
  id: string;
  type: PrizeType;
  probability: number;

  // Display in slots (compact)
  slotIcon: string; // Path to icon for slot display
  slotColor: string; // Color for slot highlighting

  // Full details (for reveal modal)
  title: string;
  description?: string;

  // Type-specific data
  freeReward?: FreeReward;
  purchaseOffer?: PurchaseOffer;
}

/**
 * Get compact display text for slot
 * For slots: shows single dominant reward (priority: SC > Free Spins > GC > Random > XP)
 * For prize table: shows full combo with " + "
 */
export function getSlotDisplayText(
  prize: Prize,
  abbreviate: (n: number) => string = (n) => n.toString(),
  fullCombo: boolean = false,
  compactMode: boolean = false
): string {
  if (prize.type === 'no_win') return '';
  if (prize.type === 'purchase') return '200%';

  // For free rewards
  if (prize.freeReward) {
    const parts: string[] = [];
    const spinsLabel = compactMode ? 'Spins' : 'Free Spins';

    if (prize.freeReward.sc) parts.push(`SC ${abbreviate(prize.freeReward.sc)}`);
    if (prize.freeReward.spins) parts.push(`${abbreviate(prize.freeReward.spins)} ${spinsLabel}`);
    if (prize.freeReward.gc) parts.push(`GC ${abbreviate(prize.freeReward.gc)}`);
    if (prize.freeReward.randomReward) {
      const rewardName = prize.freeReward.randomReward.config.name;
      parts.push(rewardName);
    }
    if (prize.freeReward.xp)
      parts.push(`${abbreviate(prize.freeReward.xp.amount)} ${prize.freeReward.xp.config.name}`);

    if (parts.length === 0) return '';

    // For slots: show only first reward from priority list
    // For prize table: show all with " + " separator
    return fullCombo ? parts.join(' + ') : parts[0] || '';
  }

  return '';
}

/**
 * Get full description for reveal modal
 */
export function getFullRewardDescription(prize: Prize): string[] {
  const parts: string[] = [];

  if (prize.type === 'no_win') {
    return ['Better luck next time!'];
  }

  if (prize.type === 'purchase') {
    if (prize.purchaseOffer) {
      parts.push(prize.purchaseOffer.title);
      if (prize.purchaseOffer.description) {
        parts.push(prize.purchaseOffer.description);
      }
    }
    return parts;
  }

  if (prize.freeReward) {
    if (prize.freeReward.sc) parts.push(`SC ${prize.freeReward.sc}`);
    if (prize.freeReward.gc) parts.push(`GC ${prize.freeReward.gc}`);
    if (prize.freeReward.spins) parts.push(`${prize.freeReward.spins} Free Spins`);
    if (prize.freeReward.xp) {
      parts.push(`${prize.freeReward.xp.amount} ${prize.freeReward.xp.config.name}`);
    }
    if (prize.freeReward.randomReward) {
      const rewardName = prize.freeReward.randomReward.config.name;
      parts.push(`1 ${rewardName}`);
    }
  }

  return parts.length > 0 ? parts : [prize.title];
}
