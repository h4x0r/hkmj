# Research: Multiplayer Hong Kong Mahjong

## Technical Decisions

### 1. Real-time Architecture

**Decision**: Supabase Realtime with Postgres Changes and Broadcast

**Rationale**:
- Unified stack (auth, db, realtime in one service)
- Built-in presence for online status
- Broadcast channels for game actions
- Postgres Changes for persistent state sync
- No separate WebSocket server to manage

**Alternatives Considered**:
- Socket.io: More control but requires server management
- Liveblocks: Great DX but additional vendor dependency
- PartyKit: Edge-based but newer, less proven

### 2. 3D Rendering

**Decision**: React Three Fiber with @react-three/drei helpers

**Rationale**:
- Declarative 3D fits React mental model
- Excellent ecosystem (drei helpers, postprocessing)
- Good performance with instanced meshes
- Large community, well-documented
- Integrates naturally with Next.js

**Alternatives Considered**:
- Vanilla Three.js: More control but imperative, harder to maintain
- Babylon.js: Powerful but larger bundle, different paradigm
- 2D Canvas: Simpler but less immersive

### 3. State Management

**Decision**: Zustand for client state

**Rationale**:
- Minimal boilerplate
- Works well with React Server Components
- Easy to split stores by domain
- Built-in devtools support
- TypeScript-first

**Alternatives Considered**:
- Redux Toolkit: More structure but more boilerplate
- Jotai: Atomic but less suited for complex state
- React Context: Simpler but re-render concerns

### 4. WebRTC Voice Chat

**Decision**: simple-peer with Supabase Realtime signaling

**Rationale**:
- simple-peer abstracts WebRTC complexity
- Mesh topology works for 4 players
- Supabase Realtime handles signaling (no STUN/TURN server)
- Peer-to-peer reduces server load

**Alternatives Considered**:
- LiveKit: More features but adds complexity and cost
- Daily.co: Easy but vendor lock-in
- Raw WebRTC: Maximum control but significant complexity

### 5. Game Logic Location

**Decision**: Server-authoritative via Supabase Edge Functions

**Rationale**:
- Prevents cheating (client can't manipulate state)
- Single source of truth
- Hidden tiles never sent to wrong clients
- Edge Functions are fast and scalable

**Alternatives Considered**:
- Client-side with validation: Faster but cheat-prone
- Separate game server: More control but more infrastructure
- Shared logic (isomorphic): Complex to maintain secrecy

### 6. Tile Encoding

**Decision**: String-based encoding (e.g., "1B", "RD", "EW")

**Rationale**:
- Human-readable for debugging
- Easy to serialize/transmit
- Simple comparison
- Maps directly to display

**Encoding Scheme**:
```
Bamboo:    1B-9B (9 tiles × 4 = 36)
Character: 1C-9C (9 tiles × 4 = 36)
Dot:       1D-9D (9 tiles × 4 = 36)
Wind:      EW, SW, WW, NW (East/South/West/North × 4 = 16)
Dragon:    RD, GD, WD (Red/Green/White × 4 = 12)
Total:     136 tiles
```

### 7. Profanity Filter

**Decision**: Server-side filter using bad-words + custom word list

**Rationale**:
- Server-side prevents bypass
- bad-words is well-maintained
- Custom word list for Mahjong-specific terms
- Supports replacement (asterisks)

**Alternatives Considered**:
- Client-side only: Easily bypassed
- AI-based (Perspective API): More accurate but adds latency and cost
- Regex patterns: Brittle, hard to maintain

### 8. ELO Rating System

**Decision**: Standard ELO with K-factor adjustment

**Rationale**:
- Well-understood algorithm
- Fair for 4-player games (all players rated)
- Simple to implement
- Placement matches use higher K-factor

**Formula**:
```
Expected: E = 1 / (1 + 10^((Ro - R)/400))
New rating: R' = R + K × (S - E)
K = 32 (standard), 64 (placement)
S = 1 (win), 0 (loss)
```

### 9. Session Storage

**Decision**: Browser sessionStorage for guest, Supabase for accounts

**Rationale**:
- Guests don't need persistence beyond session
- Quick start without signup friction
- Upgrade path to full account
- Account data fully managed by Supabase Auth

### 10. Asset Delivery

**Decision**: Static assets on Vercel CDN, textures optimized

**Rationale**:
- Vercel CDN is fast and global
- Next.js image optimization for textures
- GLTF for 3D models (compressed)
- Lazy loading for non-critical assets

## HK Mahjong Rules Reference

### Faan Table (Standard HK)
| Hand | Faan |
|------|------|
| All Chows (平糊) | 1 |
| All Pongs (對對糊) | 3 |
| Mixed One Suit (混一色) | 3 |
| All One Suit (清一色) | 7 |
| All Honors (字一色) | 10 |
| Self-draw (自摸) | +1 |
| Robbing Kong (搶槓) | +1 |
| Winning on Last Tile | +1 |
| Concealed Hand | +1 |

### Win Conditions
1. 4 melds (Chow/Pong/Kong) + 1 pair = 14 tiles
2. Special hands (Thirteen Orphans, etc.)
3. Must meet minimum faan requirement

### Turn Order
1. Counter-clockwise from dealer (East)
2. Dealer: East → South → West → North
3. Round ends when all players have been dealer once

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial load | < 3s | Lighthouse |
| 3D render | 60fps | DevTools |
| Action latency | < 200ms | End-to-end |
| Matchmaking | < 90s (80%) | Analytics |
| Voice latency | < 150ms | WebRTC stats |
