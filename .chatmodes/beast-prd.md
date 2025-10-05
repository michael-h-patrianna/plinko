Problem Statement

Deliver a comprehensive performance-focused code review and recommendations for the Plinko web app targeting mobile web users, with forward-looking considerations for a React Native port.

Users & JTBD

- Product engineers optimizing a Plinko game experience.
- Need actionable insights on current performance strengths, weaknesses, and roadmap items.

Goals & Success Criteria

- Produce a detailed performance review in `docs/performance.md`.
- Highlight good practices, identify bottlenecks, and prioritize improvements.
- Include React Native translation considerations (Reanimated, Moti, LinearGradient).
- Suggest next steps tailored to low-frequency gameplay (≤2 sessions/day).

Scope

In Scope:
- Review README content and relevant repo context.
- Analyze performance aspects (runtime, bundle, rendering, network, assets, tooling).
- Document findings and recommendations.

Out of Scope:
- Implementing code changes.
- Running automated performance tooling unless necessary for insights.

Functional Requirements

- Create or update `docs/performance.md` with structured report.
- Cover good vs bad practices, improvement ideas, next steps.
- Address mobile web and React Native considerations.

Non-Functional Requirements

- Report should be thorough, evidence-based, and actionable.
- Emphasize mobile performance constraints (latency, bundle size, battery).
- Highlight maintainability and scalability for future Native port.

Acceptance Criteria

- `docs/performance.md` exists with comprehensive performance analysis.
- Document references README insights and repository structure observations.
- Recommendations prioritized with rationale and potential impact.
- Includes section on React Native translation strategy.
