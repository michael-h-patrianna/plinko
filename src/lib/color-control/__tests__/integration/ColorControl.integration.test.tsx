import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ColorControl } from '../../ColorControl';
import type { ColorValue } from '../../types';

describe('ColorControl Integration', () => {
  describe('Solid Color Mode', () => {
    const solidColorValue: ColorValue = {
      type: 'solid',
      data: {
        color: '#ff0000',
        alpha: 0.8,
      },
    };

    it('should render preview button with solid color', () => {
      render(<ColorControl value={solidColorValue} onChange={vi.fn()} />);

      const preview = screen.getByTestId('color-preview');
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute('aria-label', 'Edit color');
    });

    it('should open modal when clicking preview button', async () => {
      const user = userEvent.setup();
      render(<ColorControl value={solidColorValue} onChange={vi.fn()} />);

      const preview = screen.getByTestId('color-preview');
      await user.click(preview);

      await waitFor(() => {
        expect(screen.getByTestId('color-modal')).toBeInTheDocument();
      });
    });

    it('should show solid color editor in modal', async () => {
      const user = userEvent.setup();
      render(<ColorControl value={solidColorValue} onChange={vi.fn()} />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        expect(screen.getByTestId('alpha-slider')).toBeInTheDocument();
        expect(screen.getByTestId('hue-slider')).toBeInTheDocument();
      });
    });

    it('should not show gradient controls in solid mode', async () => {
      const user = userEvent.setup();
      render(<ColorControl value={solidColorValue} onChange={vi.fn()} />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        // In solid mode, there should be no Color/Stops tabs (those are only for gradient mode)
        // There WILL be mode switcher buttons (Solid/Gradient) since mode is not locked
        // There WILL be color space selector buttons (HSV/HSL) for the solid color editor
        const colorButton = screen.queryByRole('button', { name: /^color$/i });
        const stopsButton = screen.queryByRole('button', { name: /^stops$/i });

        expect(colorButton).not.toBeInTheDocument();
        expect(stopsButton).not.toBeInTheDocument();
      });
    });

    it('should close modal on Escape key', async () => {
      const user = userEvent.setup();
      render(<ColorControl value={solidColorValue} onChange={vi.fn()} />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        expect(screen.getByTestId('color-modal')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByTestId('color-modal')).not.toBeInTheDocument();
      });
    });

    it('should close modal when clicking close button', async () => {
      const user = userEvent.setup();
      render(<ColorControl value={solidColorValue} onChange={vi.fn()} />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        expect(screen.getByTestId('color-modal')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('color-modal')).not.toBeInTheDocument();
      });
    });

    it('should be disabled when disabled prop is true', () => {
      render(<ColorControl value={solidColorValue} onChange={vi.fn()} disabled={true} />);

      const preview = screen.getByTestId('color-preview');
      expect(preview).toBeDisabled();
    });
  });

  describe('Gradient Mode', () => {
    const gradientValue: ColorValue = {
      type: 'gradient',
      data: {
        angle: 90,
        stops: [
          { id: '1', color: '#ff0000', position: 0 },
          { id: '2', color: '#0000ff', position: 100 },
        ],
      },
    };

    it('should render preview button with gradient', () => {
      render(<ColorControl value={gradientValue} onChange={vi.fn()} />);

      const preview = screen.getByTestId('color-preview');
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute('aria-label', 'Edit gradient');
    });

    it('should show gradient editor tabs in modal', async () => {
      const user = userEvent.setup();
      render(<ColorControl value={gradientValue} onChange={vi.fn()} />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /color/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /stops/i })).toBeInTheDocument();
      });
    });

    it('should show gradient bar in color tab', async () => {
      const user = userEvent.setup();
      render(<ColorControl value={gradientValue} onChange={vi.fn()} />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        // Look for gradient bar role or gradient-related elements
        const gradientBar = screen.getByRole('slider', { name: /gradient bar/i });
        expect(gradientBar).toBeInTheDocument();
      });
    });

    it('should switch to stops tab', async () => {
      const user = userEvent.setup();
      render(<ColorControl value={gradientValue} onChange={vi.fn()} />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stops/i })).toBeInTheDocument();
      });

      const stopsTab = screen.getByRole('button', { name: /stops/i });
      await user.click(stopsTab);

      // Stops tab should be active
      expect(stopsTab).toHaveClass(/activeTab/i);
    });
  });

  describe('Mode Switching (Unlocked)', () => {
    const solidColorValue: ColorValue = {
      type: 'solid',
      data: {
        color: '#00ff00',
        alpha: 0.5,
      },
    };

    it('should show mode switcher when no mode is locked', async () => {
      const user = userEvent.setup();
      render(<ColorControl value={solidColorValue} onChange={vi.fn()} />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /solid/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /gradient/i })).toBeInTheDocument();
      });
    });

    it('should switch from solid to gradient mode', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<ColorControl value={solidColorValue} onChange={onChange} />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /gradient/i })).toBeInTheDocument();
      });

      const gradientButton = screen.getByRole('button', { name: /gradient/i });
      await user.click(gradientButton);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const newValue = onChange.mock.calls[0][0];
        expect(newValue.type).toBe('gradient');
      });
    });

    it('should convert solid color to gradient with 2 stops', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<ColorControl value={solidColorValue} onChange={onChange} />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /gradient/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /gradient/i }));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const newValue = onChange.mock.calls[0][0];
        expect(newValue.type).toBe('gradient');
        expect(newValue.data.stops).toHaveLength(2);
        expect(newValue.data.angle).toBe(90);
      });
    });

    it('should switch from gradient to solid mode', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      const gradientValue: ColorValue = {
        type: 'gradient',
        data: {
          angle: 45,
          stops: [
            { id: '1', color: '#ff0000', position: 0 },
            { id: '2', color: '#0000ff', position: 100 },
          ],
        },
      };

      render(<ColorControl value={gradientValue} onChange={onChange} />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /solid/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /solid/i }));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const newValue = onChange.mock.calls[0][0];
        expect(newValue.type).toBe('solid');
      });
    });
  });

  describe('Locked Mode', () => {
    const solidColorValue: ColorValue = {
      type: 'solid',
      data: {
        color: '#ff00ff',
        alpha: 1,
      },
    };

    it('should not show mode switcher when locked to solid', async () => {
      const user = userEvent.setup();
      render(<ColorControl value={solidColorValue} onChange={vi.fn()} mode="solid" />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        expect(screen.getByTestId('color-modal')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /gradient/i })).not.toBeInTheDocument();
    });

    it('should not show mode switcher when locked to gradient', async () => {
      const user = userEvent.setup();

      const gradientValue: ColorValue = {
        type: 'gradient',
        data: {
          angle: 180,
          stops: [
            { id: '1', color: '#ffffff', position: 0 },
            { id: '2', color: '#000000', position: 100 },
          ],
        },
      };

      render(<ColorControl value={gradientValue} onChange={vi.fn()} mode="gradient" />);

      await user.click(screen.getByTestId('color-preview'));

      await waitFor(() => {
        expect(screen.getByTestId('color-modal')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /solid/i })).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    const solidColorValue: ColorValue = {
      type: 'solid',
      data: {
        color: '#ffff00',
        alpha: 1,
      },
    };

    it('should open modal on Enter key', async () => {
      const user = userEvent.setup();
      render(<ColorControl value={solidColorValue} onChange={vi.fn()} />);

      const preview = screen.getByTestId('color-preview');
      preview.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('color-modal')).toBeInTheDocument();
      });
    });

    it('should open modal on Space key', async () => {
      const user = userEvent.setup();
      render(<ColorControl value={solidColorValue} onChange={vi.fn()} />);

      const preview = screen.getByTestId('color-preview');
      preview.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByTestId('color-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Color Format', () => {
    it('should support hex format', () => {
      const solidColor: ColorValue = {
        type: 'solid',
        data: { color: '#ff0000', alpha: 1 },
      };

      render(<ColorControl value={solidColor} onChange={vi.fn()} colorFormat="hex" />);

      expect(screen.getByTestId('color-preview')).toBeInTheDocument();
    });

    it('should support rgb format', () => {
      const solidColor: ColorValue = {
        type: 'solid',
        data: { color: '#00ff00', alpha: 0.5 },
      };

      render(<ColorControl value={solidColor} onChange={vi.fn()} colorFormat="rgb" />);

      expect(screen.getByTestId('color-preview')).toBeInTheDocument();
    });

    it('should support hsl format', () => {
      const solidColor: ColorValue = {
        type: 'solid',
        data: { color: '#0000ff', alpha: 0.75 },
      };

      render(<ColorControl value={solidColor} onChange={vi.fn()} colorFormat="hsl" />);

      expect(screen.getByTestId('color-preview')).toBeInTheDocument();
    });
  });
});
