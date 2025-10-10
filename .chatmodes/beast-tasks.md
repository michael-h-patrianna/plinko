# Beast Mode Tasks

## Phase Overview
- [✓] Phase 1 – Understand & Plan
  - [✓] Reconcile user’s latest manual edits with existing remediation plan
  - [✓] Refresh diagnostics (lint/test) to scope remaining work
- [ ] Phase 2 – Implement Solution
  - [✓] Replace deprecated `MutableRefObject` usage across hooks/tests
  - [ ] Normalize async utilities/tests to satisfy `require-await` and `no-floating-promises`
  - [ ] Eliminate unsafe `any` usage and redundant type parameters in animation/platform layers
  - [ ] Fix remaining lint violations (prefer-const, unbound-method, etc.)
- [ ] Phase 3 – Validate & Iterate
  - [ ] Run eslint with zero warnings
  - [ ] Run full vitest suite passing
  - [ ] Run npm run build without warnings
