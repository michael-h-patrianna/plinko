/**
 * Integration tests for App component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from './testUtils';
import userEvent from '@testing-library/user-event';
import { App } from '../App';

// Mock window.location.search for deterministic seed
beforeEach(() => {
  const location = window.location;
  Object.defineProperty(window, 'location', {
    value: {
      href: location.href,
      origin: location.origin,
      protocol: location.protocol,
      host: location.host,
      hostname: location.hostname,
      port: location.port,
      pathname: location.pathname,
      search: '?seed=99999',
      hash: location.hash,
    },
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App Integration', () => {
  it('should render popup container', () => {
    render(<App />);
    expect(screen.getByTestId('popup-container')).toBeInTheDocument();
  });

  it('should show start screen initially', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Plinko Popup')).toBeInTheDocument();
    });

    expect(screen.getByTestId('drop-ball-button')).toBeInTheDocument();
  });

  it('should display prize table on start screen', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Available Prizes/i)).toBeInTheDocument();
    });
  });

  it('should start game when drop ball button clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('drop-ball-button')).toBeInTheDocument();
    });

    const dropButton = screen.getByTestId('drop-ball-button');
    await user.click(dropButton);

    // Start screen should disappear
    await waitFor(
      () => {
        expect(screen.queryByText('Plinko Popup')).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Ball should appear during countdown or dropping phase
    await waitFor(
      () => {
        // Ball may be in launcher during countdown, so check for board or ball
        const board = screen.queryByTestId('plinko-board');
        expect(board).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  // Note: Full animation tests are in Playwright E2E tests
  // Vitest/jsdom doesn't handle requestAnimationFrame reliably for long animations
});
