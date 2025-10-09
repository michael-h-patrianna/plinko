---
description: Review a React Web code base and check for style guide violations.
---

Audit this repository for violations of the style rules defined in this prompt and return precise, actionable refactoring instructions that bring the code back into compliance.

=== OPERATING PRINCIPLES (IMMUTABLE) ===
1. **Scope Discipline:** Review only repository content that impacts front-end implementation (TypeScript/TSX/JSX, styling, hooks, services, config). Ignore generated artifacts (`dist/`, coverage reports, screenshots, etc.).
2. **Evidence-Backed Findings:** Flag an issue only when you can cite exact file paths and line ranges. Never speculate.
3. **Actionable Guidance:** Every violation must include concrete refactoring steps (what to change, how, and why it aligns with the style guide).
4. **Adherence Guard:** If instructions or data are missing to complete the task, surface the gap instead of guessing.

=== STYLE GUIDE CONTRACT ===
Treat each statement below as an enforceable rule. This prompt is self-contained—do not look elsewhere for guidance. When scanning code, map every finding to one (or more) rule IDs:

#### Core Engineering Principles
- **P1 Intentional architecture:** Single responsibility per module; domain logic in hooks/services, UI components remain presentational.
- **P2 Deterministic state:** Prefer finite state machines, typed events, reducers over scattered `useState` chains.
- **P3 Performance-first:** Memoize aggressively, minimize re-renders, keep animation loops lean.
- **P4 Resilience & recovery:** Error boundaries, user feedback, reset flows that recover without reloads.
- **P5 Observability & guards:** Telemetry at critical transitions, refs/guards against illegal transitions, immediate anomaly logging.

#### Architectural Conventions
- **A1 Folder discipline:** `components/`, `hooks/`, `services/`, `config/`, `theme/`, `constants/`, `utils/` each own their domain with colocated assets/tests.
- **A2 Hooks composition:** Hooks encapsulate reusable logic; compose small hooks into orchestrators while containing side effects.
- **A3 Services purity:** Services remain framework-agnostic, own deterministic business logic.
- **A4 Config clarity:** Typed providers/helpers for runtime config and feature flags.
- **A5 Tokens centralization:** Layout tokens (spacing, radii, gradients) centralized; avoid deep imports/inline sprawl.

#### State & Effects
- **S1 State machines:** Model complex flows with state machines; document transitions in `docs/`.
- **S2 Effect hygiene:** Each `useEffect` has a single purpose, stable deps, explicit cleanup.
- **S3 Stable references:** Use `useCallback`, `useMemo`, `useSyncExternalStore` for callbacks across renders.
- **S4 Refs for coordination:** Use refs for multi-phase flows without forcing re-renders.

#### Rendering & Styling
- **R1 Shallow trees:** Split large containers into focused subcomponents.
- **R2 Shared animation driver:** Use shared animation driver (e.g., Framer Motion) with consistent API.
- **R3 Tokenized layout:** Mirror inline dynamic styles with theme/Tailwind tokens.
- **R4 Memo heavy children:** Memoize grid/list/SVG-heavy children (`React.memo`, memoization hooks).

#### Coding Standards
- **C1 TypeScript strictness:** Strict types, discriminated unions, no `any` w/o justification.
- **C2 Documentation first:** Top-level JSDoc for hooks/components, plus companion docs for complex systems.
- **C3 Error handling:** Actionable user messaging + structured logging.
- **C4 Pure domain logic:** Physics/randomization/prize logic pure, dependency-injected.

#### Testing Expectations
- **T1 Deterministic unit tests:** Cover domain modules with seeds and edge cases.
- **T2 Component testing:** Testing Library coverage for render/a11y/state transitions.
- **T3 Integration & E2E:** Playwright (or similar) for animation-heavy flows and visual regressions.
- **T4 Dev tooling gates:** `_internal` APIs gated from prod usage.
- **T5 Deterministic CI:** Tests seeded/mocked to avoid flake.

#### Documentation & Knowledge Sharing
- **D1 Maintain ADRs:** Major decisions documented.
- **D2 Critical pipelines docs:** Reset orchestration, animation pipelines, algorithms documented w/ diagrams.
- **D3 Onboarding flows:** Guides explaining path from entry points to reusable primitives.

#### Developer Experience
- **X1 Dev tool isolation:** Dev tools plug-in without touching prod paths.
- **X2 Feature flags:** Use config providers for safe toggles.
- **X3 Modular bundle:** Lazy-load dev panels/effect-heavy components.
- **X4 Typed adapters:** Predictable typed adapters for platform features.

#### Code Review Checklist Compliance
- **Q1 Respect boundaries/domain ownership.**
- **Q2 Deterministic state & effects.**
- **Q3 Performance characteristics considered.**
- **Q4 Error handling & telemetry present.**
- **Q5 Tests cover happy & failure paths.**
- **Q6 Documentation updated.**

#### Common Mistakes (Explicit Anti-Patterns)
- **M1 Unstructured state:** Scattered `useState`, implicit side effects.
- **M2 Inline styling sprawl:** Layout-critical inline styles without tokens.
- **M3 Premature abstraction:** Excessive indirection without payoff.
- **M4 Custom platform hacks:** UA sniffing vs. tested adapters.
- **M5 Shallow testing:** Missing deterministic coverage for race conditions.
- **M6 Opaque errors:** Missing actionable feedback/logging.

#### Continuous Improvement
- **I1 Remove legacy signatures once unused.**
- **I2 Re-evaluate custom infra vs. off-the-shelf.**
- **I3 Ship QoL improvements opportunistically.**

=== REVIEW WORKFLOW ===
1. **Orientation:** Review the style rules above and identify focus areas based on changed files or modules under review.
2. **Targeted Recon:** Use repo search to locate files likely to violate high-risk rules (state machines, animation loops, styling tokens, adapters, tests, docs).
3. **Deep Inspection:** For each candidate file, confirm violations with specific line ranges and explain why the current implementation breaks the linked rule.
4. **Refactor Design:** For every confirmed violation, prescribe a minimal, deterministic fix (architectural reshaping, state refactor, memoization, tests, docs). Mention ripple effects (e.g., required test updates, docs to amend).
5. **Prioritization:** Classify each issue severity as `blocker`, `high`, `moderate`, or `info` based on user impact and risk.
6. **Verification Plan:** Suggest how to validate the refactor (tests to run, metrics to monitor).

=== OUTPUT FORMAT ===
Respond in the following fenced block. All arrays must be non-empty when present; omit sections that truly have zero findings.

```codereview
{
  "summary": {
    "scope": "short description of inspected areas",
    "overall_risk": "blocker|high|moderate|low",
    "key_themes": ["brief bullets of recurring issues"]
  },
  "violations": [
    {
      "rule_id": "e.g. P2",
      "severity": "blocker|high|moderate|info",
      "file": "relative/path.tsx",
      "lines": "L45-L78",
      "evidence": "Quote or paraphrase of the problematic code/behavior",
      "impact": "Why this matters (performance, correctness, DX)",
      "refactor_plan": {
        "steps": ["ordered list of changes"],
        "aligned_rule": "Rule(s) the fix satisfies",
        "verification": ["tests or checks to run"]
      }
    }
  ],
  "follow_up": {
    "fast_wins": ["1-2 small QoL improvements"],
    "bigger_initiatives": ["Larger refactors or docs updates to schedule"],
    "open_questions": ["Any uncertainties requiring human clarification"]
  }
}
```

=== QUALITY GATE (CHECK BEFORE RETURNING) ===
- ✓ Each violation maps to at least one rule ID listed above.
- ✓ Every `refactor_plan.steps` entry is actionable (mentions concrete code changes, tests, or documentation updates).
- ✓ All cited files and line ranges exist and correspond to real evidence gathered.
- ✓ `overall_risk` reflects the highest severity among findings; set to `low` only if no violations.
- ✓ If no violations found, return an empty `violations` array but still provide `summary` and `follow_up` (with `fast_wins` suggestions).

If any check fails, revise once. If still failing due to missing data, return a refusal with the format `{"error": "styleguide review blocked", "reason": "..."}` inside the `codereview` fence.
