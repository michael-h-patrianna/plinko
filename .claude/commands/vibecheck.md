---
description: Review a code base and check for "vibecoding” mistakes, code hallucinations and long-running-agent drift.
---

Audit this repository for “vibecoding” mistakes, code hallucinations and long-running-agent drift.

=== OPERATING PRINCIPLES (IMMUTABLE) ===
## ACT LIKE THIS
- Be skeptical. Prefer small, verifiable changes. Do not invent APIs, packages, or file paths.
- Preserve repo invariants and prior decisions; if a change breaks an invariant, call it out.
- Minimize churn. If a simpler, smaller fix exists, recommend it.

## SCOPE & INPUTS
- Review what you can see: the diff, touched files, nearby context, project scripts, package/dependency manifests, migrations, config, and tests.
- Assume nothing outside the repo unless explicitly present.

## REVIEW PROCEDURE (follow explicitly)
1) Map the change: list files, major intents, and any cross-cutting invariants affected.
2) Pass 1 (correctness/safety): scan for Critical/Major across SEC, BE, DB, ASYNC, CFG, API.
3) Pass 2 (contracts): HTTP/CLI/DB schemas, migrations, feature flags, event versions.
4) Pass 3 (perf/footguns): N+1, unbounded caches, blocking I/O, logging cardinality.
5) Pass 4 (DX/ops): tests, snapshots, CI scripts, reproducibility, docs/ownership.
6) For each issue, propose the **smallest** fix. Where helpful, include a hunk-level patch.
7) End with a risk rating and a short, sequenced next-steps checklist.

=== END OPERATING PRINCIPLES===

## RULESET (reference these by code)
### REPO & CHANGE MGMT
- CGM-01 Merge/conflict damage or dropped code/tests.
- CGM-02 Partial renames (symbols/files) leaving stale imports/routes.
- CGM-03 Unsafe search/replace (strings/config/generated touched).
- CGM-04 Mixed package managers / lockfile drift (.npmrc/yarn/pnpm).
- CGM-05 .gitignore mistakes (assets ignored; artifacts/keys committed).

### DEPENDENCIES & BUILD
- DEP-01 Hallucinated/nonexistent packages or wrong major versions.
- DEP-02 Version pinning to “latest”/wildcards causing non-repro builds.
- DEP-03 Conflicting transitive deps / toolchain mismatch (Node/Java/Python).
- DEP-04 Docker/build context errors (COPY paths, multi-stage leaks).

### API/LIBRARY USAGE
- API-01 Wrong signatures/options; removed/renamed params.
- API-02 Mixing incompatible paradigms (e.g., React concurrency + legacy).
- API-03 Example creds/URLs/secrets left in code.
- API-04 Platform capability overshoot (API not supported in target runtime).

### ARCHITECTURE & INVARIANTS
- ARC-01 Cross-file/service invariant broken (auth, ID format, event schema).
- ARC-02 Over-abstraction without need; obscures simple logic.
- ARC-03 Inconsistent patterns across modules (state mgmt, error model).

### DATA & SCHEMA
- DB-01 Migration drift/order issues; destructive forwards; missing backfills.
- DB-02 ORM ↔ DB mismatch (nullability, default values, casing).
- DB-03 N+1 queries / missing indexes introduced by change.
- DB-04 Serialization mismatch (JSON/proto/Avro, enum name vs value).
- DB-05 Timezone/locale gotchas (naive vs aware datetimes).

### CONCURRENCY & ASYNC
- ASYNC-01 Forgotten await/unreturned promise; dropped errors.
- ASYNC-02 Race conditions; non-idempotent handlers; double-spend risk.
- ASYNC-03 Event loop blocking / deadlocks; leaked goroutines/threads.

### ERRORS & LOGGING
- ERR-01 Over-broad catches; swallow root cause; retrying non-retryables.
- ERR-02 Secrets/PII in logs; overlogging/high cardinality.

### CONFIG & ENVIRONMENTS
- CFG-01 Wrong env var names/defaults; prod uses dev fallbacks.
- CFG-02 Dangerous defaults (open CORS, debug true) committed.
- CFG-03 Feature-flag divergence/staleness; infra naming drift.

### TESTING & QUALITY
- TST-01 Snapshot churn to “make tests pass”; behavior changed.
- TST-02 Order-dependent tests/shared state; flakes.
- TST-03 Mocking wrong layer; contracts untested; low branch coverage.
- TST-04 Disabled/flaky tests left (`skip`, `ignore`).

### FRONTEND
- FE-01 Hydration mismatches (SSR vs CSR); non-deterministic render.
- FE-02 React keys/effect deps; missing cleanup.
- FE-03 A11y regressions (labels, roles, focus traps).
- FE-04 CSS cascade/z-index regressions from global styles.

### BACKEND & SERVICES
- BE-01 HTTP contract mistakes (status codes, pagination, idempotency).
- BE-02 Retry storms (no jitter/backoff); thundering herd.
- BE-03 Webhook verification missing (signature/replay).

### PERFORMANCE & RESOURCES
- PERF-01 Algorithmic regressions (O(n^2) joins, unnecessary sorts).
- PERF-02 Memory/cache leaks; unbounded structures.
- PERF-03 Over-chatty network; missing batching.

### SECURITY
- SEC-01 Injection (SQL/NoSQL/LDAP) via string concat.
- SEC-02 XSS/CSRF/SSRF; unescaped HTML; open URL fetch.
- SEC-03 Broken object-level auth; route-level check only.
- SEC-04 Weak/rolled crypto; static IVs; PRNG misuse.
- SEC-05 Secrets in code/config; accidental secret exposure.

### OBSERVABILITY & ANALYTICS
- OBS-01 Metric label cardinality explosions; cost/SNR issues.
- OBS-02 Incorrect units/percentiles; missing trace correlation.
- OBS-03 Analytics/event naming drift; broken funnels.

### PORTABILITY & PLATFORM
- PORT-01 Path/FS assumptions (case sensitivity, line endings).
- PORT-02 Encoding/locale surprises; emoji width; unicode.
- PORT-03 FD/ephemeral port exhaustion risk.

### DOCS & GOVERNANCE
- DOC-01 Docs/ADRs/OpenAPI not updated with behavior change.
- DOC-02 Misleading comments/docstrings copied from elsewhere.
- DOC-03 Ownership gaps; missing CODEOWNERS for touched dirs.

### 3RD-PARTY INTEGRATIONS
- INT-01 Quota/rate-limit ignorance; no 429 handling.
- INT-02 Missing idempotency keys (payments/webhooks).
- INT-03 Sandbox vs prod confusion (keys/envs crossed).

### LLM/AGENT-SPECIFIC
- AGT-01 Instruction/prompt drift; ignores project constraints.
- AGT-02 Tool/log misread; wrong diagnosis of compile/test failures.
- AGT-03 Over-generalization of patterns “because it looks right”.
- AGT-04 Fabricated references (APIs, RFCs).
- AGT-05 Stale code search/RAG (old decisions retrieved).

## SEVERITY LADDER (use consistently)
- Critical: correctness/security/data loss/double-charge/crash likely.
- Major: breaks invariants or common paths; prod incident plausible.
- Moderate: reliability/perf regression or edge-case correctness bug.
- Minor: maintainability, clarity, small risk.
- Info: non-blocking nits.

## CONSTRAINTS
- Do not tell me to “add tests later”—propose the exact test and where it lives.
- Do not suggest adding new dependencies unless strictly necessary.
- Prefer diffs that limit blast radius and preserve public contracts.

## OUTPUT FORMAT (strict)
1) Summary (3–6 bullets)
2) Findings (ordered, most severe first)
   - For each finding, include:
     • Severity: Critical | Major | Moderate | Minor | Info
     • Confidence: High | Medium | Low
     • File:Line (or symbol)
     • Rule code (e.g., DEP-01), Tags (comma-separated)
     • Why this matters (1–3 sentences)
     • Evidence (exact snippet or diff hunk)
     • Recommendation (concise, minimal-diff fix)
     • (If applicable) Suggested patch as a unified diff
     • Validation: tests or commands to run
3) Repo-wide concerns (ownership, build, CI, docs)
4) Risk assessment (1–5) + reasons
5) Next steps checklist (max 6 items, actionable, smallest-first)

Now produce the review using the OUTPUT FORMAT exactly.
