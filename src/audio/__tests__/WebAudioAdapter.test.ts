import { Howl, Howler } from 'howler';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebAudioAdapter } from '../adapters/WebAudioAdapter';

// Mock Howler
vi.mock('howler', () => {
  const mockVolumeFn = vi.fn();
  const mockMuteFn = vi.fn();

  return {
    Howler: {
      autoUnlock: false,
      usingWebAudio: false,
      volume: mockVolumeFn,
      mute: mockMuteFn,
    },
    Howl: vi.fn(),
  };
});

describe('WebAudioAdapter - Initialization', () => {
  let adapter: WebAudioAdapter;

  beforeEach(() => {
    adapter = new WebAudioAdapter();
    vi.clearAllMocks();
  });

  afterEach(() => {
    adapter.destroy();
  });

  it('should initialize successfully', async () => {
    expect(adapter.isInitialized()).toBe(false);

    await adapter.initialize();

    expect(adapter.isInitialized()).toBe(true);
    expect(Howler.autoUnlock).toBe(true);
    expect(Howler.usingWebAudio).toBe(true);
  });

  it('should not initialize twice', async () => {
    await adapter.initialize();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const volumeFn = vi.mocked(Howler.volume);
    const firstCall = volumeFn.mock.calls.length;

    await adapter.initialize();
    const secondCall = volumeFn.mock.calls.length;

    expect(secondCall).toBe(firstCall); // No additional calls
  });

  it('should set global volume', async () => {
    await adapter.initialize();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const volumeFn = vi.mocked(Howler.volume);

    adapter.setGlobalVolume(0.5);

    expect(volumeFn).toHaveBeenCalledWith(0.5);
  });

  it('should clamp volume between 0 and 1', async () => {
    await adapter.initialize();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const volumeFn = vi.mocked(Howler.volume);

    adapter.setGlobalVolume(1.5);
    expect(volumeFn).toHaveBeenCalledWith(1.0);

    adapter.setGlobalVolume(-0.5);
    expect(volumeFn).toHaveBeenCalledWith(0.0);
  });

  it('should mute and unmute audio', async () => {
    await adapter.initialize();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const muteFn = vi.mocked(Howler.mute);

    expect(adapter.isMuted()).toBe(false);

    adapter.mute();
    expect(adapter.isMuted()).toBe(true);
    expect(muteFn).toHaveBeenCalledWith(true);

    adapter.unmute();
    expect(adapter.isMuted()).toBe(false);
    expect(muteFn).toHaveBeenCalledWith(false);
  });

  it('should clean up on destroy', async () => {
    await adapter.initialize();

    adapter.destroy();

    expect(adapter.isInitialized()).toBe(false);
  });
});

describe('WebAudioAdapter - Music', () => {
  let adapter: WebAudioAdapter;
  let mockHowlInstance: {
    play: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    volume: ReturnType<typeof vi.fn>;
    fade: ReturnType<typeof vi.fn>;
    playing: ReturnType<typeof vi.fn>;
    unload: ReturnType<typeof vi.fn>;
  };
  let onloadCallback: (() => void) | undefined;

  beforeEach(async () => {
    adapter = new WebAudioAdapter();
    await adapter.initialize();

    // Mock Howl instance methods
    mockHowlInstance = {
      play: vi.fn(),
      stop: vi.fn(),
      volume: vi.fn().mockReturnValue(0.8),
      fade: vi.fn(),
      playing: vi.fn().mockReturnValue(false),
      unload: vi.fn(),
    };

    // Setup Howl mock to capture onload and return mockHowl
    vi.mocked(Howl).mockImplementation(((config: { onload?: () => void }) => {
      onloadCallback = config.onload;
      return mockHowlInstance;
    }) as never);
  });

  afterEach(() => {
    adapter.destroy();
    vi.clearAllMocks();
  });

  it('should load music track', async () => {
    const loadPromise = adapter.loadMusic('test-music', '/audio/test.mp3', true);

    // Simulate successful load
    if (onloadCallback) {
      onloadCallback();
    }

    await loadPromise;

    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/audio/test.mp3'],
        loop: true,
        preload: true,
      })
    );
  });

  it('should play music without fade', async () => {
    const loadPromise = adapter.loadMusic('test', '/test.mp3', false);
    if (onloadCallback) onloadCallback();
    await loadPromise;

    adapter.playMusic('test');

    expect(mockHowlInstance.play).toHaveBeenCalled();
    expect(mockHowlInstance.fade).not.toHaveBeenCalled();
  });

  it('should play music with fade-in', async () => {
    const loadPromise = adapter.loadMusic('test', '/test.mp3', false);
    if (onloadCallback) onloadCallback();
    await loadPromise;

    adapter.playMusic('test', 1000);

    expect(mockHowlInstance.volume).toHaveBeenCalledWith(0);
    expect(mockHowlInstance.play).toHaveBeenCalled();
    expect(mockHowlInstance.fade).toHaveBeenCalledWith(0, 1.0, 1000);
  });

  it('should stop music with fade-out', async () => {
    vi.useFakeTimers();

    const loadPromise = adapter.loadMusic('test', '/test.mp3', false);
    if (onloadCallback) onloadCallback();
    await loadPromise;

    adapter.stopMusic('test', 500);

    expect(mockHowlInstance.fade).toHaveBeenCalledWith(0.8, 0, 500);

    vi.advanceTimersByTime(500);
    expect(mockHowlInstance.stop).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should set music volume', async () => {
    const loadPromise = adapter.loadMusic('test', '/test.mp3', false);
    if (onloadCallback) onloadCallback();
    await loadPromise;

    adapter.setMusicVolume('test', 0.5);

    expect(mockHowlInstance.volume).toHaveBeenCalledWith(0.5);
  });

  it('should report playing state', async () => {
    mockHowlInstance.playing.mockReturnValue(true);

    const loadPromise = adapter.loadMusic('test', '/test.mp3', false);
    if (onloadCallback) onloadCallback();
    await loadPromise;

    expect(adapter.isMusicPlaying('test')).toBe(true);
  });

  it('should handle playing unloaded track', () => {
    adapter.playMusic('not-loaded');

    expect(mockHowlInstance.play).not.toHaveBeenCalled();
  });
});

describe('WebAudioAdapter - SFX', () => {
  let adapter: WebAudioAdapter;
  let mockHowlInstance: {
    play: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    volume: ReturnType<typeof vi.fn>;
    rate: ReturnType<typeof vi.fn>;
    unload: ReturnType<typeof vi.fn>;
  };
  let onloadCallback: (() => void) | undefined;

  beforeEach(async () => {
    adapter = new WebAudioAdapter();
    await adapter.initialize();

    // Mock Howl instance methods
    mockHowlInstance = {
      play: vi.fn(() => 123), // Return mock playback ID
      stop: vi.fn(),
      pause: vi.fn(),
      volume: vi.fn(),
      rate: vi.fn(),
      unload: vi.fn(),
    };

    // Setup Howl mock to capture onload and return mockHowl
    vi.mocked(Howl).mockImplementation(((config: { onload?: () => void }) => {
      onloadCallback = config.onload;
      return mockHowlInstance;
    }) as never);
  });

  afterEach(() => {
    adapter.destroy();
    vi.clearAllMocks();
  });

  it('should load SFX', async () => {
    const loadPromise = adapter.loadSFX('test-sfx', '/audio/sfx.mp3');
    if (onloadCallback) onloadCallback();
    await loadPromise;

    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/audio/sfx.mp3'],
        preload: true,
      })
    );

    expect(adapter.isLoaded('test-sfx')).toBe(true);
  });

  it('should play SFX without options', async () => {
    const loadPromise = adapter.loadSFX('test', '/test.mp3');
    if (onloadCallback) onloadCallback();
    await loadPromise;

    const playbackId = adapter.playSFX('test');

    expect(mockHowlInstance.play).toHaveBeenCalled();
    expect(playbackId).toBe(123);
  });

  it('should play SFX with volume', async () => {
    const loadPromise = adapter.loadSFX('test', '/test.mp3');
    if (onloadCallback) onloadCallback();
    await loadPromise;

    adapter.playSFX('test', { volume: 0.5 });

    expect(mockHowlInstance.volume).toHaveBeenCalledWith(0.5, 123);
  });

  it('should play SFX with pitch variation', async () => {
    const loadPromise = adapter.loadSFX('test', '/test.mp3');
    if (onloadCallback) onloadCallback();
    await loadPromise;

    adapter.playSFX('test', { pitch: 0.2 });

    // pitch 0.2 = rate 1.2
    expect(mockHowlInstance.rate).toHaveBeenCalledWith(1.2, 123);
  });

  it('should clamp pitch to reasonable range', async () => {
    const loadPromise = adapter.loadSFX('test', '/test.mp3');
    if (onloadCallback) onloadCallback();
    await loadPromise;

    // Extreme pitch should be clamped
    adapter.playSFX('test', { pitch: 5.0 });
    expect(mockHowlInstance.rate).toHaveBeenCalledWith(2.0, 123); // Max 2.0

    adapter.playSFX('test', { pitch: -5.0 });
    expect(mockHowlInstance.rate).toHaveBeenCalledWith(0.5, 123); // Min 0.5
  });

  it('should play SFX with delay', async () => {
    vi.useFakeTimers();

    const loadPromise = adapter.loadSFX('test', '/test.mp3');
    if (onloadCallback) onloadCallback();
    await loadPromise;

    adapter.playSFX('test', { delay: 500 });

    expect(mockHowlInstance.pause).toHaveBeenCalledWith(123);

    vi.advanceTimersByTime(500);
    expect(mockHowlInstance.play).toHaveBeenCalledWith('123');

    vi.useRealTimers();
  });

  it('should stop specific SFX instance', async () => {
    const loadPromise = adapter.loadSFX('test', '/test.mp3');
    if (onloadCallback) onloadCallback();
    await loadPromise;

    const playbackId = adapter.playSFX('test');

    adapter.stopSFX(playbackId);

    expect(mockHowlInstance.stop).toHaveBeenCalledWith(123);
  });

  it('should stop all SFX instances', async () => {
    const loadPromise = adapter.loadSFX('test', '/test.mp3');
    if (onloadCallback) onloadCallback();
    await loadPromise;

    adapter.stopAllSFX('test');

    expect(mockHowlInstance.stop).toHaveBeenCalled();
  });

  it('should handle playing non-existent SFX gracefully', () => {
    const playbackId = adapter.playSFX('non-existent');

    expect(playbackId).toBe(-1);
  });
});
