# Front-End Engineering Style Guide

## Core Engineering Principles

- **Intentional architecture:** Every module should have a single responsibility, clearly expressed through its folder structure and exports. Domain-specific logic lives in hooks or services, while UI components stay presentational.
- **Deterministic state management:** Prefer explicit state machines, typed events, and transitions over ad-hoc `useState` chains. Determinism makes simulations, logging, and testing reliable.
- **Performance as a first-class concern:** Build with frame-by-frame awareness. Memoize aggressively, subscribe to external stores for animation loops, and keep render trees flat and predictable.
- **Resilience and recovery:** Assume failures. Wrap major surfaces in error boundaries, provide user feedback (toast notifications, fallbacks), and coordinate reset flows so the app can recover without a page refresh.
- **Observability and guard rails:** Instrument telemetry at critical state transitions. Use refs and guards to prevent illegal transitions and log anomalies immediately.

## Architectural Conventions

### Folder Structure

- `components/` holds presentational and container components organized by domain. Prefer colocating assets, tests, and stories with the component.
- `hooks/` encapsulate reusable logic. Compose small hooks into feature-level orchestrators while keeping side effects localized.
- `services/` (or equivalent) own pure domain logic: business rules, data transforms, deterministic simulations. Keep them framework-agnostic to simplify testing.
- `config/` exposes typed context providers and helpers for runtime configuration, feature flags, and environment wiring.
- `theme/`, `constants/`, and `utils/` collect shared primitives. Avoid leaking implementation details across domains or importing from deep paths.

### State & Effects

- Model complex flows with a state machine and typed events. Document transitions in `docs/` so newcomers can trace the lifecycle.
- Co-locate side effects with the components or hooks that own the state. Each `useEffect` should have a single reason to re-run and include clear exit conditions.
- Prefer `useCallback`, `useMemo`, and `useSyncExternalStore` to stabilize references across renders, especially when passing callbacks through context or animation loops.
- Use refs to coordinate multi-phase flows (e.g., locking the winning prize, tracking current animation frame) without forcing re-renders.

### Rendering & Styling

- Keep component trees shallow. Split large containers into focused subcomponents so that rendering concerns, layout, and domain logic remain isolated.
- Drive animations through a shared driver (Framer Motion or equivalent), providing a consistent API for timing and transitions.
- Centralize layout tokens (spacing, radii, gradients) in the theme system, even when applying inline styles. Inline styles are acceptable for dynamic values but mirror them in Tailwind or CSS variables for consistency.
- Apply memoization or `React.memo` to heavy child components, especially those rendering grids, lists, or SVG/Canvas primitives.

#### Style Pattern Tokens & Utilities (NEW)

To reduce inline style verbosity and improve consistency, use the new **style pattern tokens** and **utility functions**:

**Style Pattern Tokens** (`stylePatternTokens` from `theme/tokens.ts`):
```tsx
import { stylePatternTokens } from '../theme/tokens';

// Flexbox patterns
<div style={stylePatternTokens.flexCenter}>Centered content</div>
<div style={stylePatternTokens.flexCenterColumn}>Column layout</div>
<div style={stylePatternTokens.flexBetween}>Space between</div>

// Positioning patterns
<div style={stylePatternTokens.absoluteFill}>Full overlay</div>
<div style={stylePatternTokens.absoluteCenter}>Centered overlay</div>
<div style={stylePatternTokens.overlay}>Non-interactive overlay</div>

// Text patterns
<div style={stylePatternTokens.textTruncate}>Truncated text...</div>
<div style={stylePatternTokens.textClamp(3)}>Max 3 lines</div>
```

**Utility Functions** (`theme/themeUtils.tsx`):
```tsx
import {
  createOverlayBackground,
  createCardBackground,
  createGradientText,
  createFlexLayout,
  createAbsoluteOverlay,
  createTransform,
  createResponsiveFontSize
} from '../theme/themeUtils';

// Semi-transparent backgrounds
<div style={{ background: createOverlayBackground('#000000', 0.5) }}>
  Dark overlay
</div>

// Card backgrounds with theme integration
<div style={createCardBackground(theme.colors.surface.primary, 0.8)}>
  Semi-transparent card
</div>

// Gradient text (cross-platform safe)
<h1 style={createGradientText(theme.gradients.buttonPrimary)}>
  Gradient Title
</h1>

// Flexbox layouts with gap
<div style={createFlexLayout('center', 'space-between', '12px', 'column')}>
  Flex container
</div>

// Absolute overlays
<div style={createAbsoluteOverlay({ top: 0, left: 0 }, 10)}>
  Positioned overlay
</div>

// Transform combinations
<div style={createTransform({ translateX: '50%', scale: 1.2, rotate: 45 })}>
  Transformed element
</div>

// Responsive font sizes
<div style={{
  fontSize: createResponsiveFontSize(containerWidth, {
    min: 10, max: 16, minWidth: 300, maxWidth: 600
  })
}}>
  Responsive text
</div>
```

**Benefits:**
- Reduces inline style duplication across components
- Maintains consistency with theme tokens
- Cross-platform compatible (React Native ready)
- Better type safety and autocomplete
- Easier to refactor and maintain

## Coding Standards

- **TypeScript everywhere:** Use strict types, discriminated unions, and generics. Avoid `any`; prefer helper types to keep state machine context and events precise.
- **Documentation-first mindset:** Add top-level JSDoc blocks describing each hook/component’s responsibility, parameters, and side effects. Maintain companion docs (`docs/*.md` or an ADR folder) for complex systems or refactors.
- **Error handling:** Surface actionable messages to users via toasts or inline UI. Log internal errors with context (state, event) and guard against cascading failures.
- **Pure functions for domain logic:** Keep physics, randomization, and prize calculations pure and testable. Inject dependencies (seed overrides, adapters) via parameters.

## Testing Expectations

- **Unit tests:** Cover domain modules (state machines, trajectory generators) with deterministic seeds. Validate edge cases—invalid transitions, timeouts, reset races.
- **Component tests:** Use Testing Library to assert rendering behavior, accessibility, and state transitions from user interactions.
- **Integration & E2E:** Leverage Playwright (or similar) for animation-heavy flows, visual regressions, and device viewport coverage.
- **Dev tooling hooks:** When exposing internal APIs for tests or dev tools, mark them clearly (`_internal`) and ensure they’re gated from production usage.
- **CI discipline:** Tests should run quickly and deterministically. Use seeds, mocked timers, and controlled feature flags to eliminate flakiness.

## Documentation & Knowledge Sharing

- Maintain ADR-style records for major architectural decisions (state machine refactors, animation driver swaps, testing overhauls).
- Keep reset orchestration, animation pipelines, and domain algorithms documented with diagrams and troubleshooting tips.
- Provide onboarding guides highlighting the flow from root entry points through feature orchestrators to reusable primitives so newcomers can trace the happy path quickly.

## Developer Experience

- Ship dev tools (debug panels, performance toggles, deterministic seeds) that plug into the architecture without touching production code paths.
- Use feature flags and configuration providers to toggle experiences safely.
- Keep the bundle modular: lazy-load dev-only panels and effect-heavy components where appropriate.
- Favor predictable, typed adapters for platform features (viewport sizing, device detection) so tests can stub them easily.

## Code Review Checklist

- Does the change respect the folder boundaries and domain ownership?
- Are state transitions and side effects deterministic and well-documented?
- Have performance characteristics (render count, animation frames) been considered?
- Are error states handled with user feedback and logged for telemetry?
- Are tests covering both happy paths and failure scenarios, including reset flows?
- Is documentation updated (inline comments + docs) for new concepts or refactors?

## Common Mistakes to Avoid

- **Unstructured state:** Relying on scattered `useState` calls or implicit side effects makes behavior unpredictable. Always model complex flows with explicit reducers, state machines, or finite state diagrams.
- **Inline styling sprawl:** Sprinkling layout-critical inline styles across components hides design tokens. Move shared styling to theme variables, utility classes, or styled primitives.
- **Over-engineering without payoff:** Excessive abstraction, nested providers, or premature indirection slows velocity. Start with the simplest architecture that meets requirements, then generalize once real duplication appears.
- **Custom platform detection hacks:** User-agent sniffing breaks easily. Prefer `matchMedia`, `ResizeObserver`, and progressive enhancement strategies with tested adapter layers.
- **Insufficient testing depth:** Smoke tests alone miss race conditions. Add deterministic unit tests for domain logic, integration tests for state transitions, and targeted E2E coverage for critical user journeys.
- **Opaque error handling:** Silent failures or generic alerts erode trust. Provide actionable user feedback and structured logs with context so on-call engineers can diagnose quickly.

## Continuous Improvement

- Periodically prune legacy compatibility code (e.g., older signatures in hooks) once consumers migrate.
- Revisit custom infrastructure (reset orchestration, animation drivers) to ensure they still outperform off-the-shelf solutions.
- Encourage engineers to add small quality-of-life improvements (better typing, helper utilities) as part of feature work.
