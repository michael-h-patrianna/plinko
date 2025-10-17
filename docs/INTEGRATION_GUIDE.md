# Plinko Game Integration Guide

This guide explains how to integrate the Plinko game into your React web or React Native application.

## Overview

The Plinko game is now packaged as a portable module in `src/plinko/` with a clean public API. All demo-specific code has been separated into `src/demo/`.

---

## Quick Start

### Installation

The Plinko game is located in `src/plinko/`. To integrate it into your app:

1. Copy the entire `src/plinko/` directory to your project
2. Install dependencies (see Dependencies section below)
3. Import and use the game components

### Basic Usage

```typescript
import {
  usePlinkoGame,
  PlinkoBoard,
  StartScreen,
  PrizeReveal,
  PrizeClaimed,
  ThemeProvider,
  AudioProvider,
  themes
} from '@plinko';

function MyPlinkoGame() {
  const gameState = usePlinkoGame({
    boardWidth: 375,
    boardHeight: 500,
    pegRows: 10,
    choiceMechanic: 'predetermined' // or 'random'
  });

  return (
    <ThemeProvider themes={themes}>
      <AudioProvider>
        {/* Your game UI using Plinko components */}
        {gameState.state === 'idle' && (
          <StartScreen
            prizes={gameState.prizes}
            onStart={gameState.startGame}
          />
        )}
        {/* ... other game screens */}
      </AudioProvider>
    </ThemeProvider>
  );
}
```

---

## Public API

The Plinko package exports everything you need through `src/plinko/index.ts`:

### Core Hook
```typescript
import { usePlinkoGame } from '@plinko';
```

The main game hook that manages all game state, physics, and logic.

### Game Components
```typescript
import {
  PlinkoBoard,      // Main game board with physics
  StartScreen,      // Initial screen with prize table
  PrizeReveal,      // Prize reveal screen
  PrizeClaimed,     // Prize claimed confirmation
  Countdown,        // Countdown before ball drop
  BallLauncher      // Ball launching component
} from '@plinko';
```

### Visual Effects
```typescript
import {
  CelebrationOverlay,  // Celebration animations
  ScreenShake,        // Screen shake effect
  CurrencyCounter,    // Animated currency counter
  YouWonText          // "You Won!" text animation
} from '@plinko';
```

### UI Primitives
```typescript
import {
  GradientText,    // Themed gradient text
  ThemedButton     // Themed button component
} from '@plinko';
```

### Theme System
```typescript
import {
  ThemeProvider,
  useTheme,
  themes
} from '@plinko';
```

### Audio System
```typescript
import {
  AudioProvider,
  useAudio,
  useAudioPreloader,
  useMusicManager
} from '@plinko';
```

### Types
```typescript
import type {
  GameState,
  Prize,
  PrizeType,
  Theme,
  SoundEffectId,
  MusicTrackId
} from '@plinko';
```

---

## Integration Steps

### 1. Setup TypeScript Paths

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@plinko": ["./src/plinko/index.ts"],
      "@plinko/*": ["./src/plinko/*"]
    }
  }
}
```

### 2. Setup Vite/Bundler Aliases

Add to your `vite.config.ts`:

```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@plinko': fileURLToPath(new URL('./src/plinko', import.meta.url))
    }
  }
});
```

### 3. Wrap Your App

```typescript
import { ThemeProvider, AudioProvider, themes } from '@plinko';

function App() {
  return (
    <ThemeProvider themes={themes}>
      <AudioProvider>
        {/* Your app content */}
      </AudioProvider>
    </ThemeProvider>
  );
}
```

### 4. Use the Game Hook

```typescript
import { usePlinkoGame } from '@plinko';

function PlinkoGameScreen() {
  const game = usePlinkoGame({
    boardWidth: 375,
    boardHeight: 500,
    pegRows: 10,
    choiceMechanic: 'predetermined'
  });

  // game.state: Current game state
  // game.prizes: Array of prizes
  // game.selectedPrize: Currently selected prize
  // game.startGame(): Start the game
  // game.resetGame(): Reset to initial state
  // ... and more
}
```

---

## React Native Integration

### Platform-Specific Code

The Plinko package includes platform abstractions in `src/plinko/utils/platform/`:

- **Animation**: Framer Motion (web) → Moti/Reanimated (native)
- **Crypto**: Web Crypto API → react-native-get-random-values
- **Device Info**: Browser APIs → react-native-device-info
- **Dimensions**: window.innerWidth → React Native Dimensions

### Cross-Platform Animation Constraints

The game is designed to work on both web and React Native. Follow these constraints:

**✅ ALLOWED** (cross-platform safe):
- Transforms: `translateX`, `translateY`, `scale`, `rotate`
- Opacity animations
- **Linear gradients ONLY**
- Color transitions
- Layout animations (position, size)

**❌ FORBIDDEN** (breaks React Native):
- Blur animations or CSS filters
- Radial/conic gradients
- Box shadows, text shadows
- backdrop-filter, clip-path
- CSS pseudo-elements

### React Native Dependencies

```json
{
  "dependencies": {
    "moti": "^0.27.0",
    "react-native-reanimated": "^3.6.0",
    "react-native-linear-gradient": "^2.8.3",
    "react-native-get-random-values": "^1.11.0",
    "react-native-device-info": "^10.13.1"
  }
}
```

### React Native Setup

1. Install native dependencies
2. Configure Reanimated in `babel.config.js`:

```javascript
module.exports = {
  plugins: ['react-native-reanimated/plugin'],
};
```

3. Import polyfills at app entry:

```typescript
import 'react-native-get-random-values';
```

---

## Dependencies

### Required Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "motion": "^12.0.0",
    "zod": "^4.1.12"
  }
}
```

### Optional Dependencies

```json
{
  "dependencies": {
    "howler": "^2.2.4"  // For audio (can be replaced)
  }
}
```

---

## Game Configuration

### Prize Configuration

Define your prizes in a prize table:

```typescript
import { Prize } from '@plinko';

const myPrizes: Prize[] = [
  {
    id: '1',
    type: 'free',
    label: '100 GC',
    value: 100,
    color: '#FFD700'
  },
  {
    type: 'no_win',
    label: 'Try Again',
    value: 0,
    color: '#666666'
  },
  // ... more prizes
];
```

### Theme Customization

Create a custom theme:

```typescript
import { Theme } from '@plinko';

const myTheme: Theme = {
  name: 'Custom',
  colors: {
    background: {
      primary: '#1a1a1a',
      secondary: '#2d2d2d'
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc'
    },
    // ... more colors
  },
  gradients: {
    // Linear gradients only (cross-platform compatible)
    buttonPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  // ... more theme properties
};
```

---

## Game Flow

The game follows this state machine:

```
idle → ready → selecting-position → countdown → dropping →
landed → celebrating → revealed → claimed → idle
```

### State Descriptions

- **idle**: Initial state, no game started
- **ready**: Game ready to start
- **selecting-position**: User selecting drop position (if enabled)
- **countdown**: Countdown before ball drops
- **dropping**: Ball is falling through pegs
- **landed**: Ball has landed in a slot
- **celebrating**: Celebration animation playing
- **revealed**: Prize is revealed to user
- **claimed**: Prize has been claimed

---

## Examples

### Minimal Integration

```typescript
import { usePlinkoGame, PlinkoBoard, ThemeProvider, themes } from '@plinko';

function SimplePlinko() {
  const game = usePlinkoGame({
    boardWidth: 375,
    boardHeight: 500,
    pegRows: 10
  });

  return (
    <ThemeProvider themes={themes}>
      <div>
        {game.state === 'idle' && (
          <button onClick={game.startGame}>Play Plinko</button>
        )}

        {(game.state === 'dropping' || game.state === 'landed') && (
          <PlinkoBoard
            prizes={game.prizes}
            selectedIndex={game.selectedIndex}
            trajectory={game.trajectory}
            boardWidth={375}
            boardHeight={500}
            pegRows={10}
            ballState={game.state}
            onLandingComplete={game.onLandingComplete}
          />
        )}

        {game.state === 'revealed' && game.selectedPrize && (
          <div>
            <h2>You Won: {game.selectedPrize.label}</h2>
            <button onClick={game.claimPrize}>Claim</button>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
```

### Full Integration with All Screens

See `src/demo/App.tsx` for a complete example with all game screens, animations, and effects.

---

## Testing

The Plinko package includes comprehensive tests in `src/plinko/tests/`:

- **Unit tests**: Game logic, physics, components
- **Integration tests**: Game flow, state machine
- **Physics tests**: Trajectory, collision detection

Run tests:
```bash
npm test
```

---

## Performance Optimization

### Bundle Size

Use LazyMotion to keep bundle size small. Create a tiny local wrapper that re-exports Motion's feature bundle and lazy-load it:

1) Create `src/motion-features.ts` in your app:

```ts
// src/motion-features.ts
import { domAnimation } from 'motion/react';
export default domAnimation;
```

2) Wire it up with LazyMotion:

```ts
import { LazyMotion } from 'motion/react';

const loadFeatures = () => import('./motion-features').then(m => m.default);

function App() {
  return (
    <LazyMotion features={loadFeatures} strict>
      {/* Your app */}
    </LazyMotion>
  );
}
```

### Audio Preloading

Preload audio assets for smooth playback:

```typescript
import { useAudioPreloader } from '@plinko';

function MyGame() {
  const { sfxController, musicController } = useAudio();
  const { isLoaded } = useAudioPreloader({
    sfxController,
    musicController,
    enabled: true
  });

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return <Game />;
}
```

---

## Troubleshooting

### Build Errors

**Issue**: Module not found errors
**Solution**: Ensure TypeScript and bundler path aliases are configured correctly

**Issue**: CSS import errors
**Solution**: Ensure your bundler supports CSS imports or use CSS-in-JS

### Runtime Errors

**Issue**: Audio not playing
**Solution**: Check browser autoplay policies, user must interact with page first

**Issue**: Animations laggy
**Solution**: Enable GPU acceleration, reduce particle counts in performance mode

### React Native Issues

**Issue**: Gradients not working
**Solution**: Install and configure react-native-linear-gradient

**Issue**: Random values error
**Solution**: Import 'react-native-get-random-values' at app entry

---

## Support

- **Documentation**: See `docs/` directory for detailed documentation
- **Issues**: Report issues on GitHub
- **Examples**: Check `src/demo/` for reference implementation

---

## License

[Your License Here]
