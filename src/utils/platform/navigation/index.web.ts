/**
 * Navigation Platform Adapter - Web Implementation
 *
 * Uses URL search parameters (window.location.search)
 */

import type { NavigationAdapter, NavigationParams } from './types';

class WebNavigationAdapter implements NavigationAdapter {
  private getSearchParams(): URLSearchParams {
    // SSR safety check
    if (typeof window === 'undefined') {
      return new URLSearchParams();
    }
    return new URLSearchParams(window.location.search);
  }

  getParam(key: string): string | null {
    return this.getSearchParams().get(key);
  }

  getAllParams(): NavigationParams {
    const params: NavigationParams = {};
    const searchParams = this.getSearchParams();

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  hasParam(key: string): boolean {
    return this.getSearchParams().has(key);
  }

  getCurrentPath(): string {
    if (typeof window === 'undefined') {
      return '/';
    }
    return window.location.pathname;
  }
}

export const navigationAdapter: NavigationAdapter = new WebNavigationAdapter();
