# Implementation Plan: Multiplayer Hong Kong Mahjong

**Version**: 1.0
**Status**: Draft
**Created**: 2026-01-01
**Spec**: [spec.md](./spec.md)

## Technical Context

### Stack
- **Frontend**: Next.js 14+ (App Router), React Three Fiber, Tailwind CSS, Zustand
- **Backend**: Supabase (Auth, Realtime, PostgreSQL, Edge Functions)
- **Voice**: WebRTC with simple-peer, signaling via Supabase Realtime
- **Testing**: Vitest (unit), Playwright (E2E)
- **Tooling**: TypeScript (strict), Biome (lint/format)

### Key Technical Decisions
1. **Server-authoritative game logic** - All game state mutations via Edge Functions
2. **Supabase Realtime for sync** - Game state, chat, WebRTC signaling
3. **React Three Fiber for 3D** - Declarative 3D with React patterns
4. **ELO-based matchmaking** - Standard algorithm, 1200 starting rating

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────────┐│
│  │  Lobby  │ │  Room   │ │  Game   │ │  Profile/Stats      ││
│  │  Page   │ │  Page   │ │  View   │ │  Pages              ││
│  └────┬────┘ └────┬────┘ └────┬────┘ └──────────┬──────────┘│
│       │           │           │                  │           │
│  ┌────┴───────────┴───────────┴──────────────────┴────────┐ │
│  │              Zustand State Management                   │ │
│  │   (game state, chat, voice, user session)              │ │
│  └────────────────────────┬───────────────────────────────┘ │
└───────────────────────────┼─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Supabase   │   │   Supabase   │   │   WebRTC     │
│     Auth     │   │   Realtime   │   │  (P2P Voice) │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   │
┌──────────────┐   ┌──────────────┐             │
│   Postgres   │   │    Edge      │◄────────────┘
│   Database   │◄──│  Functions   │   (signaling)
└──────────────┘   └──────────────┘
```

## Implementation Phases

### Phase 1: Foundation (Core Infrastructure)
1. Project scaffolding (Next.js, TypeScript, Tailwind, Biome)
2. Supabase project setup (Auth, Database, Realtime)
3. Database schema and RLS policies
4. Authentication flow (guest + optional account)
5. Basic routing and layout

### Phase 2: Game Engine (Server-Side Logic)
1. Tile system (136 tiles, suits, encoding)
2. Game state machine (draw, discard, meld, win)
3. HK Mahjong rule validation
4. Faan calculation engine
5. Edge Functions for game actions
6. Turn management and timers

### Phase 3: 3D Interface
1. React Three Fiber setup
2. Table and tile 3D models
3. Player hand rendering
4. Opponent hands (backs only)
5. Discard pile layout
6. Meld display
7. Tile interactions (hover, select, discard)
8. Animations (draw, discard, meld reveal)

### Phase 4: Room System
1. Room creation and join
2. Invite code generation/validation
3. Lobby UI (waiting room)
4. Ready status and game start
5. Host controls (settings, kick, ban)
6. Host transfer on disconnect

### Phase 5: Real-time Sync
1. Supabase Realtime channel setup
2. Game state synchronization
3. Presence (online players in room)
4. Reconnection handling
5. Optimistic updates with server reconciliation

### Phase 6: Chat System
1. Text chat component
2. Message persistence
3. Quick phrase buttons
4. Emoji reactions
5. Profanity filter integration
6. Rate limiting

### Phase 7: Voice Chat
1. WebRTC peer connections
2. Signaling via Realtime
3. Audio stream handling
4. Mute controls
5. Push-to-talk mode
6. Connection state UI

### Phase 8: Matchmaking
1. Queue management
2. ELO-based matching algorithm
3. Rating range expansion
4. Match accept/decline flow
5. Rating calculation post-game
6. Placement matches handling

### Phase 9: Moderation & Reports
1. Report submission form
2. Report queue (admin view)
3. Ban system (temp/permanent)
4. Shadow mute implementation
5. Admin dashboard

### Phase 10: Statistics & Replays
1. Stats tracking and aggregation
2. Profile page with stats
3. Leaderboard
4. Game action logging
5. Replay storage
6. Replay playback UI

## Data Flow

### Game Action Flow
```
Player Action
    │
    ▼
┌─────────────────┐
│ Client Validates│ (basic checks only)
│ & Sends Action  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Edge Function   │
│ - Full validation│
│ - Apply to state│
│ - Calculate score│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Broadcast via   │
│ Realtime Channel│
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
 Player1  Player2  Player3  Player4
 (update) (update) (update) (update)
```

### Matchmaking Flow
```
Player Joins Queue
    │
    ▼
┌─────────────────┐
│ Add to Queue    │
│ with ELO + prefs│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Matcher Process │
│ (runs every 5s) │
│ - Find 4 players│
│ - Within ELO ±X │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Found?  │
    └────┬────┘
    yes  │  no
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│Create │ │Expand │
│ Match │ │ Range │
└───────┘ └───────┘
```

## Testing Strategy

### Unit Tests (Vitest)
- Tile encoding/decoding
- Hand validation
- Faan calculation
- Win detection
- ELO calculation
- Profanity filter

### Integration Tests
- Edge Function game actions
- Realtime message flow
- Auth flows (guest, account)
- Room lifecycle

### E2E Tests (Playwright)
- Full game flow (4 players)
- Matchmaking flow
- Chat and voice (mocked)
- Reconnection scenarios

## Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Complex HK rules | Comprehensive unit tests; reference existing implementations |
| 3D performance | Progressive loading; instanced meshes; 2D fallback |
| Realtime latency | Optimistic updates; server reconciliation |
| Cheating | Server-authoritative; never send hidden tiles |
| Voice reliability | Fallback to text; reconnection logic |

## Dependencies

### External Services
- Supabase Cloud (auth, db, realtime, edge functions)
- Vercel (hosting)

### Key Libraries
- `@supabase/supabase-js` - Supabase client
- `@react-three/fiber` + `@react-three/drei` - 3D rendering
- `zustand` - State management
- `simple-peer` - WebRTC wrapper
- `bad-words` - Profanity filter
- `zod` - Runtime validation

## Deliverables

1. Functional multiplayer HK Mahjong game
2. Guest and account-based authentication
3. Private rooms with invite codes
4. Public ranked matchmaking
5. 3D game interface with animations
6. Text chat with profanity filter and quick phrases
7. Voice chat with mute controls
8. Moderation tools (kick, ban, report)
9. Player statistics and ratings
10. Game replay system
