Assumptions & Notes

- README.md contains primary functional and architectural context (confirmed). [confidence: high]
- Mobile web is primary performance target; React Native parity planned using Reanimated, Moti, LinearGradient. [confidence: high]
- Stack: React 18 + TypeScript + Vite + Tailwind per README. [confidence: high]
- Physics engine precomputes trajectories (50-200ms avg) before playback; worst-case 5-10s. [confidence: high]
- `generateTrajectory` runs on main thread with up to 50k attempts and per-frame O(pegs) collision checks (map cleanup, sqrt). [confidence: medium]
- Ball component maintains per-frame trail state via `setTrail` + `Date.now()` keys; potential GC + rerender cost. [confidence: medium]
- Peg component logs to console on each collision; high-frequency console I/O will tank FPS on mobile. [confidence: high]
- Multiple animation components (`SlotWinReveal`, `SlotAnticipation`) call `Math.random()` during render, breaking memoization and forcing layout thrash. [confidence: medium]
- Framer Motion used extensively; React Native target will require API parity (Moti/Reanimated). [confidence: medium]

Decisions

- Proceed with documentation-first workflow before suggesting code changes. [rationale: request limited to review/report]

Context Sources

- README.md (reviewed)
- Repository structure listing
- `src/game/trajectory.ts`, `rng.ts`, `stateMachine.ts`
- UI components: `App.tsx`, `PlinkoBoard`, `Ball`, `Peg`, win animations
