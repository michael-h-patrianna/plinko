/**
 * Unit tests for GradientText component
 * Tests cross-platform gradient text rendering
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GradientText } from '../../../components/ui/GradientText';

describe('GradientText', () => {
  describe('Rendering', () => {
    it('should render children text content', () => {
      render(
        <GradientText gradient={{ colors: ['#FF0000', '#0000FF'] }}>
          Hello World
        </GradientText>
      );

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should render numeric content', () => {
      render(
        <GradientText gradient={{ colors: ['#FFD700', '#FFA500'] }}>
          3
        </GradientText>
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render complex children', () => {
      render(
        <GradientText gradient={{ colors: ['#00FF00', '#0000FF'] }}>
          <span>GO!</span>
        </GradientText>
      );

      expect(screen.getByText('GO!')).toBeInTheDocument();
    });
  });

  describe('Gradient Styling', () => {
    it('should apply linear gradient with default angle', () => {
      const { container } = render(
        <GradientText gradient={{ colors: ['#FF0000', '#0000FF'] }}>
          Text
        </GradientText>
      );

      const element = container.querySelector('div');
      expect(element).toHaveStyle({
        background: 'linear-gradient(135deg, #FF0000, #0000FF)',
      });
    });

    it('should apply linear gradient with custom angle', () => {
      const { container } = render(
        <GradientText gradient={{ colors: ['#FF0000', '#0000FF'], angle: 90 }}>
          Text
        </GradientText>
      );

      const element = container.querySelector('div');
      expect(element).toHaveStyle({
        background: 'linear-gradient(90deg, #FF0000, #0000FF)',
      });
    });

    it('should apply linear gradient with multiple colors', () => {
      const { container } = render(
        <GradientText
          gradient={{
            colors: ['#FF0000', '#00FF00', '#0000FF'],
            angle: 45,
          }}
        >
          Text
        </GradientText>
      );

      const element = container.querySelector('div');
      expect(element).toHaveStyle({
        background: 'linear-gradient(45deg, #FF0000, #00FF00, #0000FF)',
      });
    });

    it('should apply WebKit background-clip for gradient text effect', () => {
      const { container } = render(
        <GradientText gradient={{ colors: ['#FF0000', '#0000FF'] }}>
          Text
        </GradientText>
      );

      const element = container.querySelector('div') as HTMLElement;

      // Check that gradient clipping property is set via style API
      // JSDOM may normalize or strip some vendor-prefixed properties from the style attribute
      // but they should be accessible via the style object
      expect(element.style.backgroundClip).toBe('text');

      // Verify webkit text fill color was set (this is reliably serialized by JSDOM)
      const styleAttr = element.getAttribute('style') || '';
      expect(styleAttr).toContain('-webkit-text-fill-color: transparent');

      // Verify gradient background was applied
      expect(styleAttr).toContain('linear-gradient');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <GradientText
          gradient={{ colors: ['#FF0000', '#0000FF'] }}
          className="text-9xl font-black"
        >
          Text
        </GradientText>
      );

      const element = container.querySelector('div');
      expect(element).toHaveClass('text-9xl', 'font-black');
    });

    it('should merge custom styles with gradient styles', () => {
      const { container } = render(
        <GradientText
          gradient={{ colors: ['#FF0000', '#0000FF'] }}
          style={{ fontSize: '48px', fontWeight: 'bold', padding: '10px' }}
        >
          Text
        </GradientText>
      );

      const element = container.querySelector('div');
      expect(element).toHaveStyle({
        fontSize: '48px',
        fontWeight: 'bold',
        padding: '10px',
        // Gradient styles should still be present
        background: 'linear-gradient(135deg, #FF0000, #0000FF)',
      });
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should only use linear gradients (no radial or conic)', () => {
      const { container } = render(
        <GradientText gradient={{ colors: ['#FF0000', '#0000FF'] }}>
          Text
        </GradientText>
      );

      const element = container.querySelector('div') as HTMLElement;
      const background = element.style.background;

      // Verify it's a linear gradient
      expect(background).toMatch(/linear-gradient/);
      // Verify it's NOT radial or conic
      expect(background).not.toMatch(/radial-gradient/);
      expect(background).not.toMatch(/conic-gradient/);
    });

    it('should not use web-only CSS features (box-shadow, blur, etc.)', () => {
      const { container } = render(
        <GradientText
          gradient={{ colors: ['#FF0000', '#0000FF'] }}
          style={{ fontSize: '48px' }}
        >
          Text
        </GradientText>
      );

      const element = container.querySelector('div') as HTMLElement;

      // Verify no forbidden RN-incompatible properties
      // In JSDOM, unset properties can be '' or undefined
      expect(element.style.boxShadow || '').toBe('');
      expect(element.style.textShadow || '').toBe('');
      expect(element.style.filter || '').toBe('');
      // backdropFilter is undefined in JSDOM
      expect(element.style.backdropFilter || '').toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single color gradient', () => {
      const { container } = render(
        <GradientText gradient={{ colors: ['#FF0000'] }}>
          Text
        </GradientText>
      );

      const element = container.querySelector('div') as HTMLElement;
      // Single color gradients are valid syntax but browsers may normalize them
      // Just verify the component renders without error and has gradient properties
      expect(element).toBeInTheDocument();
      expect(element.style.backgroundClip).toBe('text');

      // Verify webkit text fill color is set (reliably serialized by JSDOM)
      const styleAttr = element.getAttribute('style') || '';
      expect(styleAttr).toContain('-webkit-text-fill-color: transparent');
    });

    it('should handle empty children', () => {
      const { container } = render(
        <GradientText gradient={{ colors: ['#FF0000', '#0000FF'] }}>
          {''}
        </GradientText>
      );

      const element = container.querySelector('div');
      expect(element).toBeInTheDocument();
      expect(element?.textContent).toBe('');
    });

    it('should handle angle of 0 degrees', () => {
      const { container } = render(
        <GradientText gradient={{ colors: ['#FF0000', '#0000FF'], angle: 0 }}>
          Text
        </GradientText>
      );

      const element = container.querySelector('div');
      expect(element).toHaveStyle({
        background: 'linear-gradient(0deg, #FF0000, #0000FF)',
      });
    });

    it('should handle angle of 360 degrees', () => {
      const { container } = render(
        <GradientText gradient={{ colors: ['#FF0000', '#0000FF'], angle: 360 }}>
          Text
        </GradientText>
      );

      const element = container.querySelector('div');
      expect(element).toHaveStyle({
        background: 'linear-gradient(360deg, #FF0000, #0000FF)',
      });
    });
  });

  describe('Integration with Theme', () => {
    it('should work with theme color values', () => {
      const themeColors = {
        primary: '#FF6347',
        secondary: '#4169E1',
      };

      const { container } = render(
        <GradientText
          gradient={{
            colors: [themeColors.primary, themeColors.secondary],
            angle: 135,
          }}
        >
          Themed Text
        </GradientText>
      );

      const element = container.querySelector('div');
      expect(element).toHaveStyle({
        background: 'linear-gradient(135deg, #FF6347, #4169E1)',
      });
    });

    it('should work with rgba color values', () => {
      const { container } = render(
        <GradientText
          gradient={{
            colors: ['rgba(255, 0, 0, 0.8)', 'rgba(0, 0, 255, 0.6)'],
          }}
        >
          Text
        </GradientText>
      );

      const element = container.querySelector('div');
      expect(element).toHaveStyle({
        background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.8), rgba(0, 0, 255, 0.6))',
      });
    });
  });
});
