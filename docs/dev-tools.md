# Dev Tools Documentation

## Overview

This document describes the development tooling available in the Plinko application and how to configure them for different environments.

## Available Dev Tools

### 1. DevToolsMenu
**Location**: `src/dev-tools/components/DevToolsMenu.tsx`

A comprehensive settings menu for local development and testing that provides:

- **Theme Switching**: Test different visual themes instantly
- **Viewport Simulation**: Simulate different mobile device sizes (iPhone SE, Galaxy S8, iPhone 12, iPhone 14 Pro Max)
- **Choice Mechanic Toggle**: Switch between different game mechanics (Classic vs Drop Position)

**Features**:
- Gear icon button in bottom-right corner
- Popup menu with organized sections
- Disabled state during gameplay to prevent physics conflicts
- Desktop-only viewport controls (mobile uses actual device width)

### 2. ThemeSelector
**Location**: `src/dev-tools/components/ThemeSelector.tsx`

Standalone theme selection component for testing visual themes.

### 3. ViewportSelector
**Location**: `src/dev-tools/components/ViewportSelector.tsx`

Standalone viewport size selection for device simulation.

## Configuration

### Environment Variables

Dev tools are controlled by feature flags that respect environment variables:

#### Development Mode (default)
```bash
# Dev tools are ENABLED by default
npm run dev
```

#### Production Mode (default)
```bash
# Dev tools are DISABLED by default
npm run build
npm run preview
```

#### Production with Dev Tools Enabled (QA/Staging)
```bash
# Create .env.production.local file
echo "VITE_ENABLE_DEV_TOOLS=true" > .env.production.local

# Build and preview
npm run build
npm run preview
```

### Feature Flags

Dev tools are controlled by the `featureFlags.devToolsEnabled` flag in `src/config/appConfig.ts`:

```typescript
interface FeatureFlags {
  devToolsEnabled: boolean;
  dropPositionMechanicEnabled: boolean;
}
```

**Default Behavior**:
- **Development** (`npm run dev`): `devToolsEnabled = true`
- **Production** (`npm run build`): `devToolsEnabled = false`
- **Production with override**: `devToolsEnabled = VITE_ENABLE_DEV_TOOLS === 'true'`

## Implementation Architecture

### Lazy Loading

Dev tools are lazy-loaded to ensure they don't bloat the production bundle when disabled:

```typescript
// src/dev-tools/DevToolsLoader.tsx
const DevToolsMenu = lazy(() =>
  import('./components/DevToolsMenu').then((module) => ({
    default: module.DevToolsMenu,
  }))
);
```

**Benefits**:
1. Separate chunk created at build time
2. Only loaded when feature flag is enabled
3. Tree-shaken from production builds when flag is disabled
4. Wrapped in Suspense boundary for loading states

### Conditional Rendering

Dev tools check the feature flag before rendering:

```typescript
export function DevToolsLoader(props: DevToolsLoaderProps) {
  const { featureFlags } = useAppConfig();

  if (!featureFlags.devToolsEnabled) {
    return null; // Don't render anything
  }

  return (
    <Suspense fallback={null}>
      <DevToolsMenu {...props} />
    </Suspense>
  );
}
```

## Usage in Application Code

### Correct Usage

Always import `DevToolsLoader` instead of `DevToolsMenu` directly:

```typescript
// ✅ CORRECT
import { DevToolsLoader } from './dev-tools';

function App() {
  return <DevToolsLoader {...props} />;
}
```

### Incorrect Usage

Don't import `DevToolsMenu` directly in production code:

```typescript
// ❌ WRONG - bypasses lazy loading and feature flags
import { DevToolsMenu } from './dev-tools/components/DevToolsMenu';

function App() {
  return <DevToolsMenu {...props} />;
}
```

## QA Environment Setup

For staging/QA environments where you want dev tools in a production build:

### Option 1: Environment File

Create `.env.production.local` (gitignored):
```bash
VITE_ENABLE_DEV_TOOLS=true
```

### Option 2: Build Command

```bash
VITE_ENABLE_DEV_TOOLS=true npm run build
```

### Option 3: CI/CD Configuration

In your CI/CD pipeline (GitHub Actions, etc.):
```yaml
- name: Build for QA
  run: npm run build
  env:
    VITE_ENABLE_DEV_TOOLS: true
```

## Bundle Analysis

### Verify Dev Tools Exclusion

To verify dev tools are excluded from production builds:

```bash
# Build for production
npm run build

# Check the dist folder
ls -lh dist/assets/

# Dev tools should be in a separate chunk (only loaded when flag is enabled)
# Example: DevToolsMenu-abc123.js
```

### Expected Bundle Behavior

**Development Build**:
- Dev tools chunk is loaded immediately
- DevToolsMenu visible in bottom-right corner

**Production Build (dev tools disabled)**:
- Dev tools chunk is NOT loaded
- No gear icon visible
- Smaller main bundle size

**Production Build (dev tools enabled via env var)**:
- Dev tools chunk is loaded
- DevToolsMenu visible in bottom-right corner
- Slightly larger bundle, but still code-split

## Testing

### Manual Testing

1. **Development Mode**:
   ```bash
   npm run dev
   ```
   - Verify gear icon appears in bottom-right
   - Verify all dev tools functions work

2. **Production Mode (disabled)**:
   ```bash
   npm run build
   npm run preview
   ```
   - Verify NO gear icon appears
   - Verify game works normally

3. **Production Mode (enabled)**:
   ```bash
   VITE_ENABLE_DEV_TOOLS=true npm run build
   npm run preview
   ```
   - Verify gear icon appears
   - Verify all dev tools functions work

### Automated Testing

Dev tools can be tested directly in unit tests:

```typescript
import { DevToolsMenu } from './dev-tools';

describe('DevToolsMenu', () => {
  it('renders theme selector', () => {
    // Test implementation
  });
});
```

## Security Considerations

1. **No Sensitive Data**: Dev tools should never expose sensitive information
2. **Production Disabled**: Always disabled by default in production
3. **Explicit Override**: Requires explicit environment variable to enable in production
4. **No Authentication Bypass**: Dev tools don't provide access to restricted features

## Future Enhancements

Potential future additions to dev tooling:

- Performance profiler overlay
- Physics debug visualization
- Network request inspector
- State machine visualization
- Error log viewer
- Local storage inspector

## Troubleshooting

### Dev Tools Not Appearing in Development

**Issue**: Gear icon doesn't appear when running `npm run dev`

**Solution**:
1. Check console for errors
2. Verify `AppConfigProvider` is wrapping the app
3. Clear browser cache and reload
4. Restart dev server

### Dev Tools Appearing in Production

**Issue**: Dev tools visible in production build

**Solution**:
1. Verify you're building in production mode (`npm run build`)
2. Check for `VITE_ENABLE_DEV_TOOLS=true` in environment
3. Remove any `.env.production.local` files
4. Clear `dist` folder and rebuild

### Lazy Loading Errors

**Issue**: Errors related to dynamic imports

**Solution**:
1. Ensure Vite config supports dynamic imports (default)
2. Check network tab for 404s on chunk files
3. Verify correct base URL in Vite config
4. Clear build cache and rebuild

## Related Documentation

- [Build Configuration](./build-configuration.md) - Build process and optimization
- [Environment Variables](./environment-variables.md) - All available env vars
- [Testing Guide](./testing-guide.md) - Testing dev tools and features
