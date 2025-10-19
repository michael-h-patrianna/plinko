import { describe, expect, it } from 'vitest';
import {
  createDefaultGradient,
  parseGradient,
  serializeGradient,
} from '../../gradientParser';
import type { GradientData } from '../../types';

describe('parseGradient', () => {
  it('should parse a simple gradient', () => {
    const result = parseGradient(
      'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)'
    );

    expect(result.angle).toBe(90);
    expect(result.stops).toHaveLength(2);
    expect(result.stops[0].color).toBe('#ff0000');
    expect(result.stops[0].position).toBe(0);
    expect(result.stops[1].color).toBe('#0000ff');
    expect(result.stops[1].position).toBe(100);
  });

  it('should parse gradient with directional keyword', () => {
    const result = parseGradient('linear-gradient(to right, red, blue)');

    expect(result.angle).toBe(0);
    expect(result.stops).toHaveLength(2);
  });

  it('should handle gradient without explicit positions', () => {
    const result = parseGradient('linear-gradient(90deg, red, green, blue)');

    expect(result.stops).toHaveLength(3);
    expect(result.stops[0].position).toBe(0);
    expect(result.stops[1].position).toBe(50);
    expect(result.stops[2].position).toBe(100);
  });

  it('should return default gradient for invalid input', () => {
    const result = parseGradient('invalid-gradient');

    expect(result.stops).toHaveLength(2);
    expect(result.angle).toBeDefined();
  });

  it('should parse gradient with multiple stops', () => {
    const result = parseGradient(
      'linear-gradient(45deg, #ff0000 0%, #00ff00 33%, #0000ff 66%, #ffff00 100%)'
    );

    expect(result.angle).toBe(45);
    expect(result.stops).toHaveLength(4);
  });

  it('should handle gradient with rgba colors', () => {
    const result = parseGradient(
      'linear-gradient(90deg, rgba(255,0,0,0.5) 0%, rgba(0,0,255,1) 100%)'
    );

    expect(result.stops).toHaveLength(2);
    expect(result.stops[0].color).toContain('rgba');
  });
});

describe('serializeGradient', () => {
  it('should serialize gradient to CSS string', () => {
    const gradient: GradientData = {
      angle: 90,
      stops: [
        { id: '1', color: '#667eea', position: 0 },
        { id: '2', color: '#764ba2', position: 100 },
      ],
    };

    const result = serializeGradient(gradient);

    expect(result).toContain('linear-gradient');
    // 90deg should be converted to "to bottom"
    expect(result).toContain('to bottom');
    expect(result).toContain('%');
  });

  it('should use direction keyword when applicable', () => {
    const gradient = {
      angle: 90,
      stops: [
        { id: '1', color: '#ff0000', position: 0 },
        { id: '2', color: '#0000ff', position: 100 },
      ],
    };

    const result = serializeGradient(gradient, 'hex');
    expect(result).toContain('to bottom');
  });

  it('should format colors according to specified format', () => {
    const gradient = {
      angle: 0,
      stops: [
        { id: '1', color: '#ff0000', position: 0 },
        { id: '2', color: '#0000ff', position: 100 },
      ],
    };

    const hexResult = serializeGradient(gradient, 'hex');
    expect(hexResult).toContain('#');

    const rgbResult = serializeGradient(gradient, 'rgb');
    expect(rgbResult).toContain('rgb');
  });

  it('should sort stops by position', () => {
    const gradient = {
      angle: 90,
      stops: [
        { id: '1', color: '#ff0000', position: 100 },
        { id: '2', color: '#0000ff', position: 0 },
        { id: '3', color: '#00ff00', position: 50 },
      ],
    };

    const result = serializeGradient(gradient, 'hex');
    const positions = result.match(/\d+%/g);
    expect(positions).toBeTruthy();
    if (positions) {
      const values = positions.map((p: string) => parseInt(p));
      expect(values[0]).toBeLessThan(values[1]);
      expect(values[1]).toBeLessThan(values[2]);
    }
  });
});

describe('createDefaultGradient', () => {
  it('should create a default gradient with 2 stops', () => {
    const gradient = createDefaultGradient();

    expect(gradient.stops).toHaveLength(2);
    expect(gradient.angle).toBe(90);
    expect(gradient.stops[0].position).toBe(0);
    expect(gradient.stops[1].position).toBe(100);
  });
});
