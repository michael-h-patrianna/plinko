# Documentation Archive

This directory contains completed implementation notes and historical documentation that have been archived for reference.

## Archived Documents

### Collision Detection Refactor (2025-10-11)

**`collision-refactor-plan-2025-10-11.md`** (36KB)
- Detailed step-by-step implementation plan for removing visual feedback pass
- **Status**: Implementation complete
- **Reference**: See [docs/collision-review.md](../collision-review.md) and [docs/adr/007-ccd-collision-detection.md](../adr/007-ccd-collision-detection.md) for current documentation

### Sound Engine Integration (2025-01-11)

**`sound-integration-summary-2025-01-11.md`** (8KB)
- Implementation summary for initial sound engine integration
- Documents AudioProvider, useAudioPreloader, and button click sounds
- **Status**: Implementation complete ✅
- **Reference**: See [docs/sound-engine.md](../sound-engine.md) for current sound architecture

**`sound-throttle-implementation.md`** (10KB)
- Implementation notes for sound effect throttling system
- **Status**: Feature complete
- **Reference**: Throttling logic integrated into sound engine

## When to Archive Documentation

Archive documentation when:
1. ✅ Implementation is complete and tested
2. ✅ Core concepts are documented in permanent docs (ADRs, architecture.md, etc.)
3. ✅ Step-by-step implementation notes are no longer needed for active development
4. ✅ Document is marked "Implementation Complete" or similar

## Archive Naming Convention

Use the format: `{topic}-{date}.md`

Examples:
- `collision-refactor-plan-2025-10-11.md`
- `sound-integration-summary-2025-01-11.md`

This makes it easy to find historical context when needed while keeping the main docs/ directory focused on active documentation.
