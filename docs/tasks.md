# Plinko React Implementation Plan (One-Shot Build)

> **Audience:** GitHub Copilot (GPT-5-Codex) and Claude Code CLI (Opus 4 / Sonnet 4.5) performing a single end-to-end implementation pass. Follow the steps exactly, in order, to avoid rework or hallucinations. Use only the resources and tools explicitly referenced. Assume you have no other documentation besides this file.

---

## 0. Read This First

- You are creating a brand-new single-page React + TypeScript project that runs entirely on the developer machine (no backend).
- All requirements, file paths, commands, and acceptance criteria are defined here. Do not invent additional functionality.
- Always keep the Plinko popup width at **375px**. Treat the app as a contained widget—not a full-page site.
- The predetermined outcome must be selected before the animation starts and must stay fixed during the drop.
- Every major feature must have matching automated tests (unit + component + E2E Playwright). Tests must pass without manual intervention.
- Run all commands exactly as written using `npm` (not yarn/pnpm).

---

## 1. Objective & Success Criteria

- Deliver a fully working **React + TypeScript** Plinko mini-game that runs locally inside a **375px-wide popup container**.
- The game consumes a **mock prize table** (3–8 prizes) with probabilities, selects the prize **before animation starts**, and animates a ball drop that convincingly lands in the predetermined slot.
- After landing, show a **congratulatory reveal view** detailing the prize and presenting a claim CTA.
- Maintain 60fps-quality animation (target duration 3–8s) with believable peg collisions, sound/visual cues optional but nice-to-have.
- Provide automated confidence: unit tests, integration tests, and **Playwright browser test** proving the flow end-to-end.

Success checklist:
1. ✅ Build scripts run without errors (npm scripts only; do not introduce other package managers).
2. ✅ `npm run lint`, `npm run test`, and `npm run test:e2e` (Playwright) all pass locally.
3. ✅ Manual smoke (Playwright MCP) confirms ball lands in predetermined slot and prize reveal displays correct prize from mock table.
4. ✅ No TODOs or dead code left in the repo; documentation explains usage.

---

## 2. Scope & Guardrails

### In-Scope
- New Vite-based React + TypeScript project dedicated to the Plinko popup.
- Deterministic outcome pipeline: prize selection → trajectory generation → animation playback.
- Physics illusion via deterministic pathing (no external physics engine required; rely on tweened coordinates and collision cues).
- Core UI: intro panel, Plinko board (pegs + ball + slots), CTA button, prize reveal view.
- Styling with CSS Modules or styled-components (choose one; stay consistent). Support theme constants that could be swapped later.
- Tests: Vitest + React Testing Library for logic/components, Playwright for end-to-end validation.

### Out of Scope (Do NOT implement)
- Real backend APIs or encryption.
- Mobile or React Native support.
- Multi-language/localization.
- Audio assets (stub only if referenced).

### Guardrails
- Prefer standard libraries bundled with Vite; avoid heavy physics libs (Matter.js) for this demo.
- Keep dependencies minimal and documented.
- All TypeScript types must be explicit; no `any`.
- Favor deterministic pseudo-randomness (e.g., seeded RNG) to keep tests stable.

---

## 3. High-Level Architecture

```
plinko-popup/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx                # Popup shell, routing of game states
│   │   └── index.tsx              # Entry point
│   ├── config/
│   │   ├── prizeTable.ts          # Mock prize definitions & probabilities
│   │   └── theme.ts               # Colors, spacing, typography constants
│   ├── game/
│   │   ├── rng.ts                 # Seeded RNG + predetermined prize selection
│   │   ├── trajectory.ts          # Path generation ensuring target slot
│   │   ├── stateMachine.ts        # Finite state machine for game flow
│   │   └── types.ts               # Shared TypeScript interfaces
│   ├── hooks/
│   │   └── usePlinkoGame.ts       # Orchestrates game logic + animation state
│   ├── components/
│   │   ├── PopupContainer.tsx     # 375px layout wrapper
│   │   ├── PlinkoBoard/
│   │   │   ├── PlinkoBoard.tsx    # Peg layout + slots
│   │   │   ├── Peg.tsx
│   │   │   └── Slot.tsx
│   │   ├── Ball.tsx               # Animated ball component
│   │   ├── StartScreen.tsx
│   │   ├── PrizeReveal.tsx
│   │   └── Controls.tsx
│   ├── styles/
│   │   └── globals.css            # Base resets + layout helpers
│   ├── tests/
│   │   ├── trajectory.test.ts     # Unit tests for path generator
│   │   ├── rng.test.ts            # Prize selection determinism
│   │   └── PlinkoBoard.test.tsx   # Component rendering tests
│   └── index.html
├── e2e/
│   └── plinko.spec.ts             # Playwright end-to-end flow
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

Key modules:
- `prizeTable.ts`: Export fixed mock data (`MOCK_PRIZES`) plus helpers for validation and lookup.
- `rng.ts`: Deterministic weighted selection returning `{ selectedIndex, seedUsed, cumulativeWeights }`.
- `trajectory.ts`: Generates the full frame-by-frame path, peg hit markers, and slot center metadata based on predetermined outcome.
- `usePlinkoGame.ts`: Single hook controlling state machine, deterministic seed overrides, and animation loop.

### Gameplay Timeline (Follow Sequentially)
1. **Initialization**
   - Load `MOCK_PRIZES`, validate configuration, and compute theme tokens.
   - Call `selectPrize` immediately to fix the winning slot before any render animations occur.
   - Generate `trajectory` using returned `seed` and store both seed and trajectory in state.
2. **Ready State**
   - Display start screen summary; enable Drop button.
   - Ball rendered at top center with idle bobbing animation.
3. **Dropping State**
   - On button click, advance FSM to `dropping`, lock controls, start RAF loop.
   - For each animation frame, advance to next `TrajectoryPoint`, update ball position, and trigger peg highlights.
4. **Landed State**
   - After primary trajectory completes, run settling frames to simulate light bouncing.
   - Highlight winning slot and prepare reveal overlay data.
5. **Revealed State**
   - Show overlay with prize details, update `aria-live`, focus claim button.
   - Provide `Claim` (no backend) and `Play Again` actions; resetting returns to step 1 with new seed.

---

## 4. Detailed Implementation Tasks

### Phase 0 — Environment Prep
1. Ensure local Node.js ≥ 18.
2. Initialize project directory `plinko-popup` using Vite (`npm create vite@latest plinko-popup -- --template react-ts`).
3. Install dependencies:
   - Core: `npm install`
   - Testing: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest`
   - Playwright: `npm install -D @playwright/test` then `npx playwright install --with-deps`.
   - Optional styling lib (if using styled-components): include both runtime and types.
4. Configure npm scripts: `dev`, `build`, `preview`, `lint` (ESLint via Vite default), `test` (Vitest), `test:e2e` (Playwright).

### Phase 1 — Project Hygiene
1. Delete boilerplate files; keep minimal Vite template.
2. Configure ESLint + Prettier (use Vite defaults or add `.eslintrc.cjs`).
3. Update `tsconfig.json` for strict type checking.
4. Add `src/styles/globals.css` with CSS reset and base font.
5. Update `main.tsx`/`index.tsx` to wrap `<App />` with `StrictMode` and import globals.

### Phase 2 — Domain Modeling & Mock Data
1. Define TypeScript interfaces in `game/types.ts`:
   ```ts
   export interface PrizeConfig {
     id: string;
     label: string;
     description: string;
     probability: number; // 0-1 sum to 1
     color: string;
   }
   export interface TrajectoryPoint {
     frame: number;
     x: number;
     y: number;
     rotation: number;
     pegHit?: boolean;
   }
   export type GameState = 'idle' | 'ready' | 'dropping' | 'landed' | 'revealed';
   ```
2. Create `config/prizeTable.ts` exporting **exactly defined mock data**:
    ```ts
    export const MOCK_PRIZES: PrizeConfig[] = [
       { id: 'p1', label: '$500 Bonus', description: 'Instant site credit', probability: 0.05, color: '#F97316' },
       { id: 'p2', label: '$250 Bonus', description: 'Instant site credit', probability: 0.10, color: '#FB923C' },
       { id: 'p3', label: '$50 Bonus', description: 'Instant site credit', probability: 0.20, color: '#FACC15' },
       { id: 'p4', label: '25 Free Spins', description: 'Slots free play', probability: 0.25, color: '#34D399' },
       { id: 'p5', label: '10 Free Spins', description: 'Slots free play', probability: 0.25, color: '#60A5FA' },
       { id: 'p6', label: '5 Free Spins', description: 'Slots free play', probability: 0.15, color: '#A78BFA' }
    ];
    ```
    - Include runtime validation that probabilities sum to 1.0 (with tolerance 1e-6). Throw with descriptive error if invalid.
    - Export helper `getPrizeByIndex(index: number)` returning the `PrizeConfig`.
3. Create `config/theme.ts` defining:
    - Base colors (`background`, `surface`, `primary`, `accent`, `textPrimary`, `textSecondary`).
    - Font stack: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.
    - Spacing scale (e.g., `spacing.xs = 4`, `sm = 8`, etc.).
    - Shadow presets for buttons and board.
    - Export `popupDimensions = { width: 375, height: 600 }` for consistent usage.
4. Document mock data and theme usage with JSDoc comments directly above exports so agents consuming the file understand intent.

### Phase 3 — Deterministic Outcome Pipeline
1. Implement `game/rng.ts`:
   - Define helper `mulberry32(seed: number)` and `createRng(seed: number)` returning `{ next(): number }` (0 ≤ value < 1).
   - Provide `generateSeed()` via `crypto.getRandomValues(new Uint32Array(1))[0]`; accept optional seed override for tests.
   - Export `selectPrize(prizes: PrizeConfig[], seedOverride?: number)` that validates prize count (3–8) and probability sum, constructs cumulative weights (`Float32Array`), then performs roulette-wheel selection. Return `{ selectedIndex, seedUsed, cumulativeWeights }`.
   - Throw descriptive errors for invalid inputs. Unit tests must cover deterministic replay with `seedOverride` and error handling cases.
2. Implement `game/trajectory.ts`:
   - Signature: `generateTrajectory({ boardWidth, boardHeight, pegRows, slotCount, selectedIndex, seed, dropDurationMs = 4500, settleDurationMs = 300 })`.
   - Steps (execute exactly):
     1. Compute slot centers using helper `getSlotCenterX(slotIndex, slotCount, boardWidth)`.
     2. Produce column path via biased random walk toward `selectedIndex`:
        ```ts
        let column = Math.floor(slotCount / 2);
        for (let row = 0; row < pegRows; row++) {
          const distance = selectedIndex - column;
          const bias = Math.sign(distance);
          const biasStrength = Math.min(0.8, Math.abs(distance) / Math.max(1, pegRows - row));
          const noise = rng.next() - 0.5;
          const step = noise > biasStrength ? 1 : noise < -biasStrength ? -1 : bias;
          column = clamp(column + step, 0, slotCount - 1);
          columns.push(column);
        }
        ```
     3. Map columns to peg coordinates (`x = slotCenters[column]`, `y = boardHeight * ((row + 1) / (pegRows + 1))`).
     4. Interpolate between control points using cubic Bézier curves (`easeInOutCubic`) sampled at 60fps. Populate `TrajectoryPoint` with `rotation` incrementing ~25° per row and `pegHit` flagged on first frame after each control point.
     5. Append settling segment lasting `settleDurationMs` with damped x oscillation (±6px, damping 0.6) while y remains fixed and rotation eases to 0.
   - Validate inputs: throw error if `selectedIndex` outside range or final x deviates >2px from slot center.
   - Unit tests must assert final x tolerance, total frame count equals `(dropDurationMs + settleDurationMs) / (1000/60)`, y monotonic until settle phase, and `pegHit` count equals `pegRows`.

### Phase 4 — State Machine & Hook
1. Implement `game/stateMachine.ts` as deterministic finite state machine with guards:
   - States: `idle → ready → dropping → landed → revealed`. Each state stores context: `{ selectedIndex, trajectory, frame, prize, seed }`.
   - Events: `INITIALIZE`, `DROP_REQUESTED`, `FRAME_ADVANCED`, `LANDING_COMPLETED`, `REVEAL_CONFIRMED`, `RESET_REQUESTED`.
   - Provide `transition(state, event)` pure function and exported `initialContext`. Guard invalid transitions by throwing errors to surface logic bugs.
2. Create `hooks/usePlinkoGame.ts` to orchestrate:
   - Load prize config and call `selectPrize` on mount.
   - Precompute trajectory before user interaction.
   - Expose: `{ state, prizes, selectedPrize, trajectory, currentFrame, ballPosition, startGame, claimPrize, resetGame }`.
   - Internally use `useReducer` with state machine events (`READY`, `DROP`, `LAND`, `REVEAL`, `RESET`). Store `animationFrameRef` and `startTimestampRef` in `useRef`.
   - Manage animation loop with `requestAnimationFrame`; compute elapsed time per frame and map to trajectory index (`Math.min(Math.floor(elapsed / frameInterval), trajectory.length - 1)`). Transition to `landed` once final frame reached.
   - Ensure cleanup: cancel RAF on unmount and when state leaves `dropping`.
   - Allow deterministic overrides via `useMemo` reading `seed` from query params or props, falling back to random seed.

### Phase 5 — UI Composition
1. `PopupContainer`: fixed-width (375px) centered container with rounded corners and gradient background.
2. `StartScreen`: display title, prize summary (list with probabilities or top rewards), and “Drop Ball” button (primary CTA).
3. `PlinkoBoard`:
   - Render pegs as diamond grid (CSS absolute positioning). Default to 10 rows; row `r` contains `r + 1` pegs. Horizontal spacing = `boardWidth / slotCount`; vertical spacing = `(boardHeight * 0.7) / pegRows`.
   - Render prize slots at bottom using `slotCount` from prize table; winning slot receives `data-winning="true"` and elevated styling.
   - Accept props: `pegLayout`, `slots`, `ballPosition`, `state`, `activeSlotIndex`, `recentPegRow` (last `pegHit` row index).
   - For peg collision feedback, render overlay `<div data-peg-hit={recentPegRow === rowIndex}>` to flash glow when ball passes.
   - Expose `data-testid` for pegs (`peg-{row}-{col}`) and slots (`slot-{index}`) to support tests.
4. `Ball` component: absolutely positioned circle, updated via inline transform based on `ballPosition`, rotating per frame.
   - Include `data-state` attribute mirroring FSM state and `data-frame` showing current frame number for debugging.
   - Apply `will-change: transform` and drop shadow for depth.
5. `PrizeReveal`: overlay shown in `revealed` state with confetti CSS animation (optional), displays prize label/description and “Claim Prize” button.
   - Provide `aria-live="polite"` container with message `Congratulations! You won ${prize.label}.` and auto-focus the claim button when revealed.
6. `Controls`: handles CTA buttons (`startGame`, `claimPrize`, `resetGame`). Disable start button while state ≠ `ready`; disable claim button until reveal animation flagged complete (expose from hook as `canClaim`).
7. Wire everything in `App.tsx` using `usePlinkoGame` hook; pass deterministic seed override from query string (`?seed=...`) when present.
8. Ensure keyboard accessibility (Space/Enter triggers start, focus trapping inside popup). Add Escape key handler to reset game after reveal.

### Phase 6 — Styling & Theming
1. Centralize theme tokens (`config/theme.ts`) with color palette, spacing, font sizes.
2. Use CSS Modules or styled-components to apply consistent theme; ensure high contrast text.
3. Add motion easing constants for animations (ease-out, bounce).
4. Guarantee layout stays within 375px width at all breakpoints; handle small heights by enabling scroll.

### Phase 7 — Testing (Implement All Items Before Ending Task)
1. **Configure Vitest:**
   - Create `vitest.config.ts` extending Vite config and enabling JSX transform + jsdom environment.
   - Add `setupTests.ts` that imports `@testing-library/jest-dom`.
   - Update `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.
2. **Unit Tests (place in `src/tests/`):**
   - `rng.test.ts`
     - Arrange: load mock prize table, call `selectPrize(prizes, fixedSeed)` twice.
     - Assert: both results equal; distribution respects probability weights (e.g., run 1,000 iterations and ensure counts roughly match weights using tolerance ±5%).
   - `trajectory.test.ts`
     - Arrange: call `generateTrajectory` with known params and deterministic seed.
     - Assert: final point x lies within ±2px of expected slot center, y increases monotonically, total frames correspond to 4–6s duration at 60fps, `pegHit` entries exist for each row below the first.
   - `stateMachine.test.ts`
     - Assert: happy-path transitions (`idle → ready → dropping → landed → revealed`) and invalid transitions raise errors (e.g., calling `drop` twice).
3. **Component Tests (React Testing Library):**
   - `PlinkoBoard.test.tsx`
     - Render board with sample trajectory; assert peg count equals layout formula (rows*(rows+1)/2), winning slot receives `data-active="true"` when provided.
   - `App.test.tsx`
       - Mount `<App />` with deterministic seed via test override; simulate clicking “Drop Ball”; use fake timers to fast-forward animation; assert reveal screen displays correct prize label, claim button receives focus, and clicking claim triggers `data-state="completed"` or returns to ready state depending on implementation choice.
4. **Playwright Setup:**
   - Add `playwright.config.ts` targeting Chromium desktop with viewport `width: 400`, `height: 720`, baseURL `http://localhost:4173` (Vite preview default).
   - Update scripts: `"test:e2e": "playwright test"`, `"test:e2e:headed": "playwright test --headed"`.
   - Install browsers: ensure `npx playwright install --with-deps` executed.
5. **Playwright Spec (`e2e/plinko.spec.ts`):**
   - Start Vite preview server inside test using Playwright `test.beforeAll` + `child_process.spawn` (`npm run preview -- --host --port 4173`).
   - Use deterministic seed by visiting `/` with query `?seed=TESTSEED` and ensure app reads it.
   - Steps: wait for start screen, click `Drop Ball`, wait for `[data-state="dropping"]` to change to `revealed` (use `page.waitForSelector('[data-state="revealed"]')` with timeout 10000), verify highlight slot label matches reveal text, take screenshot (optional) for artifact.
6. **Coverage & Reporting:**
   - Enable coverage via `vitest --coverage` (c8). Require ≥80% lines/functions for `src/game/*`.
   - Document how to run coverage in README.
7. **CI Simulation:**
   - Manual sequence to execute before delivery:
     ```bash
     npm run lint
     npm run test -- --runInBand
     npm run test:e2e
     npm run build
     ```
   - Confirm all commands exit with code 0.

### Phase 8 — Verification & QA
1. Run `npm run lint`, `npm run test`, `npm run test:e2e` locally; fix issues immediately.
2. Execute manual Playwright MCP session to confirm visual fidelity in browser (Chrome viewport 400×700, confirm 375px width).
3. Validate animation duration ~5s and ball path looks plausible; adjust easing if necessary.
4. Test accessibility: keyboard navigation, focus states, ARIA labels (`role="button"`, `aria-live` for prize reveal announcement).

### Phase 9 — Documentation & Final Polish
1. Create `README.md` covering:
   - Project summary
   - Tech stack
   - Scripts (dev, build, test, test:e2e)
   - How predetermined outcome works
   - Testing instructions
   - Known limitations
2. Inline code documentation (JSDoc/TSDoc) for key functions (`selectPrize`, `generateTrajectory`).
3. Verify no console warnings in dev or prod build.
4. Pack final build via `npm run build`; ensure `dist/` output exists and is functional via `npm run preview`.

---

## 5. Testing & Quality Gates

- **Static Analysis:** ESLint with recommended + TypeScript rules. Fail build on lint errors (treat warnings as errors via `eslint --max-warnings=0`).
- **Unit Tests:** Cover RNG, trajectory, and state machine with Vitest; enforce ≥80% statements/functions coverage for `src/game/**` using `vitest --coverage`.
- **Integration/Component Tests:** React Testing Library specs must validate DOM structure, accessibility attributes, and state transitions.
- **E2E (Playwright):** Deterministic flow using seeded query string; ensure screenshot/trace artifacts saved on failure for debugging.
- **Performance Smoke:** Within Playwright spec, assert animation completes in < 8s by waiting on `[data-state="revealed"]` with 8000ms timeout.

Quality bar:
- No skipped tests.
- Tests deterministic (seeded randomness, no reliance on real timeouts beyond animation duration).
- README instructions reproducible on macOS with zsh (default environment).

---

## 6. Risk Mitigation & Tips for Agents

- **Deterministic Path:** When generating left/right decisions, ensure the bias function cannot overshoot. Use integer column positions per row, clamp to [0, slotCount-1], and map to x-coordinates using slot width.
- **Animation Smoothness:** Drive the ball using `requestAnimationFrame` and CSS transforms; do not rely on `setInterval`. Use linear time interpolation between trajectory points.
- **State Drift:** Freeze inputs while dropping (`Drop` button disabled). Only allow reset after reveal.
- **Testing Stability:** Inject a fixed seed during tests via environment variable (`VITE_FORCE_SEED`). In production/dev, seed can come from `crypto.getRandomValues`.
- **Playwright Timing:** Instead of `waitForTimeout`, prefer waiting on DOM state (e.g., `[data-state="revealed"]`). Provide failsafe timeout.
- **Accessibility:** Use `aria-live="polite"` for prize message; ensure focus moves to claim button when reveal starts.

---

## 7. Final Delivery Checklist

Before concluding the one-shot implementation, verify each item:

- [ ] Project scaffolding matches structure above.
- [ ] Mock prize table loaded and displayed in start screen.
- [ ] Calling `startGame` immediately selects prize, generates trajectory, disables controls.
- [ ] Ball animation duration 4–6 seconds, visually interacts with pegs, lands in correct slot.
- [ ] Prize reveal modal matches selected prize data.
- [ ] `npm run dev` works; `npm run build` + `npm run preview` render identical behavior.
- [ ] ESLint, Vitest, Playwright all pass with no flakiness.
- [ ] Coverage report shows ≥80% lines/functions for `src/game/**`.
- [ ] README accurately documents setup and testing steps.
- [ ] No unused files, console errors, or TypeScript `ts-ignore` directives.

Follow this plan sequentially. Do not skip phases. Document any deviations directly in the README “Known Issues” section if absolutely necessary (should be empty in ideal delivery).
