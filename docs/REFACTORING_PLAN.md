# Plinko Game Refactoring Plan

## Objective
Separate the portable Plinko game code from the demo environment code to enable easy integration into React web and React Native applications.

## Architecture Overview

```
src/
├── plinko/                          # PORTABLE GAME PACKAGE
│   ├── components/                  # All game UI components
│   ├── game/                        # Core game logic & physics
│   ├── animation/                   # Ball & peg animations
│   ├── audio/                       # Audio system
│   ├── hooks/                       # Game hooks
│   ├── theme/                       # Theming system
│   ├── config/                      # Game configuration
│   ├── constants/                   # Game constants
│   ├── utils/                       # Game utilities
│   ├── assets/                      # Game assets (images, sounds)
│   ├── types/                       # TypeScript types
│   ├── tests/                       # All game tests
│   └── index.ts                     # Public API
│
└── demo/                            # DEMO ENVIRONMENT
    ├── components/                  # Demo-specific components
    ├── utils/                       # Demo utilities
    ├── styles/                      # Demo styles
    ├── App.tsx                      # Demo orchestrator
    ├── main.tsx                     # Entry point
    └── motion-features.ts           # Demo optimization
```

---

## File Mapping

### PLINKO GAME (src/plinko/)

#### Components Structure
```
plinko/components/
├── screens/                         # Game screens
│   ├── StartScreen/
│   │   └── StartScreen.tsx         ← src/components/screens/StartScreen.tsx
│   ├── PrizeReveal/
│   │   ├── PrizeReveal.tsx         ← src/components/screens/PrizeReveal.tsx
│   │   └── index.ts                ← src/components/screens/PrizeReveal/index.ts
│   └── PrizeClaimed/
│       └── PrizeClaimed.tsx        ← src/components/screens/PrizeClaimed.tsx
│
├── game/                            # Core game components
│   ├── PlinkoBoard/
│   │   ├── PlinkoBoard.tsx         ← src/components/game/PlinkoBoard/PlinkoBoard.tsx
│   │   ├── Peg.tsx                 ← src/components/game/PlinkoBoard/Peg.tsx
│   │   └── components/             ← src/components/game/PlinkoBoard/components/
│   ├── BallLauncher.tsx            ← src/components/game/BallLauncher.tsx
│   └── Countdown.tsx               ← src/components/game/Countdown.tsx
│
├── effects/                         # Visual effects
│   ├── celebrations/               ← src/components/effects/celebrations/
│   ├── WinAnimations/              ← src/components/effects/WinAnimations/
│   ├── ScreenShake.tsx             ← src/components/effects/ScreenShake.tsx
│   ├── CurrencyCounter.tsx         ← src/components/effects/CurrencyCounter.tsx
│   └── YouWonText.tsx              ← src/components/effects/YouWonText.tsx
│
├── ui/                              # Shared UI primitives
│   ├── GradientText/               ← src/components/ui/GradientText/
│   └── ThemedButton.tsx            ← src/components/controls/ThemedButton.tsx
│
├── layout/                          # Game layout components
│   ├── PopupContainer.tsx          ← src/components/layout/PopupContainer.tsx
│   ├── PopupOverlay.tsx            ← src/components/layout/PopupOverlay.tsx
│   ├── popupAnimations.ts          ← src/components/layout/popupAnimations.ts
│   ├── GameBoardErrorBoundary.tsx  ← src/components/layout/GameBoardErrorBoundary.tsx
│   └── PrizeErrorBoundary.tsx      ← src/components/layout/PrizeErrorBoundary.tsx
│
└── controls/                        # Game controls
    ├── DropPositionSelector.tsx    ← src/components/controls/DropPositionSelector.tsx
    └── DropPositionControls.tsx    ← src/components/controls/DropPositionControls.tsx
```

#### Core Game Logic
```
plinko/game/                         ← src/game/
├── physics/                         ← src/game/physics/
├── trajectory/                      ← src/game/trajectory/
├── stateMachine.ts
├── rng.ts
├── prizeProvider.ts
├── prizeSwapping.ts
├── prizeTypes.ts
├── prizeValidation.ts
├── collisionDetection.ts
├── boardGeometry.ts
├── trajectoryCache.ts
├── trajectoryInitialization.ts
├── types.ts
└── index.ts
```

#### Animation
```
plinko/animation/                    ← src/animation/
├── ballAnimationDriver.ts
├── ballAnimationDriver.web.ts
├── pegRippleUtils.ts
├── trailOptimization.ts
├── useBallAnimationDriver.ts
└── index.ts
```

#### Audio System
```
plinko/audio/                        ← src/audio/
├── adapters/
├── context/
├── core/
├── hooks/
├── types/
├── utils/
└── __tests__/
```

#### Hooks
```
plinko/hooks/                        ← src/hooks/
├── usePlinkoGame.ts
├── useGameState.ts
├── usePrizeSession.ts
├── useAppUIState.ts
├── useViewportManager.ts
├── useResetCoordinator.ts
├── useShakeController.ts
├── useWinAnimationState.ts
├── useGameAnimation.ts
├── useCurrencyCounterAnimation.ts
└── index.ts
```

#### Theme System
```
plinko/theme/                        ← src/theme/
├── animationDrivers/
├── themes/
├── ThemeContext.tsx
├── context.ts
├── prizeColorMapper.ts
├── themeDefaults.ts
├── themeMetadata.ts
├── themeSerializer.ts
├── themeUtils.tsx
├── tokens.ts
├── types.ts
└── index.ts
```

#### Configuration
```
plinko/config/                       ← src/config/
├── prizes/
│   ├── prizeTable.ts
│   ├── productionPrizeTable.ts
│   └── index.ts
├── theme.ts
├── timing.ts
├── responsive.ts
└── index.ts
```

#### Constants
```
plinko/constants/                    ← src/constants/
├── dimensions.ts
├── timing.ts
└── index.ts
```

#### Utils
```
plinko/utils/                        ← src/utils/ (selective)
├── platform/                        ← src/utils/platform/
├── formatting/                      ← src/utils/formatting/
├── formatNumber.ts
├── slotDimensions.ts
├── prizeUtils.ts
├── deviceDetection.ts
├── time.ts
├── asyncHelpers.ts
├── performanceBudgets.ts
├── telemetry.ts
└── index.ts
```

#### Assets
```
plinko/assets/                       ← src/assets/
├── images/
├── sounds/
└── index.d.ts
```

#### Types
```
plinko/types/                        ← src/types/
└── ref.ts
```

#### Tests
```
plinko/tests/                        ← src/tests/
├── unit/
├── integration/
├── physics/
├── regression/
├── fixtures/
├── testUtils.tsx
└── setupTests.ts
```

---

### DEMO ENVIRONMENT (src/demo/)

#### Components
```
demo/components/
├── DevTools/                        ← src/dev-tools/
│   ├── components/
│   │   ├── DevToolsMenu.tsx
│   │   ├── ThemeEditor.tsx
│   │   ├── ThemePropertyInputs.tsx
│   │   ├── ThemeSelector.tsx
│   │   └── ViewportSelector.tsx
│   ├── DevToolsLoader.tsx
│   ├── DevToolsStartScreenOverlay.tsx
│   └── index.ts
│
├── ErrorBoundary/
│   └── ErrorBoundary.tsx           ← src/components/layout/ErrorBoundary.tsx
│
├── Toast/                           ← src/components/feedback/
│   ├── Toast.tsx
│   ├── ToastContainer.tsx
│   ├── ToastContext.tsx
│   └── index.ts
│
└── SoundToggle/
    └── SoundToggle.tsx             ← src/components/controls/SoundToggle.tsx
```

#### Configuration
```
demo/config/
├── AppConfigContext.tsx            ← src/config/AppConfigContext.tsx
└── appConfig.ts                    ← src/config/appConfig.ts
```

#### Utils
```
demo/utils/
└── devToolsPersistence.ts          ← src/utils/devToolsPersistence.ts
```

#### Styles
```
demo/styles/
└── globals.css                     ← src/styles/globals.css
```

#### Root Files
```
demo/
├── App.tsx                         ← src/App.tsx
├── main.tsx                        ← src/main.tsx
└── motion-features.ts              ← src/motion-features.ts
```

---

## Public API Design

### plinko/index.ts

```typescript
// Main game hook
export { usePlinkoGame } from './hooks/usePlinkoGame';

// Game state types
export type { GameState, PlinkoGameReturn } from './game/types';
export type { Prize, PrizeType } from './game/prizeTypes';

// Core components
export { PlinkoBoard } from './components/game/PlinkoBoard/PlinkoBoard';
export { StartScreen } from './components/screens/StartScreen/StartScreen';
export { PrizeReveal } from './components/screens/PrizeReveal/PrizeReveal';
export { PrizeClaimed } from './components/screens/PrizeClaimed/PrizeClaimed';

// Effects
export { CelebrationOverlay } from './components/effects/celebrations';
export { ScreenShake } from './components/effects/ScreenShake';

// Theme system
export { ThemeProvider, useTheme } from './theme';
export { themes } from './theme';
export type { Theme } from './theme/types';

// Audio system
export { AudioProvider, useAudio } from './audio/context/AudioProvider';

// UI primitives
export { GradientText } from './components/ui/GradientText';
export { ThemedButton } from './components/ui/ThemedButton';

// Layout components
export { PopupContainer } from './components/layout/PopupContainer';
export { GameBoardErrorBoundary } from './components/layout/GameBoardErrorBoundary';
export { PrizeErrorBoundary } from './components/layout/PrizeErrorBoundary';

// Configuration
export { prizeTable } from './config/prizes';
export { TIMING, DIMENSIONS } from './constants';

// Platform utilities
export { platform } from './utils/platform';
```

---

## TypeScript Configuration Updates

### tsconfig.json - Path Aliases
```json
{
  "compilerOptions": {
    "paths": {
      "@plinko/*": ["./src/plinko/*"],
      "@demo/*": ["./src/demo/*"]
    }
  }
}
```

### vite.config.ts - Path Aliases
```typescript
resolve: {
  alias: {
    '@plinko': path.resolve(__dirname, './src/plinko'),
    '@demo': path.resolve(__dirname, './src/demo'),
  },
}
```

---

## Migration Steps

### Phase 1: Setup
1. Create new directory structure
2. Update TypeScript and Vite configurations
3. Create placeholder index.ts files

### Phase 2: Move Plinko Game Files
1. Move components (screens, game, effects, ui, layout, controls)
2. Move game logic
3. Move animation system
4. Move audio system
5. Move hooks
6. Move theme system
7. Move config, constants, utils
8. Move assets
9. Move types
10. Move tests

### Phase 3: Move Demo Files
1. Move DevTools
2. Move ErrorBoundary
3. Move Toast system
4. Move SoundToggle
5. Move App.tsx, main.tsx
6. Move demo config and utils
7. Move styles

### Phase 4: Update Imports
1. Update all plinko internal imports to use new paths
2. Update demo imports to use @plinko public API
3. Update test imports

### Phase 5: Create Public API
1. Create comprehensive plinko/index.ts
2. Add JSDoc documentation
3. Create type exports

### Phase 6: Validation
1. Run TypeScript type checking
2. Run all tests
3. Run build
4. Test demo in dev mode
5. Test demo in production build

### Phase 7: Documentation
1. Create integration guide for developers
2. Document public API
3. Add usage examples
4. Document breaking changes (if any)

---

## Import Strategy

### For Plinko Package (Internal)
```typescript
// Absolute imports using @plinko
import { usePlinkoGame } from '@plinko/hooks/usePlinkoGame';
import { GameState } from '@plinko/game/types';
```

### For Demo (External Consumer)
```typescript
// Import from public API only
import {
  usePlinkoGame,
  PlinkoBoard,
  StartScreen,
  ThemeProvider,
  themes
} from '@plinko';
```

---

## Testing Strategy

1. **Before refactoring**: Run full test suite and document passing tests
2. **During refactoring**: Update imports as files are moved
3. **After refactoring**: Verify all tests still pass
4. **Integration test**: Ensure demo works exactly as before

---

## Breaking Changes

### Minimal Breaking Changes Expected
- Import paths will change for any external consumers (currently none)
- Internal file structure changes should not affect functionality

### Backwards Compatibility
- Create a MIGRATION.md guide
- Provide import path mapping
- Document new public API

---

## Post-Refactoring Deliverables

1. **Portable Plinko Package** (`src/plinko/`)
   - Clean public API
   - Comprehensive tests
   - Full documentation

2. **Demo Application** (`src/demo/`)
   - Showcases Plinko integration
   - Development tools
   - Reference implementation

3. **Integration Guide** (`docs/INTEGRATION_GUIDE.md`)
   - How to integrate Plinko into React web apps
   - How to integrate Plinko into React Native apps
   - API reference
   - Examples

4. **Developer Documentation**
   - Architecture overview
   - Component documentation
   - API reference
   - Testing guide

---

## Success Criteria

- ✅ All code is cleanly separated into plinko/ and demo/
- ✅ All tests pass without modification
- ✅ Demo application works identically to before
- ✅ Public API is clean and documented
- ✅ Integration guide is complete
- ✅ No circular dependencies
- ✅ TypeScript compiles without errors
- ✅ Build succeeds
- ✅ All Playwright E2E tests pass

---

## Risks & Mitigation

### Risk: Breaking imports during migration
**Mitigation**: Use git branches, move files systematically, update imports immediately

### Risk: Circular dependencies
**Mitigation**: Careful dependency analysis, clear separation of concerns

### Risk: Test failures
**Mitigation**: Update test imports immediately after moving files, run tests frequently

### Risk: Lost functionality
**Mitigation**: Comprehensive testing before and after, visual regression testing

---

## Timeline Estimate

- **Phase 1 (Setup)**: 30 minutes
- **Phase 2 (Move Plinko)**: 2-3 hours
- **Phase 3 (Move Demo)**: 1 hour
- **Phase 4 (Update Imports)**: 2-3 hours
- **Phase 5 (Public API)**: 1 hour
- **Phase 6 (Validation)**: 1-2 hours
- **Phase 7 (Documentation)**: 2-3 hours

**Total Estimated Time**: 10-14 hours

---

## Next Steps

1. Review and approve this plan
2. Create a new branch: `refactor/separate-plinko-demo`
3. Execute Phase 1 (Setup)
4. Begin systematic migration
5. Continuous testing throughout
6. Final validation
7. Merge to main
