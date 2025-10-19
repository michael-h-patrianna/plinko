/**
 * Test utilities and wrappers for component testing
 */

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, renderHook as rtlRenderHook, act } from '@testing-library/react';
import type { RenderHookOptions, RenderHookResult } from '@testing-library/react';
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

/**
 * Async render helper that wraps render in act() to handle async effects
 * Use this for components that have async effects (like AudioProvider, usePlinkoGame)
 * This version wraps in ThemeProvider - use renderAsyncWithoutWrapper for components
 * that already have their own providers (like <App />)
 */
async function renderAsync(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): Promise<ReturnType<typeof render>> {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = customRender(ui, options);
  });
  return result!;
}

/**
 * Async render helper WITHOUT ThemeProvider wrapper
 * Use this for components that already include all necessary providers (like <App />)
 */
async function renderAsyncWithoutWrapper(
  ui: ReactElement,
  options?: RenderOptions
): Promise<ReturnType<typeof render>> {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(ui, options);
  });
  return result!;
}

/**
 * Async renderHook helper that wraps renderHook in act() to handle async effects
 * Use this for hooks that have async effects or state updates after initial render
 */
async function renderHookAsync<Result, Props>(
  renderCallback: (initialProps: Props) => Result,
  options?: RenderHookOptions<Props>
): Promise<RenderHookResult<Result, Props>> {
  let result: RenderHookResult<Result, Props>;
  await act(async () => {
    result = rtlRenderHook(renderCallback, options);
  });
  return result!;
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
export { customRender as render, renderAsync, renderAsyncWithoutWrapper, renderHookAsync };
