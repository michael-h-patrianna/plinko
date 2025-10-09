# ADR 001: Cross-Platform Architecture

**Status:** Accepted
**Date:** 2025-10-09
**Deciders:** Development Team
**Tags:** architecture, cross-platform, react-native

## Context

The Plinko game needs to run on both web (React) and mobile (React Native) platforms. The challenge is to share as much code as possible while accommodating platform-specific features and constraints.

### Requirements
1. **Code Reusability**: Maximize shared business logic and physics code
2. **Platform Optimization**: Allow platform-specific implementations where needed
3. **Future Portability**: Web code should not use features incompatible with React Native
4. **Performance**: Maintain 60 FPS on both platforms
5. **Developer Experience**: Simple, predictable patterns for platform detection

## Decision

We will implement a **dual-platform architecture** with the following principles:

### 1. Platform Abstraction Layer
Create abstraction modules for platform-specific features:
- `src/utils/platform/` - Platform-specific implementations
- Use file extensions (`.web.ts`, `.native.ts`) for platform routing
- Bundler automatically selects correct implementation

### 2. Visual Constraints
Enforce cross-platform compatible visual features:

**✅ Allowed:**
- Transforms: `translateX`, `translateY`, `scale`, `rotate`
- Opacity animations
- **Linear gradients only** (react-native-linear-gradient)
- Color transitions
- Layout animations

**❌ Forbidden:**
- Blur animations or CSS filters
- Radial/conic gradients
- Box shadows, text shadows
- backdrop-filter, clip-path
- CSS pseudo-elements (::before, ::after)

### 3. Animation Libraries
- **Web**: Framer Motion (current)
- **React Native**: Moti + Reanimated (future)
- Shared animation driver interface in `src/theme/animationDrivers/`

### 4. Code Organization
```
src/
├── game/                    # ✅ Fully shared (pure logic)
│   ├── boardGeometry.ts
│   ├── trajectory/
│   ├── stateMachine.ts
│   └── rng.ts
├── utils/
│   ├── platform/            # 🔀 Platform-specific
│   │   ├── crypto/
│   │   ├── storage/
│   │   └── performance/
│   └── shared/              # ✅ Fully shared
├── components/              # 🔀 Platform-specific rendering
├── theme/                   # 🔀 Platform-specific styles
└── hooks/                   # ✅ Mostly shared
```

## Consequences

### Positive
- **High Code Reuse**: ~80% of game logic is platform-agnostic
- **Type Safety**: TypeScript enforces platform API compatibility
- **Performance**: Platform-specific optimizations where needed
- **Maintainability**: Single source of truth for business logic
- **Future-Proof**: Easy to add new platforms

### Negative
- **Visual Constraints**: Cannot use all CSS features on web
- **Complexity**: Must maintain platform-specific implementations
- **Testing Overhead**: Need to test both platforms
- **Build Configuration**: More complex bundler setup

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Developers use web-only features | Lint rules + code review checklist |
| Platform abstractions diverge | Shared interface types + integration tests |
| Performance regression | Performance budgets + automated monitoring |
| Increased bundle size | Tree-shaking + platform-specific bundles |

## Implementation

### Platform Detection
```typescript
// src/utils/platform/detect.ts
export const IS_WEB = typeof window !== 'undefined';
export const IS_NATIVE = !IS_WEB;
```

### Platform Abstraction Example
```typescript
// src/utils/platform/crypto/types.ts
export interface CryptoAPI {
  randomInt(min: number, max: number): number;
  randomBytes(length: number): Uint8Array;
}

// src/utils/platform/crypto/index.web.ts
export const crypto: CryptoAPI = {
  randomInt: (min, max) => Math.floor(Math.random() * (max - min) + min),
  randomBytes: (length) => window.crypto.getRandomValues(new Uint8Array(length)),
};

// src/utils/platform/crypto/index.native.ts
import { NativeModules } from 'react-native';
export const crypto: CryptoAPI = {
  randomInt: (min, max) => NativeModules.Crypto.randomInt(min, max),
  randomBytes: (length) => NativeModules.Crypto.randomBytes(length),
};
```

### Animation Driver Pattern
```typescript
// src/theme/animationDrivers/types.ts
export interface AnimationDriver {
  animate(element: any, props: AnimationProps): void;
  transition(duration: number, easing: string): any;
}

// Framer Motion (web) and Moti (native) both implement this interface
```

## Alternatives Considered

### Alternative 1: Separate Codebases
- ❌ Rejected: Too much duplication, hard to keep in sync

### Alternative 2: React Native Web
- ❌ Rejected: Performance concerns, limited CSS features

### Alternative 3: Use Web-Only Features, Port Later
- ❌ Rejected: Expensive refactoring, technical debt

## References

- [React Native Documentation](https://reactnative.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [Moti](https://moti.fyi/)
- [Platform-Specific Extensions](https://reactnative.dev/docs/platform-specific-code)

## Related ADRs
- ADR 002: Physics Engine Design
- ADR 003: State Machine Pattern
