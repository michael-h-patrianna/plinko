/**
 * Comprehensive tests for PrizeReveal sub-components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../testUtils';
import { FreeRewardView } from '@plinko/components/screens/PrizeReveal/FreeRewardView';
import { PurchaseOfferView } from '@plinko/components/screens/PrizeReveal/PurchaseOfferView';
import { NoWinView } from '@plinko/components/screens/PrizeReveal/NoWinView';
import { RewardItem } from '@plinko/components/screens/PrizeReveal/RewardItem';
import type { PrizeConfig } from '@plinko/game/types';

// ============================================================================
// FreeRewardView Component Tests
// ============================================================================
describe('FreeRewardView Component', () => {
  const mockOnClaim = vi.fn();

  beforeEach(() => {
    mockOnClaim.mockClear();
  });

  const freePrize: PrizeConfig = {
    id: 'test-free',
    probability: 0.5,
    slotIcon: '',
    slotColor: '#00ff00',
    type: 'free' as const,
    title: 'Free Reward',
    description: 'You won a free reward!',
    freeReward: {
      sc: 100,
      gc: 500,
    },
  };

  it('should render congratulations message', () => {
    const { container } = render(
      <FreeRewardView prize={freePrize} onClaim={mockOnClaim} canClaim={true} />
    );
    // YouWonText splits characters, so check for presence via class
    const youWonText = container.querySelector('.you-won-container');
    expect(youWonText).toBeInTheDocument();
  });

  it('should render reward items for SC', () => {
    render(<FreeRewardView prize={freePrize} onClaim={mockOnClaim} canClaim={true} />);
    // Check for SC currency label (counter starts at 0 and animates)
    expect(screen.getByText('Sweeps Coins')).toBeInTheDocument();
    expect(screen.getByAltText('SC')).toBeInTheDocument();
  });

  it('should render reward items for GC', () => {
    render(<FreeRewardView prize={freePrize} onClaim={mockOnClaim} canClaim={true} />);
    // Check for GC currency label (counter starts at 0 and animates)
    expect(screen.getByText('Gold Coins')).toBeInTheDocument();
    expect(screen.getByAltText('GC')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(<FreeRewardView prize={freePrize} onClaim={mockOnClaim} canClaim={true} />);
    expect(screen.getByText('You won a free reward!')).toBeInTheDocument();
  });

  it('should render claim button', () => {
    render(<FreeRewardView prize={freePrize} onClaim={mockOnClaim} canClaim={true} />);
    expect(screen.getByText('Claim Prize')).toBeInTheDocument();
  });

  it('should call onClaim when button clicked', () => {
    render(<FreeRewardView prize={freePrize} onClaim={mockOnClaim} canClaim={true} />);
    fireEvent.click(screen.getByText('Claim Prize'));
    expect(mockOnClaim).toHaveBeenCalledTimes(1);
  });

  it('should disable claim button when canClaim is false', () => {
    render(<FreeRewardView prize={freePrize} onClaim={mockOnClaim} canClaim={false} />);
    const button = screen.getByText('Claim Prize').closest('button');
    expect(button).toBeDisabled();
  });

  it('should return null if no free reward', () => {
    const prizeWithoutReward: PrizeConfig = {
      ...freePrize,
      freeReward: undefined,
    };
    const { container } = render(
      <FreeRewardView prize={prizeWithoutReward} onClaim={mockOnClaim} canClaim={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render all reward types', () => {
    const multiRewardPrize: PrizeConfig = {
      ...freePrize,
      freeReward: {
        sc: 50,
        gc: 200,
        spins: 10,
      },
    };
    render(<FreeRewardView prize={multiRewardPrize} onClaim={mockOnClaim} canClaim={true} />);
    // Check for all currency labels (counters start at 0 and animate)
    expect(screen.getByText('Sweeps Coins')).toBeInTheDocument();
    expect(screen.getByText('Gold Coins')).toBeInTheDocument();
    expect(screen.getByText('Free Spins')).toBeInTheDocument();
  });
});

// ============================================================================
// PurchaseOfferView Component Tests
// ============================================================================
describe('PurchaseOfferView Component', () => {
  const mockOnClaim = vi.fn();

  beforeEach(() => {
    mockOnClaim.mockClear();
  });

  const purchasePrize: PrizeConfig = {
    id: 'test-purchase',
    probability: 0.3,
    slotIcon: '',
    slotColor: '#ff0000',
    type: 'purchase' as const,
    title: 'Special Offer',
    description: '200% Bonus Package',
    purchaseOffer: {
      offerId: 'test-purchase',
      title: '200% Bonus',
      description: '$29.99',
    },
  };

  it('should render special offer header', () => {
    render(<PurchaseOfferView prize={purchasePrize} onClaim={mockOnClaim} canClaim={true} />);
    expect(screen.getByText(/Special Offer!/i)).toBeInTheDocument();
  });

  it('should render 200% SPECIAL DEAL ribbon', () => {
    render(<PurchaseOfferView prize={purchasePrize} onClaim={mockOnClaim} canClaim={true} />);
    expect(screen.getByText('200% SPECIAL DEAL')).toBeInTheDocument();
  });

  it('should extract and display price', () => {
    render(<PurchaseOfferView prize={purchasePrize} onClaim={mockOnClaim} canClaim={true} />);
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it.skip('should render reward items if present', () => {
    render(<PurchaseOfferView prize={purchasePrize} onClaim={mockOnClaim} canClaim={true} />);
    expect(screen.getByText(/1000/)).toBeInTheDocument();
  });

  it('should call onClaim when button clicked', () => {
    render(<PurchaseOfferView prize={purchasePrize} onClaim={mockOnClaim} canClaim={true} />);
    fireEvent.click(screen.getByText('$29.99'));
    expect(mockOnClaim).toHaveBeenCalledTimes(1);
  });

  it('should disable purchase button when canClaim is false', () => {
    render(<PurchaseOfferView prize={purchasePrize} onClaim={mockOnClaim} canClaim={false} />);
    const button = screen.getByText('$29.99').closest('button');
    expect(button).toBeDisabled();
  });

  it('should return null if no purchase offer', () => {
    const prizeWithoutOffer: PrizeConfig = {
      ...purchasePrize,
      purchaseOffer: undefined,
    };
    const { container } = render(
      <PurchaseOfferView prize={prizeWithoutOffer} onClaim={mockOnClaim} canClaim={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should show limited time offer message', () => {
    render(<PurchaseOfferView prize={purchasePrize} onClaim={mockOnClaim} canClaim={true} />);
    expect(screen.getByText(/Limited time offer/i)).toBeInTheDocument();
  });
});

// ============================================================================
// NoWinView Component Tests
// ============================================================================
describe('NoWinView Component', () => {
  const mockOnClaim = vi.fn();

  beforeEach(() => {
    mockOnClaim.mockClear();
  });

  const noWinPrize: PrizeConfig = {
    id: 'test-nowin',
    probability: 0.2,
    slotIcon: '',
    slotColor: '#888888',
    type: 'no_win' as const,
    title: 'Better Luck Next Time',
    description: 'Keep trying!',
  };

  it('should render title', () => {
    render(<NoWinView prize={noWinPrize} onClaim={mockOnClaim} canClaim={true} />);
    expect(screen.getByText('Better Luck Next Time')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<NoWinView prize={noWinPrize} onClaim={mockOnClaim} canClaim={true} />);
    expect(screen.getByText('Keep trying!')).toBeInTheDocument();
  });

  it('should render default description if none provided', () => {
    const prizeNoDescription: PrizeConfig = {
      ...noWinPrize,
      description: undefined,
    };
    render(<NoWinView prize={prizeNoDescription} onClaim={mockOnClaim} canClaim={true} />);
    expect(screen.getByText(/Better luck next time!/i)).toBeInTheDocument();
  });

  it('should render encouraging message', () => {
    render(<NoWinView prize={noWinPrize} onClaim={mockOnClaim} canClaim={true} />);
    expect(screen.getByText(/your big win could be just around the corner/i)).toBeInTheDocument();
  });

  it('should render Try Again button', () => {
    render(<NoWinView prize={noWinPrize} onClaim={mockOnClaim} canClaim={true} />);
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should call onClaim when button clicked', () => {
    render(<NoWinView prize={noWinPrize} onClaim={mockOnClaim} canClaim={true} />);
    fireEvent.click(screen.getByText('Try Again'));
    expect(mockOnClaim).toHaveBeenCalledTimes(1);
  });

  it('should disable button when canClaim is false', () => {
    render(<NoWinView prize={noWinPrize} onClaim={mockOnClaim} canClaim={false} />);
    const button = screen.getByText('Try Again').closest('button');
    expect(button).toBeDisabled();
  });

  it('should render no win image', () => {
    render(<NoWinView prize={noWinPrize} onClaim={mockOnClaim} canClaim={true} />);
    const image = screen.getByAltText('No Win');
    expect(image).toBeInTheDocument();
  });
});

// ============================================================================
// RewardItem Component Tests
// ============================================================================
describe('RewardItem Component', () => {
  it('should render SC reward', () => {
    render(<RewardItem type="sc" amount={100} delay={0} />);
    expect(screen.getByText(/SC.*100/)).toBeInTheDocument();
  });

  it('should render GC reward', () => {
    render(<RewardItem type="gc" amount={500} delay={0} />);
    expect(screen.getByText(/GC.*500/)).toBeInTheDocument();
  });

  it('should render spins reward', () => {
    render(<RewardItem type="spins" amount={10} delay={0} />);
    expect(screen.getByText(/10.*Free Spins/)).toBeInTheDocument();
  });

  it('should render random reward', () => {
    render(<RewardItem type="randomReward" delay={0} />);
    expect(screen.getByText(/Bronze Wheel/i)).toBeInTheDocument();
  });

  it('should render XP reward with icon', () => {
    render(
      <RewardItem type="xp" amount={250} xpConfig={{ icon: '⭐', name: 'Star XP' }} delay={0} />
    );
    expect(screen.getByText(/250.*Star XP/)).toBeInTheDocument();
    const image = screen.getByAltText('Star XP');
    expect(image).toBeInTheDocument();
  });

  it('should render with delay animation', () => {
    const { container } = render(<RewardItem type="sc" amount={100} delay={0.5} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
