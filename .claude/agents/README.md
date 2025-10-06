# Plinko Specialized Agent Team

Created: 2025-10-06

## Overview
This directory contains 10 specialized agents for the Plinko project, each focused on a specific domain with implementation-agnostic prompts.

## Agent Roster

### Implementation Specialists (5 agents)

**1. physics-engine-specialist** - Deterministic physics, collision detection, trajectory generation
**2. animation-specialist** - 60 FPS performance, GPU acceleration, smooth animations
**3. state-machine-specialist** - Game state management, transitions, event handling
**4. ui-polish-specialist** - Visual refinement, accessibility, theming, micro-interactions
**5. typescript-guardian** - Type safety, eliminating 'any', strict mode compliance

### Quality & Structure Guardians (3 agents)

**6. testing-architect** - Test coverage, Vitest, Playwright, validation strategy
**7. architecture-guardian** - Project structure, folder organization, asset placement
**8. code-reviewer** ⭐ - Post-implementation review, security, best practices (use PROACTIVELY)

### Problem Solvers (2 agents)

**9. debugger** ⭐ - Root cause analysis, error investigation (use PROACTIVELY)
**10. integration-coordinator** - Multi-agent orchestration, system-wide integration

## Design Philosophy

### Implementation-Agnostic
All agents avoid referencing specific file paths or current implementation. They focus on principles, responsibilities, and domain expertise.

### Concise Format
- All files under 4KB (range: 1.7KB - 2.3KB)
- Correct YAML frontmatter (name + description only)
- Clear mission statements and quality gates

### Constitutional AI
Each agent has immutable principles, clear boundaries, self-verification checkpoints, and escalation protocols.

## Common Workflows

**Feature Development**:
1. Specialist implements → code-reviewer reviews → testing-architect validates

**Bug Investigation**:
1. debugger investigates → Specialist fixes → testing-architect adds regression test

**Multi-Domain Work**:
1. integration-coordinator orchestrates → Specialists execute → Verify integration

## Agent Evaluation Results

After thorough analysis, these agents were considered but NOT added:

- **QA Specialist** - Covered by testing-architect
- **React Specialist** - React is baseline, all agents know React
- **API Specialist** - No backend in this project
- **Mock Data Specialist** - Test data too simple
- **Documentation Specialist** - Each agent documents their work
- **Refactoring Specialist** - Part of maintenance work
- **Accessibility Specialist** - Covered by ui-polish-specialist
- **Security Specialist** - Limited attack surface, code-reviewer handles
- **Theme Specialist** - Covered by ui-polish-specialist
- **Config Specialist** - Too narrow, architecture-guardian handles

## File Sizes
```
1.7K testing-architect.md
1.8K animation-specialist.md
1.9K state-machine-specialist.md
1.9K typescript-guardian.md
1.9K ui-polish-specialist.md
2.0K code-reviewer.md
2.1K architecture-guardian.md
2.1K debugger.md
2.3K integration-coordinator.md
2.3K physics-engine-specialist.md
```

## Maintenance

When architecture evolves, these agents remain relevant because they focus on principles rather than implementation details. They adapt to new file structures automatically.
