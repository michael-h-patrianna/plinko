# Configuration & Feature Control Audit

_Last reviewed: 2025-10-06_

## Overview
The current Plinko implementation mixes configuration concerns across multiple modules without a unifying contract. This audit catalogues existing patterns to inform the new feature-flag and configuration framework.

## Key Sources Reviewed
- `src/config/prizeTable.ts`
- `src/config/productionPrizeTable.ts`
- `src/config/theme.ts`
- `src/hooks/usePlinkoGame.ts`
- `src/App.tsx`

## Findings
### Prize Data Generation
- Two parallel modules (`prizeTable.ts`, `productionPrizeTable.ts`) each export random generators and validation helpers.
- `usePlinkoGame` directly imports `createValidatedProductionPrizeSet()` and stores the generated array in local React state.
- Both generation paths normalize probabilities but differ in data shape (`PrizeConfig` vs `Prize`).
- Selection logic (`selectPrize`) relies on local RNG rather than an injectable provider, preventing deterministic outcomes.

### Theme & Visual Tokens
- `src/config/theme.ts` exposes a static theme object and popup dimensions without runtime overrides.
- Consumers import `ThemeProvider` helpers from `src/theme/` rather than the config module, revealing duplicated token definitions.

### Runtime Options & Environment Flags
- `App.tsx` handles viewport sizing and mobile detection inline using direct DOM APIs.
- No central configuration object exists—options (board width, seed overrides, choice mechanic) are passed ad hoc via `usePlinkoGame` props.
- Development tooling mounts unconditionally; enabling/disabling logic is hard-coded inside components rather than driven by environment flags.

### Validation & Utilities
- Prize validation lives in `src/utils/prizeUtils.ts`, but it is invoked only during mock set generation.
- There is no shared type guard for backend-supplied payloads or deterministic seeds.

## Gaps Identified
1. **Missing `AppConfig` abstraction** to surface feature toggles, platform adapters, and prize providers.
2. **Inconsistent prize interfaces** between mock/demo and production modules.
3. **Configuration scattered across hooks and components**, making it hard to reuse on React Native or server-rendered hosts.
4. **Lack of dependency injection** for RNG, storage, viewport, and logging services.

## Recommended Next Steps
- Introduce a central `AppConfig` interface (host-provided) with default mock implementation.
- Consolidate prize generation behind an injectable provider that wraps validation logic.
- Move environment-sensitive checks (e.g., `window`, `navigator`) into platform adapters.
- Create dedicated feature-flag utilities for dev tooling and experimental mechanics.

This audit should be referenced before implementing the configuration framework so new abstractions align with the current state of the codebase.
