import { describe, expect, it } from 'vitest';
import type { SoundEffectId } from '../types';
import { createDefaultConfig } from '../utils/createDefaultConfig';

describe('createDefaultConfig', () => {
  it('should return default configuration', () => {
    const config = createDefaultConfig();

    expect(config.assetBasePath).toBe('/assets/audio');
    expect(config.defaultMasterVolume).toBe(1.0);
    expect(config.defaultMusicVolume).toBe(0.7);
    expect(config.defaultSFXVolume).toBe(0.66);
    expect(config.preloadCriticalOnly).toBe(true);
    expect(config.criticalSounds).toContain('countdown-go');
    expect(config.maxSimultaneousSounds).toBe(32);
    expect(config.pegHitPoolSize).toBe(10);
    expect(config.enableAdaptiveMusic).toBe(true);
    expect(config.enableMusicDucking).toBe(true);
    expect(config.enableHapticFeedback).toBe(false);
    expect(config.persistVolumeSettings).toBe(true);
    expect(config.storageKey).toBe('plinko-audio-settings');
  });

  it('should merge overrides with defaults', () => {
    const config = createDefaultConfig({
      defaultMasterVolume: 0.5,
      enableAdaptiveMusic: false,
      assetBasePath: '/custom/audio/path',
    });

    expect(config.defaultMasterVolume).toBe(0.5);
    expect(config.enableAdaptiveMusic).toBe(false);
    expect(config.assetBasePath).toBe('/custom/audio/path');

    // Defaults should remain
    expect(config.defaultMusicVolume).toBe(0.7);
    expect(config.maxSimultaneousSounds).toBe(32);
  });

  it('should include all critical sounds', () => {
    const config = createDefaultConfig();

    expect(config.criticalSounds).toHaveLength(8);
    expect(config.criticalSounds).toContain('countdown-3');
    expect(config.criticalSounds).toContain('countdown-2');
    expect(config.criticalSounds).toContain('countdown-1');
    expect(config.criticalSounds).toContain('countdown-go');
    expect(config.criticalSounds).toContain('ball-peg-hit');
    expect(config.criticalSounds).toContain('ball-wall-hit');
    expect(config.criticalSounds).toContain('ball-slot-hit');
    expect(config.criticalSounds).toContain('ui-button-press');
  });

  it('should allow overriding critical sounds list', () => {
    const customCriticalSounds: SoundEffectId[] = ['ui-button-press', 'countdown-go'];
    const config = createDefaultConfig({
      criticalSounds: customCriticalSounds,
    });

    expect(config.criticalSounds).toHaveLength(2);
    expect(config.criticalSounds).toEqual(customCriticalSounds);
  });

  it('should have valid volume ranges', () => {
    const config = createDefaultConfig();

    expect(config.defaultMasterVolume).toBeGreaterThanOrEqual(0);
    expect(config.defaultMasterVolume).toBeLessThanOrEqual(1);
    expect(config.defaultMusicVolume).toBeGreaterThanOrEqual(0);
    expect(config.defaultMusicVolume).toBeLessThanOrEqual(1);
    expect(config.defaultSFXVolume).toBeGreaterThanOrEqual(0);
    expect(config.defaultSFXVolume).toBeLessThanOrEqual(1);
  });

  it('should have reasonable performance defaults', () => {
    const config = createDefaultConfig();

    expect(config.maxSimultaneousSounds).toBeGreaterThan(0);
    expect(config.pegHitPoolSize).toBeGreaterThan(0);
  });
});
