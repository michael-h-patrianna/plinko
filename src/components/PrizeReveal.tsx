/**
 * Prize reveal overlay - routes to appropriate view based on prize type
 */

import type { PrizeConfig } from '../game/types';
import { FreeRewardView } from './PrizeReveal/FreeRewardView';
import { NoWinView } from './PrizeReveal/NoWinView';
import { PurchaseOfferView } from './PrizeReveal/PurchaseOfferView';

interface PrizeRevealProps {
  prize: PrizeConfig;
  onClaim: () => void;
  canClaim: boolean;
}

export function PrizeReveal({ prize, onClaim, canClaim }: PrizeRevealProps) {
  // Route to appropriate view based on prize type
  if (prize.type === 'no_win') {
    return <NoWinView prize={prize} onClaim={onClaim} canClaim={canClaim} />;
  }

  if (prize.type === 'purchase') {
    return <PurchaseOfferView prize={prize} onClaim={onClaim} canClaim={canClaim} />;
  }

  // Default: free reward
  return <FreeRewardView prize={prize} onClaim={onClaim} canClaim={canClaim} />;
}
