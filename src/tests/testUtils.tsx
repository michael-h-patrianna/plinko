/**
 * Test utilities and wrappers for component testing
 */

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, themes } from '../theme';

/**
 * Custom render function that wraps components with ThemeProvider
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <ThemeProvider themes={themes}>{children}</ThemeProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from React Testing Library except render
export {
  screen,
  waitFor,
  within,
  fireEvent,
  cleanup,
  act,
  renderHook,
} from '@testing-library/react';

// Override render with our custom version
export { customRender as render };
