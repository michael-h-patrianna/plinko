/**
 * Navigation Platform Adapter - React Native Implementation
 *
 * Uses React Navigation route params or deep linking
 *
 * NOTE: This is a placeholder implementation. In a real React Native app, you would:
 * 1. Install React Navigation: npm install @react-navigation/native
 * 2. Set up navigation context
 * 3. Use route.params to access parameters
 * 4. OR use deep linking for URL-like navigation
 */

import { throwNativeNotImplemented } from '../detect';
import type { NavigationAdapter, NavigationParams } from './types';

class NativeNavigationAdapter implements NavigationAdapter {
  getParam(_key: string): string | null {
    throwNativeNotImplemented('Navigation.getParam');
  }

  getAllParams(): NavigationParams {
    throwNativeNotImplemented('Navigation.getAllParams');
  }

  hasParam(_key: string): boolean {
    throwNativeNotImplemented('Navigation.hasParam');
  }

  getCurrentPath(): string {
    return '/'; // Default route
  }
}

export const navigationAdapter: NavigationAdapter = new NativeNavigationAdapter();

/**
 * IMPLEMENTATION GUIDE FOR REACT NATIVE:
 *
 * Option 1: Using React Navigation Route Params
 * ---------------------------------------------
 * This requires access to navigation context, which is typically done in a hook.
 * The adapter would need to be initialized with the route object:
 *
 * import type { NavigationAdapter, NavigationParams } from './types';
 *
 * class NativeNavigationAdapter implements NavigationAdapter {
 *   private params: Record<string, string> = {};
 *
 *   // Call this from a component with access to route
 *   setRouteParams(routeParams: Record<string, unknown>) {
 *     this.params = {};
 *     Object.entries(routeParams).forEach(([key, value]) => {
 *       if (typeof value === 'string') {
 *         this.params[key] = value;
 *       } else if (value !== null && value !== undefined) {
 *         this.params[key] = String(value);
 *       }
 *     });
 *   }
 *
 *   getParam(key: string): string | null {
 *     return this.params[key] ?? null;
 *   }
 *
 *   getAllParams(): NavigationParams {
 *     return { ...this.params };
 *   }
 *
 *   hasParam(key: string): boolean {
 *     return key in this.params;
 *   }
 *
 *   getCurrentPath(): string {
 *     return '/'; // Route name would come from navigation state
 *   }
 * }
 *
 * // Usage in component:
 * import { useRoute } from '@react-navigation/native';
 *
 * function GameScreen() {
 *   const route = useRoute();
 *   useEffect(() => {
 *     navigationAdapter.setRouteParams(route.params ?? {});
 *   }, [route.params]);
 * }
 *
 *
 * Option 2: Using Deep Linking (For URL-like params)
 * --------------------------------------------------
 * 1. Configure deep linking in React Navigation
 * 2. Use Linking API to parse URL parameters
 *
 * import { Linking } from 'react-native';
 *
 * class NativeNavigationAdapter implements NavigationAdapter {
 *   private async parseDeepLink(): Promise<NavigationParams> {
 *     const url = await Linking.getInitialURL();
 *     if (!url) return {};
 *
 *     const params: NavigationParams = {};
 *     const urlObj = new URL(url);
 *     urlObj.searchParams.forEach((value, key) => {
 *       params[key] = value;
 *     });
 *     return params;
 *   }
 *
 *   // Implementation would be async or use cached state
 * }
 *
 *
 * RECOMMENDATION FOR THIS PROJECT:
 * --------------------------------
 * The seed parameter (?seed=12345) is a development/testing feature.
 * Consider making this web-only and using a different approach on React Native:
 * - Dev menu to enter seed manually
 * - AsyncStorage to persist last used seed
 * - Remove this feature from mobile entirely
 */
