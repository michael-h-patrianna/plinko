# Dev Tools

**IMPORTANT: This folder contains development and testing utilities only.**

## Purpose

The `dev-tools` folder contains components and utilities that are **NOT part of the production Plinko game**. These are local testing and development tools designed to help developers test the game under different conditions.

## Components

### DevToolsMenu

A settings menu accessible via a gear icon in the top-right corner that provides:

- **Theme Switching**: Test the game with different visual themes
- **Viewport Simulation**: Simulate different mobile device screen sizes (iPhone SE, Galaxy S8, iPhone 12, iPhone 14 Pro Max)

## Usage

```tsx
import { DevToolsMenu } from './dev-tools';

// In your App component (development only)
<DevToolsMenu
  viewportWidth={viewportWidth}
  onViewportChange={handleViewportChange}
  viewportDisabled={isViewportLocked}
/>
```

## Production Builds

These components should be excluded from production builds or conditionally rendered based on environment:

```tsx
{process.env.NODE_ENV === 'development' && (
  <DevToolsMenu {...props} />
)}
```

## What Belongs Here

- Theme switchers for visual testing
- Viewport/device simulators
- Debug overlays
- Performance monitors
- Test data generators
- Any UI that helps with development but is not part of the actual game

## What Does NOT Belong Here

- Actual game components (Ball, PlinkoBoard, PrizeSlots, etc.)
- Game logic and physics (trajectory, state machine, etc.)
- Production UI components (StartScreen, PrizeReveal, etc.)
- Theme definitions (those belong in `src/theme`)
- Hooks and utilities used by the game

## Folder Structure

```
src/dev-tools/
├── components/          # Dev tool React components
│   └── DevToolsMenu.tsx
├── index.ts            # Public exports
└── README.md           # This file
```

## Guidelines for Developers

1. **Clear Naming**: All components should have names that clearly indicate they're for testing/development
2. **Documentation**: Add comments explaining that code is DEV TOOLS ONLY
3. **Separation**: Keep dev tools completely separate from production code
4. **No Dependencies**: Production code should never import from `dev-tools`
5. **Conditional Rendering**: Consider environment-based conditional rendering for production safety
