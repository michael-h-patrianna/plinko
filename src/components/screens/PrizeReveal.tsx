/**
 * Prize reveal overlay router that displays appropriate view based on prize type
 * Routes to FreeRewardView, NoWinView, or PurchaseOfferView
 * @param prize - Prize configuration determining which view to show
 * @param onClaim - Callback when user claims/dismisses the prize
 * @param canClaim - Whether the claim button should be enabled
 */

import type { PrizeConfig } from '../../game/types';
import { FreeRewardView } from './PrizeReveal/FreeRewardView';
import { NoWinView } from './PrizeReveal/NoWinView';
import { PurchaseOfferView } from './PrizeReveal/PurchaseOfferView';

interface PrizeRevealProps {
  prize: PrizeConfig;
  onClaim: () => void;
  onReset?: () => void;
  canClaim: boolean;
}

export function PrizeReveal({ prize, onClaim, onReset, canClaim }: PrizeRevealProps) {
  // Route to appropriate view based on prize type
  if (prize.type === 'no_win') {
    return <NoWinView prize={prize} onClaim={onReset || onClaim} canClaim={canClaim} />;
  }

  if (prize.type === 'purchase') {
    return <PurchaseOfferView prize={prize} onClaim={onClaim} canClaim={canClaim} />;
  }

  // Default: free reward
  return <FreeRewardView prize={prize} onClaim={onClaim} canClaim={canClaim} />;
}
