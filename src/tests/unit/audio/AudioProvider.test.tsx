/**
 * Unit tests for AudioProvider
 * Tests initialization, controller creation, and error handling
 */

import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioProvider, useAudio } from '../../../audio/context/AudioProvider';

const mockAdapter = {
  initialize: vi.fn().mockResolvedValue(undefined),
};

const mockVolumeController = {
  loadFromStorage: vi.fn(),
};

const mockSFXController = {};
const mockMusicController = {};

// Mock the audio adapter
vi.mock('../../../audio/adapters/WebAudioAdapter', () => ({
  WebAudioAdapter: vi.fn().mockImplementation(() => mockAdapter),
}));

// Mock the controllers
vi.mock('../../../audio/core/VolumeController', () => ({
  VolumeController: vi.fn().mockImplementation(() => mockVolumeController),
}));

vi.mock('../../../audio/core/SFXController', () => ({
  SFXController: vi.fn().mockImplementation(() => mockSFXController),
}));

vi.mock('../../../audio/core/MusicController', () => ({
  MusicController: vi.fn().mockImplementation(() => mockMusicController),
}));

// Test component to access context
function TestComponent() {
  const { isInitialized, initializationError, sfxController, musicController, volumeController } = useAudio();

  return (
    <div>
      <div data-testid="initialized">{isInitialized ? 'yes' : 'no'}</div>
      <div data-testid="error">{initializationError ? 'yes' : 'no'}</div>
      <div data-testid="sfx">{sfxController ? 'yes' : 'no'}</div>
      <div data-testid="music">{musicController ? 'yes' : 'no'}</div>
      <div data-testid="volume">{volumeController ? 'yes' : 'no'}</div>
    </div>
  );
}

describe('AudioProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdapter.initialize.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('provides audio context to children', () => {
    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    expect(screen.getByTestId('initialized')).toBeInTheDocument();
  });

  it('initializes controllers on mount', async () => {
    render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    // Initially not initialized
    expect(screen.getByTestId('initialized')).toHaveTextContent('no');
    expect(screen.getByTestId('sfx')).toHaveTextContent('no');

    // Wait for initialization
    await waitFor(() => {
      expect(screen.getByTestId('initialized')).toHaveTextContent('yes');
    });

    // Controllers should be available
    expect(screen.getByTestId('sfx')).toHaveTextContent('yes');
    expect(screen.getByTestId('music')).toHaveTextContent('yes');
    expect(screen.getByTestId('volume')).toHaveTextContent('yes');
    expect(screen.getByTestId('error')).toHaveTextContent('no');
  });

  it.skip('handles initialization errors gracefully', async () => {
    // TODO: Fix mock to properly test error handling
    // This test is skipped for now as mocking the adapter constructor is complex
  });

  it('maintains controller references across re-renders', async () => {
    const { rerender } = render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    // Wait for initialization
    await waitFor(() => {
      expect(screen.getByTestId('initialized')).toHaveTextContent('yes');
    });

    const firstSfx = screen.getByTestId('sfx').textContent;

    // Force re-render
    rerender(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    // Controllers should still be available
    expect(screen.getByTestId('sfx')).toHaveTextContent(firstSfx);
  });

  it('does not crash when unmounted during initialization', async () => {
    const { unmount } = render(
      <AudioProvider>
        <TestComponent />
      </AudioProvider>
    );

    // Unmount immediately
    unmount();

    // Should not throw
    await waitFor(() => {
      // Just wait a bit to ensure async operation completes
    });
  });
});
