import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '../../App';

describe('App claim flow', () => {
  it(
    'returns to start screen after claiming a prize',
    async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for initial prizes to load and start button to be enabled
    const startButton = await screen.findByTestId('drop-ball-button', undefined, {
      timeout: 5000,
    });
    await waitFor(() => expect(startButton).not.toBeDisabled(), { timeout: 5000 });
    await user.click(startButton);

    // Wait for claim button to appear after ball lands and prize reveals
    const claimButton = await screen.findByTestId('claim-prize-button', undefined, {
      timeout: 15000,
    });
    await user.click(claimButton);

    // Optionally handle close button if it exists (e.g., for purchase offers)
    let closeButton: HTMLElement | null = null;
    try {
      closeButton = await screen.findByTestId('close-button', undefined, {
        timeout: 4000,
      });
    } catch {
      closeButton = null;
    }

    if (closeButton) {
      await waitFor(() => expect(closeButton).toBeVisible());
      await user.click(closeButton);
    }

    // After claiming, game resets and loads new prizes asynchronously
    // Wait for start button to reappear AND be enabled (not disabled during loading)
    // This requires waiting for:
    // 1. The button to appear in the DOM
    // 2. The async prize load to complete (isLoadingPrizes becomes false)
    // 3. The button to be enabled and visible
    await waitFor(
      async () => {
        const resetButton = await screen.findByTestId('drop-ball-button');
        expect(resetButton).toBeVisible();
        expect(resetButton).not.toBeDisabled();
      },
      { timeout: 15000 }
    );
    },
    30000
  ); // 30 second timeout for full flow including async prize loading
});
