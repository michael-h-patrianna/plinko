/**
 * Integration tests for App component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
      hash: location.hash
    },
    writable: true
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
    await waitFor(() => {
      expect(screen.queryByText('Plinko Popup')).not.toBeInTheDocument();
    });

    // Ball should appear
    await waitFor(() => {
      expect(screen.getByTestId('plinko-ball')).toBeInTheDocument();
    });
  });

  // Note: Full animation tests are in Playwright E2E tests
  // Vitest/jsdom doesn't handle requestAnimationFrame reliably for long animations
});
