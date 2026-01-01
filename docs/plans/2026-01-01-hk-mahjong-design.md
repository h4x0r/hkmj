# Hong Kong Mahjong Multiplayer Game - Design Document

## Overview

A Next.js multiplayer Hong Kong Mahjong game with 3D graphics, real-time gameplay, voice chat, and ranked matchmaking.

## Requirements Summary

### Use Cases
- **Private rooms**: Friends play together via invite codes
- **Public matchmaking**: Ranked play with ELO-based matching

### Authentication
- **Optional accounts**: Guests can play immediately, accounts unlock stats/rankings
- Guest players get temporary IDs, can upgrade to full account

### Game Rules
- **Hong Kong Mahjong** with traditional scoring (3 faan minimum default)
- **Configurable settings**: Min faan (0-5), session type, flower tiles, turn timer
- **Session types**: Single round (default), East-only, Full game

### Communication
- Text chat with profanity filter
- Quick phrases ("Pong!", "Kong!", "Good game")
- Emoji reactions to plays
- WebRTC voice chat (peer-to-peer mesh)

### Moderation
- Profanity filter (server-side)
- Kick/ban/mute controls for room host
- Report system with admin review
- Temporary and permanent bans

### Technical Constraints
- No live spectators (cheating prevention)
- Post-game replays only
- Server-authoritative game logic (anti-cheat)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Next.js)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐│
│  │ 3D Game  │  │   Chat   │  │  Lobby   │  │  Voice (WebRTC)  ││
│  │  Board   │  │  System  │  │   UI     │  │                  ││
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘│
└───────┼─────────────┼─────────────┼─────────────────┼──────────┘
        │             │             │                 │
        ▼             ▼             ▼                 ▼
┌───────────────────────────────────────────────────────────────┐
│                        Supabase                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │   Auth   │  │ Realtime │  │ Database │  │ Edge Functions│  │
│  │(Optional)│  │ Channels │  │(Postgres)│  │ (Game Logic)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Key Components
- **Next.js App Router** - Server components for lobby, client components for game
- **React Three Fiber** - 3D game board rendering
- **Supabase Realtime** - Game state sync, chat, presence
- **Supabase Auth** - Optional accounts with guest fallback
- **WebRTC** - Peer-to-peer voice chat (signaling via Supabase Realtime)
- **Edge Functions** - Server-authoritative game logic

---

## Data Model

```sql
-- Users & Stats
users (id, username, display_name, avatar_url, is_guest, created_at)
user_stats (user_id, wins, losses, elo_rating, games_played, highest_faan)

-- Rooms & Games
rooms (id, code, host_id, status, settings_json, created_at)
  -- settings_json: {min_faan, session_type, voice_enabled, turn_timer}
  -- status: waiting | playing | finished

games (id, room_id, round_number, dealer_seat, current_turn,
       wall_tiles, game_state_json, started_at, finished_at)

game_players (game_id, user_id, seat_position, hand_tiles,
              discards, melds, score, is_ready)

-- Chat & Moderation
messages (id, room_id, user_id, content, message_type, created_at)
  -- message_type: text | quick_phrase | emoji_reaction

reports (id, reporter_id, reported_id, room_id, reason, status, created_at)
bans (id, user_id, banned_by, reason, expires_at, created_at)

-- Matchmaking
matchmaking_queue (user_id, elo_rating, preferred_settings, queued_at)

-- Replays
replays (id, game_id, actions_json, created_at)
```

---

## Game Logic

### Tile Representation
```typescript
type Suit = 'bamboo' | 'character' | 'dot' | 'wind' | 'dragon';
type Tile = { suit: Suit; value: number; id: string };

type GameAction =
  | { type: 'DRAW' }
  | { type: 'DISCARD'; tile: Tile }
  | { type: 'PONG'; tiles: Tile[] }
  | { type: 'KONG'; tiles: Tile[]; kongType: 'exposed' | 'concealed' | 'added' }
  | { type: 'CHOW'; tiles: Tile[] }
  | { type: 'WIN'; hand: Tile[]; winType: 'self_draw' | 'discard' };
```

### Server Validation Flow
1. Validate action is legal for current game state
2. Check turn order (or interrupt priority for Pong/Kong/Win)
3. Apply action, compute new state
4. Broadcast state delta via Realtime
5. Calculate faan and score on win

### HK Mahjong Rules
- **3 faan minimum** (configurable)
- **Interrupt priority**: Win > Kong > Pong > Chow
- **Scoring hands**: All Pongs, Mixed One Suit, All One Suit, All Honors, etc.
- **Flower tiles** optional (configurable)

### Anti-Cheat
- Clients never see other players' hidden tiles
- All randomization (wall shuffle, dealing) on server
- Action timestamps to detect automation

---

## Real-time Channels

```typescript
room:{roomId}           // Game state updates, player presence
room:{roomId}:chat      // Text messages, quick phrases, emoji reactions
room:{roomId}:voice     // WebRTC signaling (SDP offers/answers, ICE candidates)
matchmaking             // Queue updates, match found notifications
```

### Chat Features
- Profanity filter (server-side, bad-words library + custom list)
- Quick phrases: "Pong!", "Kong!", "Good game", "Wait please"
- Emoji reactions: React to last discard/action
- Rate limiting: Max 5 messages/10 seconds

### Voice Chat (WebRTC)
- Mesh topology for 4 players
- Mute controls per player
- Push-to-talk optional
- Signaling via Supabase Realtime

---

## 3D Game Board

### Scene Structure
```
<Canvas>
  <TableScene>
    ├── <Table />           // Green felt table surface
    ├── <TileWall />        // Remaining wall tiles (count display)
    ├── <PlayerHand />      // Your tiles (interactive, 3D)
    ├── <OpponentHands />   // Other players (backs shown)
    ├── <DiscardPile />     // Center area, 4 sections
    ├── <MeldDisplay />     // Exposed Pong/Kong/Chow per player
    ├── <ScoreDisplay />    // Current scores floating
    └── <ActionButtons />   // Pong/Kong/Chow/Win (HTML overlay)
  </TableScene>
  <OrbitControls />         // Camera rotation (limited)
  <Lighting />              // Ambient + spot lights
</Canvas>
```

### Interactions
- Hover: Tile lifts slightly, glow effect
- Click to select: Tile raises, confirm discard button
- Drag support: Optional tile rearrangement
- Animations: Smooth transitions for all actions

### Performance
- Instanced meshes for tiles (136 tiles, same geometry)
- Lazy load 3D assets, 2D fallback during load
- Target 60fps on mid-range devices

---

## Moderation System

### Room Host Powers
- Kick player (can rejoin)
- Ban from room (cannot rejoin this room)
- Mute player (chat only)
- Transfer host

### Global Moderation (Admin)
- Temporary ban (24h, 7d, 30d)
- Permanent ban
- Shadow mute

### Report Flow
Player reports → Queue → Admin review → Action + notification

### Report Reasons
- Profanity/harassment
- Cheating/collusion
- Stalling/griefing
- Inappropriate username/avatar

---

## Matchmaking

### Algorithm
1. Player joins queue with ELO + preferences
2. Search for 3 others within ELO range (±200 initially)
3. Every 10s, expand range by ±50
4. Match found → Create room → Notify all 4
5. 30s accept window, decline = back to queue

### ELO System
- Win: +15 to +30 (based on opponent ELO difference)
- Loss: -15 to -30
- Placement matches: First 10 games, ±2x adjustment
- Decay: -10/week if inactive >2 weeks
- Starting ELO: 1200

---

## Tech Stack

### Frontend
- Next.js 14+ (App Router)
- React Three Fiber + Drei (3D)
- Tailwind CSS (styling)
- Zustand (client state)
- @supabase/supabase-js
- simple-peer (WebRTC)

### Backend (Supabase)
- PostgreSQL
- Realtime
- Auth
- Edge Functions
- Row Level Security

### Infrastructure
- Vercel (Next.js hosting)
- Supabase Cloud (managed backend)
- Cloudflare R2 or Supabase Storage (assets)

### Dev Tools
- TypeScript (strict mode)
- Vitest (unit tests)
- Playwright (E2E)
- Biome (lint/format)

---

## MVP Scope

### Included
1. Guest + optional account auth
2. Private rooms with invite codes
3. Public matchmaking with ELO
4. 3D game board with full HK rules
5. Text chat + quick phrases + emoji reactions
6. Voice chat (WebRTC)
7. Profanity filter + kick/ban/report
8. Post-game replays

### Excluded (Future)
- Mobile native app
- Other Mahjong variants (Riichi, etc.)
- In-game currency/cosmetics
- Tournaments/leagues

---

## Configurable Settings

| Setting | Default | Range |
|---------|---------|-------|
| Min faan | 3 | 0-5 |
| Session type | Single round | Single/East-only/Full |
| Flower tiles | Disabled | On/Off |
| Voice chat | Enabled | On/Off |
| Turn timer | 15 seconds | 10-60s |
