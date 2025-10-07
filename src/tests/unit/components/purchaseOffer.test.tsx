/**
 * Integration test for purchase offer prize bug
 * Verifies that when winning a purchase offer, the correct view is displayed
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../../App';
import { AppConfigProvider } from '../../../config/AppConfigContext';
import { createFixturePrizeProvider } from '../../../game/prizeProvider';
import { getPrizeFixture } from '../../fixtures/prizeFixtures';

describe('Purchase Offer Prize Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display PurchaseOfferView when winning a purchase offer prize', async () => {
    const user = userEvent.setup();

    // Use the purchaseScenario fixture which has winningIndex = 3 (purchase offer)
    const fixture = getPrizeFixture('purchaseScenario');
    const prizeProvider = createFixturePrizeProvider(fixture);

    expect(fixture.winningIndex).toBe(3);
    expect(fixture.prizes[3]?.type).toBe('purchase');

    render(
      <AppConfigProvider
        value={{
          featureFlags: {
            devToolsEnabled: false,
            dropPositionMechanicEnabled: false,
          },
          prizeProvider,
        }}
      >
        <App />
      </AppConfigProvider>
    );

    // Wait for start button to be available
    const startButton = await screen.findByTestId('drop-ball-button', undefined, {
      timeout: 5000,
    });

    // Start the game
    await user.click(startButton);

    // Wait for prize reveal to show (with "Special Offer!" text)
    await screen.findByText(/Special Offer!/i, undefined, { timeout: 12000 });

    // Verify the ribbon is present
    expect(screen.getByText(/200% SPECIAL DEAL/i)).toBeInTheDocument();

    // Verify price button is present (not "Claim Prize" from FreeRewardView)
    const button = screen.getByTestId('claim-prize-button');
    expect(button).toHaveTextContent(/\$/); // Should show price like "$29.99"
  });

  it('should preserve purchase offer type through game state transitions', async () => {
    const user = userEvent.setup();
    const fixture = getPrizeFixture('purchaseScenario');
    const prizeProvider = createFixturePrizeProvider(fixture);

    const winningPrize = fixture.prizes[fixture.winningIndex];
    expect(winningPrize?.type).toBe('purchase');
    expect(winningPrize?.purchaseOffer).toBeDefined();

    render(
      <AppConfigProvider
        value={{
          featureFlags: {
            devToolsEnabled: false,
            dropPositionMechanicEnabled: false,
          },
          prizeProvider,
        }}
      >
        <App />
      </AppConfigProvider>
    );

    // Wait for start button
    const startButton = await screen.findByTestId('drop-ball-button', undefined, {
      timeout: 5000,
    });

    // Start game
    await user.click(startButton);

    // Wait for reveal
    await screen.findByText(/Special Offer!/i, undefined, { timeout: 12000 });

    // Verify purchase offer data is present
    expect(screen.getByText(/200% SPECIAL DEAL/i)).toBeInTheDocument();
  });

  it('should NOT display FreeRewardView for purchase offers', async () => {
    const user = userEvent.setup();
    const fixture = getPrizeFixture('purchaseScenario');
    const prizeProvider = createFixturePrizeProvider(fixture);

    render(
      <AppConfigProvider
        value={{
          featureFlags: {
            devToolsEnabled: false,
            dropPositionMechanicEnabled: false,
          },
          prizeProvider,
        }}
      >
        <App />
      </AppConfigProvider>
    );

    // Wait for start button
    const startButton = await screen.findByTestId('drop-ball-button', undefined, {
      timeout: 5000,
    });

    // Start game
    await user.click(startButton);

    // Wait for reveal
    await screen.findByText(/Special Offer!/i, undefined, { timeout: 12000 });

    // Should NOT show "You Won!" text from FreeRewardView
    expect(screen.queryByText(/You Won!/i)).not.toBeInTheDocument();

    // Should NOT show "Claim Prize" button from FreeRewardView
    const button = screen.getByTestId('claim-prize-button');
    expect(button).not.toHaveTextContent(/Claim Prize/i);
  });
});
