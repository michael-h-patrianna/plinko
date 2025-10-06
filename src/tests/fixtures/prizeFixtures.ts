import type { DeterministicTrajectoryPayload, PrizeConfig } from '../../game/types';

export interface PrizeFixture {
  name: string;
  prizes: PrizeConfig[];
  winningIndex: number;
  deterministicTrajectory?: DeterministicTrajectoryPayload;
}

const deterministicPrizeSet: PrizeConfig[] = [
  {
    id: 'grand_prize',
    type: 'free',
    probability: 0.25,
    slotIcon: 'fixtures/icons/grand-prize.svg',
    slotColor: '#F97316',
    title: '500 Free SC',
    label: '500 Free SC',
    description: 'Sweeps Coins bonus',
    freeReward: {
      sc: 500,
    },
    color: '#F97316',
  },
  {
    id: 'bonus_spins',
    type: 'free',
    probability: 0.2,
    slotIcon: 'fixtures/icons/bonus-spins.svg',
    slotColor: '#FB923C',
    title: '30 Free Spins',
    label: '30 Free Spins',
    description: 'Slot free play bundle',
    freeReward: {
      spins: 30,
    },
    color: '#FB923C',
  },
  {
    id: 'combo_reward',
    type: 'free',
    probability: 0.18,
    slotIcon: 'fixtures/icons/combo-reward.svg',
    slotColor: '#60A5FA',
    title: 'Combo Reward',
    label: 'Combo Reward',
    description: 'Mixed GC + SC bundle',
    freeReward: {
      gc: 5000,
      sc: 100,
    },
    color: '#60A5FA',
  },
  {
    id: 'special_offer',
    type: 'purchase',
    probability: 0.15,
    slotIcon: 'fixtures/icons/special-offer.svg',
    slotColor: '#EF4444',
    title: '200% Purchase Offer',
    label: '200% Offer',
    description: 'Optional purchase boost',
    purchaseOffer: {
      offerId: 'offer-fixture-200',
      title: '200% Purchase Offer',
      description: 'Unlock the premium bonus pack.',
    },
    color: '#EF4444',
  },
  {
    id: 'consolation_gc',
    type: 'free',
    probability: 0.12,
    slotIcon: 'fixtures/icons/consolation.svg',
    slotColor: '#34D399',
    title: '5,000 GC',
    label: '5,000 GC',
    description: 'Gold Coin consolation prize',
    freeReward: {
      gc: 5000,
    },
    color: '#34D399',
  },
  {
    id: 'no_win',
    type: 'no_win',
    probability: 0.1,
    slotIcon: 'fixtures/icons/no-win.svg',
    slotColor: '#64748B',
    title: 'No Win',
    label: 'No Win',
    description: 'Try again soon',
    color: '#64748B',
  },
];

type MutablePrizeConfig = PrizeConfig & { probability: number };

function clonePrizeSet(source: PrizeConfig[]): PrizeConfig[] {
  return source.map((prize) => ({ ...(prize as MutablePrizeConfig) }));
}

export const prizeFixtures: Record<string, PrizeFixture> = {
  deterministicSixSlot: {
    name: 'deterministicSixSlot',
    prizes: clonePrizeSet(deterministicPrizeSet),
    winningIndex: 0,
  },
  purchaseScenario: {
    name: 'purchaseScenario',
    prizes: clonePrizeSet(deterministicPrizeSet),
    winningIndex: 3,
  },
};

export function getPrizeFixture(
  name: keyof typeof prizeFixtures = 'deterministicSixSlot'
): PrizeFixture {
  const fixture = prizeFixtures[name];
  if (!fixture) {
    throw new Error(`Unknown prize fixture: ${name}`);
  }
  return {
    name: fixture.name,
    winningIndex: fixture.winningIndex,
    prizes: clonePrizeSet(fixture.prizes),
    deterministicTrajectory: fixture.deterministicTrajectory,
  };
}
