/**
 * Unit tests for SoundToggle component
 * Tests audio muting/unmuting functionality, accessibility, and persistence
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SoundToggle } from '@/components/controls/SoundToggle';
import { AudioProvider } from '@/audio/context/AudioProvider';
import { ThemeProvider } from '@/theme';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test wrapper with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AudioProvider>{children}</AudioProvider>
    </ThemeProvider>
  );
}

describe('SoundToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the sound toggle button', async () => {
    render(
      <TestWrapper>
        <SoundToggle />
      </TestWrapper>
    );

    // Wait for audio system to initialize
    await waitFor(
      () => {
        const button = screen.queryByTestId('sound-toggle');
        expect(button).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('has correct accessibility attributes when unmuted', async () => {
    render(
      <TestWrapper>
        <SoundToggle />
      </TestWrapper>
    );

    await waitFor(
      () => {
        const button = screen.getByTestId('sound-toggle');
        expect(button).toHaveAttribute('aria-label', 'Mute sound');
        expect(button).toHaveAttribute('aria-pressed', 'false');
      },
      { timeout: 3000 }
    );
  });

  it('toggles mute state when clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SoundToggle />
      </TestWrapper>
    );

    const button = await waitFor(
      () => {
        const btn = screen.getByTestId('sound-toggle');
        expect(btn).toBeInTheDocument();
        return btn;
      },
      { timeout: 3000 }
    );

    // Initially unmuted
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Click to mute
    await user.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('aria-label', 'Unmute sound');
    });

    // Click to unmute
    await user.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('aria-label', 'Mute sound');
    });
  });

  it('persists mute state to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SoundToggle />
      </TestWrapper>
    );

    const button = await waitFor(
      () => {
        const btn = screen.getByTestId('sound-toggle');
        expect(btn).toBeInTheDocument();
        return btn;
      },
      { timeout: 3000 }
    );

    // Click to mute
    await user.click(button);

    await waitFor(() => {
      const storedSettings = localStorage.getItem('plinko-audio-settings');
      expect(storedSettings).toBeTruthy();

      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        expect(settings.isMuted).toBe(true);
      }
    });
  });

  it('loads initial mute state from localStorage', async () => {
    // Pre-set localStorage with muted state
    localStorage.setItem(
      'plinko-audio-settings',
      JSON.stringify({
        masterVolume: 1.0,
        musicVolume: 1.0,
        sfxVolume: 1.0,
        isMuted: true,
      })
    );

    render(
      <TestWrapper>
        <SoundToggle />
      </TestWrapper>
    );

    await waitFor(
      () => {
        const button = screen.getByTestId('sound-toggle');
        expect(button).toHaveAttribute('aria-pressed', 'true');
        expect(button).toHaveAttribute('aria-label', 'Unmute sound');
      },
      { timeout: 3000 }
    );
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SoundToggle />
      </TestWrapper>
    );

    const button = await waitFor(
      () => {
        const btn = screen.getByTestId('sound-toggle');
        expect(btn).toBeInTheDocument();
        return btn;
      },
      { timeout: 3000 }
    );

    // Tab to button
    await user.tab();
    expect(button).toHaveFocus();

    // Press Enter to toggle
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    // Press Space to toggle again
    await user.keyboard(' ');

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  it('does not render before audio system is initialized', () => {
    // Create a version without AudioProvider (simulating uninitialized state)
    render(
      <ThemeProvider>
        <SoundToggle />
      </ThemeProvider>
    );

    const button = screen.queryByTestId('sound-toggle');
    expect(button).not.toBeInTheDocument();
  });
});
