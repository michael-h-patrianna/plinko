import { describe, expect, it } from 'vitest';
import { parseSolidColor, serializeSolidColor } from '../../colorParser';
import type { SolidColorData } from '../../types';

describe('colorParser', () => {
  describe('parseSolidColor', () => {
    it('should parse hex color without alpha', () => {
      const result = parseSolidColor('#ff0000');
      expect(result).toEqual({
        color: '#ff0000',
        alpha: 1,
      });
    });

    it('should parse hex color with alpha', () => {
      const result = parseSolidColor('#ff0000');
      expect(result.color).toBe('#ff0000');
      expect(result.alpha).toBe(1);
    });

    it('should parse rgb color', () => {
      const result = parseSolidColor('rgb(255, 0, 0)');
      expect(result.color).toBe('#ff0000');
      expect(result.alpha).toBe(1);
    });

    it('should parse rgba color and extract alpha', () => {
      const result = parseSolidColor('rgba(255, 0, 0, 0.5)');
      expect(result.color).toBe('#ff0000');
      expect(result.alpha).toBe(0.5);
    });

    it('should parse hsl color', () => {
      const result = parseSolidColor('hsl(0, 100%, 50%)');
      expect(result.color).toBe('#ff0000');
      expect(result.alpha).toBe(1);
    });

    it('should parse hsla color and extract alpha', () => {
      const result = parseSolidColor('hsla(0, 100%, 50%, 0.75)');
      expect(result.color).toBe('#ff0000');
      expect(result.alpha).toBe(0.75);
    });

    it('should handle shorthand hex', () => {
      const result = parseSolidColor('#f00');
      expect(result.color).toBe('#ff0000');
      expect(result.alpha).toBe(1);
    });

    it('should default to white for invalid color', () => {
      const result = parseSolidColor('invalid-color');
      expect(result).toEqual({
        color: '#ffffff',
        alpha: 1,
      });
    });

    it('should parse named colors', () => {
      const result = parseSolidColor('red');
      expect(result.color).toBe('#ff0000');
      expect(result.alpha).toBe(1);
    });

    it('should handle colors with spaces', () => {
      const result = parseSolidColor('  rgb(0, 255, 0)  ');
      expect(result.color).toBe('#00ff00');
      expect(result.alpha).toBe(1);
    });
  });

  describe('serializeSolidColor', () => {
    const solidColor: SolidColorData = {
      color: '#ff0000',
      alpha: 0.8,
    };

    it('should serialize to hex with alpha < 1', () => {
      const result = serializeSolidColor(solidColor, 'hex');
      expect(result).toBe('rgba(255, 0, 0, 0.8)');
    });

    it('should serialize to hex without alpha when alpha is 1', () => {
      const fullAlpha: SolidColorData = {
        color: '#ff0000',
        alpha: 1,
      };
      const result = serializeSolidColor(fullAlpha, 'hex');
      expect(result).toBe('#ff0000');
    });

    it('should serialize to rgb format', () => {
      const result = serializeSolidColor(solidColor, 'rgb');
      expect(result).toBe('rgba(255, 0, 0, 0.8)');
    });

    it('should serialize to hsl format', () => {
      const result = serializeSolidColor(solidColor, 'hsl');
      expect(result).toMatch(/^hsla\(\d+,\s*\d+%,\s*\d+%,\s*0\.8\)$/);
    });

    it('should default to hex format when not specified', () => {
      const fullAlpha: SolidColorData = {
        color: '#00ff00',
        alpha: 1,
      };
      const result = serializeSolidColor(fullAlpha);
      expect(result).toBe('#00ff00');
    });

    it('should handle alpha of 0', () => {
      const transparent: SolidColorData = {
        color: '#ff0000',
        alpha: 0,
      };
      const result = serializeSolidColor(transparent, 'rgb');
      expect(result).toBe('rgba(255, 0, 0, 0)');
    });

    it('should handle various colors', () => {
      const blueColor: SolidColorData = {
        color: '#0000ff',
        alpha: 0.5,
      };
      const result = serializeSolidColor(blueColor, 'rgb');
      expect(result).toBe('rgba(0, 0, 255, 0.5)');
    });

    it('should return fallback for invalid color', () => {
      const invalidColor: SolidColorData = {
        color: 'not-a-color',
        alpha: 1,
      };
      const result = serializeSolidColor(invalidColor, 'rgb');
      expect(result).toBe('rgba(255, 255, 255, 1)');
    });
  });

  describe('roundtrip conversion', () => {
    it('should preserve color through parse and serialize', () => {
      const original = 'rgba(128, 64, 192, 0.6)';
      const parsed = parseSolidColor(original);
      const serialized = serializeSolidColor(parsed, 'rgb');

      // Parse again to compare
      const reparsed = parseSolidColor(serialized);
      expect(reparsed.alpha).toBe(parsed.alpha);
      // Colors should be equivalent
      expect(reparsed.color).toBe(parsed.color);
    });

    it('should preserve hex colors', () => {
      const original = '#8040c0';
      const parsed = parseSolidColor(original);
      expect(parsed.color).toBe('#8040c0');
      expect(parsed.alpha).toBe(1);

      const serialized = serializeSolidColor(parsed, 'hex');
      expect(serialized).toBe('#8040c0');
    });
  });
});
