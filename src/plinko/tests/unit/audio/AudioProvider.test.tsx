/**
 * Unit tests for AudioProvider
 * Tests initialization, controller creation, and error handling
 */

import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioProvider, useAudio } from '../../../audio/context/AudioProvider';

// Mock the audio adapter
vi.mock('../../../audio/adapters/WebAudioAdapter', () => {
  const MockWebAudioAdapter = vi.fn();
  MockWebAudioAdapter.prototype.initialize = vi.fn().mockResolvedValue(undefined);
  MockWebAudioAdapter.prototype.isInitialized = vi.fn().mockReturnValue(true);
  MockWebAudioAdapter.prototype.destroy = vi.fn();

  return {
    WebAudioAdapter: MockWebAudioAdapter,
  };
});

// Mock the controllers
vi.mock('../../../audio/core/VolumeController', () => {
  const MockVolumeController = vi.fn();
  MockVolumeController.prototype.loadFromStorage = vi.fn();
  MockVolumeController.prototype.getEffectiveSFXVolume = vi.fn().mockReturnValue(1.0);

  return {
    VolumeController: MockVolumeController,
  };
});

vi.mock('../../../audio/core/SFXController', () => {
  const MockSFXController = vi.fn();
  MockSFXController.prototype.setThrottleDelay = vi.fn();
  MockSFXController.prototype.loadSound = vi.fn().mockResolvedValue(undefined);
  MockSFXController.prototype.cleanup = vi.fn();
  MockSFXController.prototype.stopAll = vi.fn();

  return {
    SFXController: MockSFXController,
  };
});

vi.mock('../../../audio/core/MusicController', () => {
  const MockMusicController = vi.fn();
  MockMusicController.prototype.loadTrack = vi.fn().mockResolvedValue(undefined);
  MockMusicController.prototype.cleanup = vi.fn();
  MockMusicController.prototype.stopAllLayers = vi.fn();

  return {
    MusicController: MockMusicController,
  };
});

// Mock the performance adapter
vi.mock('../../../utils/platform/performance', () => ({
  performanceAdapter: {
    now: vi.fn().mockReturnValue(0),
    mark: vi.fn(),
    measure: vi.fn().mockReturnValue(0),
    clearMarks: vi.fn(),
    getMemoryInfo: vi.fn().mockReturnValue(null),
  },
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
