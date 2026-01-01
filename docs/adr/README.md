# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the Multiplayer Hong Kong Mahjong project.

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./ADR-001-realtime-architecture.md) | Real-time Architecture | Accepted | 2026-01-01 |
| [ADR-002](./ADR-002-3d-rendering.md) | 3D Rendering Approach | Accepted | 2026-01-01 |
| [ADR-003](./ADR-003-game-logic-location.md) | Game Logic Location | Accepted | 2026-01-01 |
| [ADR-004](./ADR-004-voice-chat.md) | Voice Chat Implementation | Accepted | 2026-01-01 |
| [ADR-005](./ADR-005-state-management.md) | Client State Management | Accepted | 2026-01-01 |
| [ADR-006](./ADR-006-authentication.md) | Authentication Strategy | Accepted | 2026-01-01 |

## Summary

### Technology Stack (from ADRs)

| Component | Decision | ADR |
|-----------|----------|-----|
| Real-time | Supabase Realtime | ADR-001 |
| 3D Rendering | React Three Fiber | ADR-002 |
| Game Logic | Supabase Edge Functions | ADR-003 |
| Voice Chat | WebRTC P2P (simple-peer) | ADR-004 |
| State Management | Zustand | ADR-005 |
| Authentication | Supabase Auth (anonymous + accounts) | ADR-006 |

### Key Architectural Principles

1. **Server-Authoritative**: All game logic runs on the server to prevent cheating
2. **P2P Voice**: Audio never touches our servers for privacy and latency
3. **Unified Backend**: Supabase provides auth, database, realtime, and edge functions
4. **Domain Separation**: Client state split into focused stores
5. **Zero-Friction Guest**: Anonymous auth enables instant play with upgrade path

## ADR Template

When adding new ADRs, use this template:

```markdown
# ADR-XXX: Title

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context

What is the issue that we're seeing that is motivating this decision?

## Decision Drivers

- Driver 1
- Driver 2

## Considered Options

### Option 1: Name

**Pros**:
- ...

**Cons**:
- ...

### Option 2: Name
...

## Decision

What is the change that we're proposing?

## Rationale

Why is this the best choice?

## Consequences

### Positive
- ...

### Negative
- ...

## Related Decisions

- ADR-XXX: ...
```

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Michael Nygard's ADR article](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
