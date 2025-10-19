/**
 * Test utilities for library components
 */
import type { RenderOptions } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';
import type { ReactElement } from 'react';

/**
 * Custom render function that wraps components with necessary providers
 */
function render(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(ui, { ...options });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { render };

