import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SolidColorEditor } from '../../SolidColorEditor';
import type { SolidColorData } from '../../types';

describe('SolidColorEditor', () => {
  const defaultSolidColor: SolidColorData = {
    color: '#ff0000',
    alpha: 0.8,
  };

  const defaultProps = {
    solidColor: defaultSolidColor,
    onColorChange: vi.fn(),
  };

  it('should render color space selector with HSV and HSL options', () => {
    render(<SolidColorEditor {...defaultProps} />);

    expect(screen.getByRole('button', { name: /hsv/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hsl/i })).toBeInTheDocument();
  });

  it('should default to HSV color space', () => {
    render(<SolidColorEditor {...defaultProps} />);

    const hsvButton = screen.getByRole('button', { name: /hsv/i });
    expect(hsvButton).toHaveClass(/active/i);
  });

  it('should switch to HSL color space when clicked', async () => {
    const user = userEvent.setup();
    render(<SolidColorEditor {...defaultProps} />);

    const hslButton = screen.getByRole('button', { name: /hsl/i });
    await user.click(hslButton);

    expect(hslButton).toHaveClass(/active/i);
  });

  it('should render ColorSpaceCanvas', () => {
    render(<SolidColorEditor {...defaultProps} />);

    // ColorSpaceCanvas should be present
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render HueSlider', () => {
    render(<SolidColorEditor {...defaultProps} />);

    const hueSlider = screen.getByTestId('hue-slider');
    expect(hueSlider).toBeInTheDocument();
  });

  it('should render AlphaSlider', () => {
    render(<SolidColorEditor {...defaultProps} />);

    const alphaSlider = screen.getByTestId('alpha-slider');
    expect(alphaSlider).toBeInTheDocument();
  });

  it('should display correct alpha value in AlphaSlider', () => {
    render(<SolidColorEditor {...defaultProps} />);

    const alphaSlider = screen.getByTestId('alpha-slider');
    expect(alphaSlider).toHaveAttribute('data-alpha', '0.8');
  });

  it('should call onColorChange when hue changes', async () => {
    const user = userEvent.setup();
    const onColorChange = vi.fn();

    render(<SolidColorEditor {...defaultProps} onColorChange={onColorChange} />);

    const hueSlider = screen.getByTestId('hue-slider');
    await user.click(hueSlider);

    await waitFor(() => {
      expect(onColorChange).toHaveBeenCalled();
    });
  });

  it('should call onColorChange when alpha changes', async () => {
    const user = userEvent.setup();
    const onColorChange = vi.fn();

    render(<SolidColorEditor {...defaultProps} onColorChange={onColorChange} />);

    const alphaSlider = screen.getByTestId('alpha-slider');
    await user.click(alphaSlider);

    await waitFor(() => {
      expect(onColorChange).toHaveBeenCalled();
    });
  });

  it('should preserve color when changing alpha', async () => {
    const user = userEvent.setup();
    const onColorChange = vi.fn();

    render(<SolidColorEditor {...defaultProps} onColorChange={onColorChange} />);

    const alphaSlider = screen.getByTestId('alpha-slider');
    await user.click(alphaSlider);

    await waitFor(() => {
      expect(onColorChange).toHaveBeenCalled();
      const newValue = onColorChange.mock.calls[0][0];
      expect(newValue.color).toBe(defaultSolidColor.color);
      expect(newValue.alpha).not.toBe(defaultSolidColor.alpha);
    });
  });

  it('should handle different initial colors', () => {
    const blueColor: SolidColorData = {
      color: '#0000ff',
      alpha: 0.5,
    };

    render(<SolidColorEditor solidColor={blueColor} onColorChange={vi.fn()} />);

    const alphaSlider = screen.getByTestId('alpha-slider');
    expect(alphaSlider).toHaveAttribute('data-alpha', '0.5');
  });

  it('should handle alpha of 1 (fully opaque)', () => {
    const opaqueColor: SolidColorData = {
      color: '#00ff00',
      alpha: 1,
    };

    render(<SolidColorEditor solidColor={opaqueColor} onColorChange={vi.fn()} />);

    const alphaSlider = screen.getByTestId('alpha-slider');
    expect(alphaSlider).toHaveAttribute('data-alpha', '1');
  });

  it('should handle alpha of 0 (fully transparent)', () => {
    const transparentColor: SolidColorData = {
      color: '#ffff00',
      alpha: 0,
    };

    render(<SolidColorEditor solidColor={transparentColor} onColorChange={vi.fn()} />);

    const alphaSlider = screen.getByTestId('alpha-slider');
    expect(alphaSlider).toHaveAttribute('data-alpha', '0');
  });

  it('should maintain color space selection when color changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SolidColorEditor {...defaultProps} />);

    // Switch to HSL
    const hslButton = screen.getByRole('button', { name: /hsl/i });
    await user.click(hslButton);

    expect(hslButton).toHaveClass(/active/i);

    // Change color
    const newColor: SolidColorData = {
      color: '#00ff00',
      alpha: 0.6,
    };
    rerender(<SolidColorEditor solidColor={newColor} onColorChange={vi.fn()} />);

    // HSL should still be selected
    expect(hslButton).toHaveClass(/active/i);
  });

  it('should render with grayscale color', () => {
    const grayColor: SolidColorData = {
      color: '#808080',
      alpha: 1,
    };

    render(<SolidColorEditor solidColor={grayColor} onColorChange={vi.fn()} />);

    expect(screen.getByTestId('hue-slider')).toBeInTheDocument();
    expect(screen.getByTestId('alpha-slider')).toBeInTheDocument();
  });

  it('should handle black color', () => {
    const blackColor: SolidColorData = {
      color: '#000000',
      alpha: 1,
    };

    render(<SolidColorEditor solidColor={blackColor} onColorChange={vi.fn()} />);

    expect(screen.getByTestId('hue-slider')).toBeInTheDocument();
  });

  it('should handle white color', () => {
    const whiteColor: SolidColorData = {
      color: '#ffffff',
      alpha: 1,
    };

    render(<SolidColorEditor solidColor={whiteColor} onColorChange={vi.fn()} />);

    expect(screen.getByTestId('hue-slider')).toBeInTheDocument();
  });
});
