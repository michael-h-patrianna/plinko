/**
 * Navigation Platform Adapter Types
 *
 * Provides URL parameter and navigation abstraction
 * across web (URL search params) and React Native (deep linking) platforms
 */

export interface NavigationParams {
  [key: string]: string | null;
}

export interface NavigationAdapter {
  /**
   * Gets a URL/route parameter by key
   *
   * @param key - The parameter key to retrieve
   * @returns The parameter value or null if not found
   */
  getParam(key: string): string | null;

  /**
   * Gets all URL/route parameters
   *
   * @returns Object with all parameters
   */
  getAllParams(): NavigationParams;

  /**
   * Checks if a parameter exists
   *
   * @param key - The parameter key to check
   * @returns true if parameter exists
   */
  hasParam(key: string): boolean;

  /**
   * Gets the current location/route path
   *
   * @returns Current path (web) or route name (native)
   */
  getCurrentPath(): string;
}
