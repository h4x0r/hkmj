# Tasks: Multiplayer Hong Kong Mahjong

**Feature**: 1-multiplayer-hk-mahjong
**Generated**: 2026-01-01
**Total Tasks**: 89
**Approach**: TDD (Test-Driven Development)

## User Stories (from spec.md)

| ID | Story | Priority |
|----|-------|----------|
| US1 | Guest Quick Play | P1 |
| US2 | Private Room with Friends | P1 |
| US3 | Playing a Game (Core Gameplay) | P1 |
| US4 | Communication During Game | P2 |
| US5 | Ranked Matchmaking | P2 |
| US6 | Reporting Misconduct | P3 |
| US7 | Reviewing Past Games | P3 |

## Dependencies

```
Phase 1: Setup ──────────────────────────────────────────────┐
                                                              │
Phase 2: Foundational ◄──────────────────────────────────────┘
    │
    ├──► Phase 3: US1 (Guest Quick Play)
    │         │
    ├──► Phase 4: US2 (Private Room) ◄───── US1
    │         │
    └──► Phase 5: US3 (Core Gameplay) ◄───── US1, US2
              │
         Phase 6: US4 (Communication) ◄───── US3
              │
         Phase 7: US5 (Matchmaking) ◄───── US1, US3
              │
         Phase 8: US6 (Reporting) ◄───── US1
              │
         Phase 9: US7 (Replays) ◄───── US3
              │
         Phase 10: Polish
```

---

## Phase 1: Setup

**Goal**: Project initialization and tooling configuration.

- [ ] T001 Initialize Next.js 14 project with TypeScript in project root
- [ ] T002 Configure Biome for linting/formatting in biome.json
- [ ] T003 Configure TypeScript strict mode in tsconfig.json
- [ ] T004 Install and configure Tailwind CSS in tailwind.config.ts
- [ ] T005 [P] Install React Three Fiber dependencies (@react-three/fiber, @react-three/drei, three)
- [ ] T006 [P] Install Supabase client (@supabase/supabase-js)
- [ ] T007 [P] Install Zustand for state management
- [ ] T008 [P] Install simple-peer for WebRTC
- [ ] T009 [P] Install bad-words for profanity filter
- [ ] T010 [P] Install zod for validation
- [ ] T011 Configure Vitest for unit testing in vitest.config.ts
- [ ] T012 Configure Playwright for E2E testing in playwright.config.ts
- [ ] T013 Create .env.example with required environment variables
- [ ] T014 Initialize Supabase project with supabase init
- [ ] T015 Create project directory structure per quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Core infrastructure that all user stories depend on.

### Database Schema

- [ ] T016 Write test for users table schema validation in tests/unit/db/users.test.ts
- [ ] T017 Create users table migration in supabase/migrations/001_users.sql
- [ ] T018 Write test for user_stats table schema in tests/unit/db/user_stats.test.ts
- [ ] T019 Create user_stats table migration in supabase/migrations/002_user_stats.sql
- [ ] T020 Write test for rooms table schema in tests/unit/db/rooms.test.ts
- [ ] T021 Create rooms table migration in supabase/migrations/003_rooms.sql
- [ ] T022 [P] Write test for room_players table in tests/unit/db/room_players.test.ts
- [ ] T023 [P] Create room_players table migration in supabase/migrations/004_room_players.sql
- [ ] T024 [P] Write test for games table in tests/unit/db/games.test.ts
- [ ] T025 [P] Create games table migration in supabase/migrations/005_games.sql
- [ ] T026 [P] Write test for game_players table in tests/unit/db/game_players.test.ts
- [ ] T027 [P] Create game_players table migration in supabase/migrations/006_game_players.sql
- [ ] T028 Create RLS policies migration in supabase/migrations/007_rls_policies.sql
- [ ] T029 Generate TypeScript types from schema in src/types/database.ts

### Supabase Client

- [ ] T030 Write test for Supabase client initialization in tests/unit/lib/supabase.test.ts
- [ ] T031 Create Supabase client singleton in src/lib/supabase/client.ts
- [ ] T032 Create Supabase server client helper in src/lib/supabase/server.ts

### Tile System (Core Game Logic)

- [ ] T033 Write test for tile encoding/decoding in tests/unit/game/tiles.test.ts
- [ ] T034 Implement tile types and encoding in src/lib/game/tiles.ts
- [ ] T035 Write test for tile set generation (136 tiles) in tests/unit/game/tiles.test.ts
- [ ] T036 Implement tile set generator in src/lib/game/tiles.ts
- [ ] T037 Write test for wall shuffling in tests/unit/game/tiles.test.ts
- [ ] T038 Implement wall shuffle function in src/lib/game/tiles.ts

---

## Phase 3: US1 - Guest Quick Play

**Goal**: Player can enter a display name and start playing within 30 seconds.

**Independent Test Criteria**:
- Guest can create session with display name
- Guest receives valid session token
- Guest profile displays correctly
- Session persists during browser session

### Tests First

- [ ] T039 [US1] Write test for guest session creation in tests/unit/auth/guest.test.ts
- [ ] T040 [US1] Write test for display name validation in tests/unit/auth/guest.test.ts
- [ ] T041 [US1] Write E2E test for guest flow in tests/e2e/guest-quick-play.spec.ts

### Implementation

- [ ] T042 [US1] Implement guest auth service in src/lib/auth/guest.ts
- [ ] T043 [US1] Create guest API route in src/app/api/auth/guest/route.ts
- [ ] T044 [US1] Create auth store with Zustand in src/stores/auth.ts
- [ ] T045 [US1] Create GuestEntryForm component in src/components/auth/GuestEntryForm.tsx
- [ ] T046 [US1] Create home page with guest entry in src/app/page.tsx
- [ ] T047 [US1] Add session persistence hook in src/hooks/useSession.ts

---

## Phase 4: US2 - Private Room with Friends

**Goal**: Host can create room, invite friends, configure settings, start game.

**Independent Test Criteria**:
- Room creation generates unique 6-char code
- Invite link/code allows joining
- Host can configure settings before start
- Game starts when 4 players ready
- Host can kick/ban players

### Tests First

- [ ] T048 [US2] Write test for room code generation in tests/unit/room/code.test.ts
- [ ] T049 [US2] Write test for room creation in tests/unit/room/create.test.ts
- [ ] T050 [US2] Write test for room join validation in tests/unit/room/join.test.ts
- [ ] T051 [US2] Write test for room settings validation in tests/unit/room/settings.test.ts
- [ ] T052 [US2] Write E2E test for room flow in tests/e2e/private-room.spec.ts

### Implementation

- [ ] T053 [US2] Implement room code generator in src/lib/room/code.ts
- [ ] T054 [US2] Implement room service in src/lib/room/service.ts
- [ ] T055 [US2] Create room API routes in src/app/api/rooms/route.ts
- [ ] T056 [US2] Create room join API route in src/app/api/rooms/[roomId]/join/route.ts
- [ ] T057 [US2] Create room store in src/stores/room.ts
- [ ] T058 [US2] Create CreateRoomModal component in src/components/room/CreateRoomModal.tsx
- [ ] T059 [US2] Create RoomSettings component in src/components/room/RoomSettings.tsx
- [ ] T060 [US2] Create RoomLobby component in src/components/room/RoomLobby.tsx
- [ ] T061 [US2] Create room page in src/app/room/[code]/page.tsx
- [ ] T062 [US2] Implement Realtime presence for room in src/hooks/useRoomPresence.ts
- [ ] T063 [US2] Implement host controls (kick/ban) in src/lib/room/moderation.ts

---

## Phase 5: US3 - Core Gameplay

**Goal**: Full Hong Kong Mahjong game with proper rules, 3D interface, scoring.

**Independent Test Criteria**:
- Game deals 13 tiles to each player correctly
- Turn rotation follows Mahjong rules
- Pong/Kong/Chow validation is correct
- Win detection with faan calculation works
- 3D board renders and responds to input

### Tests First (Game Logic)

- [ ] T064 [US3] Write test for dealing in tests/unit/game/dealing.test.ts
- [ ] T065 [US3] Write test for turn rotation in tests/unit/game/turns.test.ts
- [ ] T066 [US3] Write test for discard validation in tests/unit/game/actions.test.ts
- [ ] T067 [US3] Write test for Pong validation in tests/unit/game/melds.test.ts
- [ ] T068 [US3] Write test for Kong validation in tests/unit/game/melds.test.ts
- [ ] T069 [US3] Write test for Chow validation in tests/unit/game/melds.test.ts
- [ ] T070 [US3] Write test for win detection in tests/unit/game/win.test.ts
- [ ] T071 [US3] Write test for faan calculation in tests/unit/game/faan.test.ts
- [ ] T072 [US3] Write test for score calculation in tests/unit/game/scoring.test.ts

### Implementation (Game Logic)

- [ ] T073 [US3] Implement dealing logic in src/lib/game/dealing.ts
- [ ] T074 [US3] Implement turn manager in src/lib/game/turns.ts
- [ ] T075 [US3] Implement action validator in src/lib/game/validation.ts
- [ ] T076 [US3] Implement meld logic (Pong/Kong/Chow) in src/lib/game/melds.ts
- [ ] T077 [US3] Implement win detection in src/lib/game/win.ts
- [ ] T078 [US3] Implement faan calculator in src/lib/game/faan.ts
- [ ] T079 [US3] Implement scoring calculator in src/lib/game/scoring.ts
- [ ] T080 [US3] Create game state machine in src/lib/game/state-machine.ts

### Edge Function

- [ ] T081 [US3] Write test for game action Edge Function in tests/unit/functions/game-action.test.ts
- [ ] T082 [US3] Create game-action Edge Function in supabase/functions/game-action/index.ts

### 3D Interface

- [ ] T083 [US3] Create Tile 3D component in src/components/game/Tile.tsx
- [ ] T084 [US3] Create Table 3D component in src/components/game/Table.tsx
- [ ] T085 [US3] Create PlayerHand component in src/components/game/PlayerHand.tsx
- [ ] T086 [US3] Create OpponentHand component in src/components/game/OpponentHand.tsx
- [ ] T087 [US3] Create DiscardPile component in src/components/game/DiscardPile.tsx
- [ ] T088 [US3] Create MeldDisplay component in src/components/game/MeldDisplay.tsx
- [ ] T089 [US3] Create GameBoard (main scene) in src/components/game/GameBoard.tsx
- [ ] T090 [US3] Create ActionButtons overlay in src/components/game/ActionButtons.tsx
- [ ] T091 [US3] Create ScoreDisplay component in src/components/game/ScoreDisplay.tsx

### State & Realtime

- [ ] T092 [US3] Create game store in src/stores/game.ts
- [ ] T093 [US3] Implement game Realtime sync in src/hooks/useGameSync.ts
- [ ] T094 [US3] Create game page in src/app/game/[gameId]/page.tsx

### E2E

- [ ] T095 [US3] Write E2E test for full game flow in tests/e2e/gameplay.spec.ts

---

## Phase 6: US4 - Communication During Game

**Goal**: Text chat, quick phrases, emoji reactions, voice chat.

**Independent Test Criteria**:
- Text messages appear in real-time
- Profanity is filtered
- Quick phrases send correctly
- Voice connects between players
- Mute controls work

### Tests First

- [ ] T096 [US4] Write test for profanity filter in tests/unit/chat/filter.test.ts
- [ ] T097 [US4] Write test for rate limiting in tests/unit/chat/ratelimit.test.ts
- [ ] T098 [US4] Write test for message validation in tests/unit/chat/message.test.ts

### Implementation (Chat)

- [ ] T099 [US4] Implement profanity filter in src/lib/chat/filter.ts
- [ ] T100 [US4] Implement rate limiter in src/lib/chat/ratelimit.ts
- [ ] T101 [US4] Create messages API route in src/app/api/rooms/[roomId]/messages/route.ts
- [ ] T102 [US4] Create chat store in src/stores/chat.ts
- [ ] T103 [US4] Create ChatPanel component in src/components/chat/ChatPanel.tsx
- [ ] T104 [US4] Create QuickPhrases component in src/components/chat/QuickPhrases.tsx
- [ ] T105 [US4] Create EmojiReactions component in src/components/chat/EmojiReactions.tsx
- [ ] T106 [US4] Implement chat Realtime in src/hooks/useChatSync.ts

### Implementation (Voice)

- [ ] T107 [US4] Create voice store in src/stores/voice.ts
- [ ] T108 [US4] Implement WebRTC peer manager in src/lib/voice/peer-manager.ts
- [ ] T109 [US4] Implement voice signaling in src/lib/voice/signaling.ts
- [ ] T110 [US4] Create VoiceControls component in src/components/voice/VoiceControls.tsx
- [ ] T111 [US4] Create VoiceIndicator component in src/components/voice/VoiceIndicator.tsx
- [ ] T112 [US4] Implement useVoiceChat hook in src/hooks/useVoiceChat.ts

---

## Phase 7: US5 - Ranked Matchmaking

**Goal**: ELO-based matching, queue system, accept/decline flow.

**Independent Test Criteria**:
- Player joins queue successfully
- Matching finds players within ELO range
- Range expands over time
- Accept/decline works correctly
- Rating updates after game

### Tests First

- [ ] T113 [US5] Write test for ELO calculation in tests/unit/matchmaking/elo.test.ts
- [ ] T114 [US5] Write test for matching algorithm in tests/unit/matchmaking/matcher.test.ts
- [ ] T115 [US5] Write test for queue management in tests/unit/matchmaking/queue.test.ts

### Implementation

- [ ] T116 [US5] Create matchmaking_queue table migration in supabase/migrations/008_matchmaking.sql
- [ ] T117 [US5] Implement ELO calculator in src/lib/matchmaking/elo.ts
- [ ] T118 [US5] Implement queue service in src/lib/matchmaking/queue.ts
- [ ] T119 [US5] Implement matcher service in src/lib/matchmaking/matcher.ts
- [ ] T120 [US5] Create matchmaking Edge Function in supabase/functions/matchmaking/index.ts
- [ ] T121 [US5] Create matchmaking API routes in src/app/api/matchmaking/route.ts
- [ ] T122 [US5] Create matchmaking store in src/stores/matchmaking.ts
- [ ] T123 [US5] Create MatchmakingQueue component in src/components/matchmaking/Queue.tsx
- [ ] T124 [US5] Create MatchFound component in src/components/matchmaking/MatchFound.tsx
- [ ] T125 [US5] Implement matchmaking Realtime in src/hooks/useMatchmaking.ts

---

## Phase 8: US6 - Reporting Misconduct

**Goal**: Report system with categories, admin review, bans.

**Independent Test Criteria**:
- Report form submits successfully
- Report categories are validated
- Ban system blocks access
- Admin can review reports

### Tests First

- [ ] T126 [US6] Write test for report validation in tests/unit/moderation/report.test.ts
- [ ] T127 [US6] Write test for ban checking in tests/unit/moderation/ban.test.ts

### Implementation

- [ ] T128 [US6] Create reports table migration in supabase/migrations/009_reports.sql
- [ ] T129 [US6] Create bans table migration in supabase/migrations/010_bans.sql
- [ ] T130 [US6] Implement report service in src/lib/moderation/report.ts
- [ ] T131 [US6] Implement ban service in src/lib/moderation/ban.ts
- [ ] T132 [US6] Create reports API route in src/app/api/reports/route.ts
- [ ] T133 [US6] Create ReportModal component in src/components/moderation/ReportModal.tsx
- [ ] T134 [US6] Add ban check middleware in src/middleware.ts

---

## Phase 9: US7 - Reviewing Past Games

**Goal**: Replay system with playback controls, all tiles visible.

**Independent Test Criteria**:
- Games are saved for replay
- Replay shows all tiles
- Playback controls work
- Replays accessible for 30 days

### Tests First

- [ ] T135 [US7] Write test for replay serialization in tests/unit/replay/serialize.test.ts
- [ ] T136 [US7] Write test for replay playback in tests/unit/replay/playback.test.ts

### Implementation

- [ ] T137 [US7] Create replays table migration in supabase/migrations/011_replays.sql
- [ ] T138 [US7] Implement replay service in src/lib/replay/service.ts
- [ ] T139 [US7] Implement replay player in src/lib/replay/player.ts
- [ ] T140 [US7] Create replays API route in src/app/api/replays/[gameId]/route.ts
- [ ] T141 [US7] Create ReplayViewer component in src/components/replay/ReplayViewer.tsx
- [ ] T142 [US7] Create PlaybackControls component in src/components/replay/PlaybackControls.tsx
- [ ] T143 [US7] Create replay page in src/app/replay/[gameId]/page.tsx

---

## Phase 10: Polish & Cross-Cutting

**Goal**: Final polish, profile pages, navigation, error handling.

### Profile & Stats

- [ ] T144 Create user profile page in src/app/profile/[userId]/page.tsx
- [ ] T145 Create StatsDisplay component in src/components/profile/StatsDisplay.tsx
- [ ] T146 Create GameHistory component in src/components/profile/GameHistory.tsx

### Navigation & Layout

- [ ] T147 Create MainNav component in src/components/layout/MainNav.tsx
- [ ] T148 Create root layout in src/app/layout.tsx
- [ ] T149 Create lobby page in src/app/lobby/page.tsx

### Error Handling

- [ ] T150 Create error boundary in src/components/ErrorBoundary.tsx
- [ ] T151 Create not-found page in src/app/not-found.tsx
- [ ] T152 Create error page in src/app/error.tsx

### Performance & Polish

- [ ] T153 [P] Add loading states to all pages
- [ ] T154 [P] Implement tile texture lazy loading
- [ ] T155 [P] Add reconnection UI for disconnects
- [ ] T156 [P] Add game tour/tutorial overlay

---

## Summary

| Phase | Story | Task Count | Parallel Tasks |
|-------|-------|------------|----------------|
| 1 | Setup | 15 | 6 |
| 2 | Foundational | 23 | 6 |
| 3 | US1 - Guest Quick Play | 9 | 0 |
| 4 | US2 - Private Room | 16 | 0 |
| 5 | US3 - Core Gameplay | 32 | 0 |
| 6 | US4 - Communication | 17 | 0 |
| 7 | US5 - Matchmaking | 13 | 0 |
| 8 | US6 - Reporting | 9 | 0 |
| 9 | US7 - Replays | 9 | 0 |
| 10 | Polish | 13 | 4 |
| **Total** | | **156** | **16** |

## MVP Scope

For fastest path to playable game:
1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: US1 (Guest Quick Play)
4. Phase 4: US2 (Private Room)
5. Phase 5: US3 (Core Gameplay)

**MVP = 95 tasks**, delivers: Guest auth, private rooms, full 3D gameplay.

## Parallel Execution Examples

### Phase 1 Parallel Group:
```
T005 (R3F) ─┬─► T011 (Vitest config)
T006 (Supabase) ─┤
T007 (Zustand) ─┤
T008 (WebRTC) ─┤
T009 (bad-words) ─┤
T010 (zod) ─┘
```

### Phase 2 Parallel Group:
```
T022 (room_players test) ─┬─► T028 (RLS policies)
T024 (games test) ─┤
T026 (game_players test) ─┘
```

## Implementation Strategy

1. **Setup First**: Complete Phase 1 fully before proceeding
2. **Foundation Before Features**: Phase 2 unblocks all user stories
3. **MVP Path**: US1 → US2 → US3 gives playable game
4. **Incremental Enhancement**: US4-US7 add polish without breaking core
5. **TDD Throughout**: Tests before implementation for all game logic
