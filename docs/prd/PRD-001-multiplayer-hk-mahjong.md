# Product Requirements Document

## PRD-001: Multiplayer Hong Kong Mahjong

| Field | Value |
|-------|-------|
| **Document ID** | PRD-001 |
| **Title** | Multiplayer Hong Kong Mahjong |
| **Author** | Product Team |
| **Created** | 2026-01-01 |
| **Status** | Draft |
| **Version** | 1.0 |

---

## 1. Executive Summary

### 1.1 Problem Statement

Mahjong enthusiasts who want to play Hong Kong-style Mahjong online face limited options. Existing solutions often lack proper HK scoring rules, modern real-time communication, anti-cheat measures, ranked competitive play, and effective moderation tools.

### 1.2 Proposed Solution

A web-based multiplayer Hong Kong Mahjong game featuring:
- 3D game board with intuitive tile interactions
- Real-time voice and text communication
- Private rooms for friends and public ranked matchmaking
- Server-authoritative game logic preventing cheating
- Comprehensive moderation and reporting system

### 1.3 Success Metrics

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Registered users | 1,000 | 30 days post-launch |
| Average session length | 20+ minutes | Ongoing |
| 7-day retention | 30% | Ongoing |
| Matchmaking success | 80% < 90s | Ongoing |
| Game completion rate | 90% | Ongoing |
| Report rate | < 5% of games | Ongoing |

---

## 2. Background & Context

### 2.1 Market Analysis

The online Mahjong market is underserved for Western players wanting Hong Kong rules. Existing solutions:
- **Mahjong Soul**: Focuses on Japanese Riichi, not HK rules
- **Hong Kong Mahjong Club**: Dated interface, no voice chat
- **Tabletop Simulator**: Generic, requires setup, no matchmaking

### 2.2 Target Audience

**Primary**: Casual players (25-45) who want to play with friends online
**Secondary**: Competitive players seeking ranked matches
**Tertiary**: Diaspora communities maintaining cultural connection through Mahjong

### 2.3 Assumptions

1. Users have stable internet (1+ Mbps)
2. Users have modern browsers with WebGL support
3. Primary market is English-speaking
4. Hong Kong Mahjong rules follow standard conventions

---

## 3. User Personas

### 3.1 Casual Player (Primary)

**Name**: Sarah, 32
**Context**: Plays Mahjong with family during holidays, wants to play with cousins living abroad
**Goals**: Quick access, social experience, familiar rules
**Pain Points**: Account creation friction, complex setup, lack of voice chat

### 3.2 Competitive Player (Secondary)

**Name**: Kevin, 28
**Context**: Plays regularly at local club, wants to improve between sessions
**Goals**: Fair matches, accurate scoring, progress tracking
**Pain Points**: Unranked matches, cheaters, inaccurate rule implementation

### 3.3 Room Host (Tertiary)

**Name**: Uncle Chen, 55
**Context**: Organizes weekly Mahjong nights for extended family
**Goals**: Easy room setup, customizable rules, manage troublemakers
**Pain Points**: Technical complexity, lack of moderation tools

---

## 4. Product Requirements

### 4.1 Functional Requirements

#### FR-1: User Management

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-1.1 | Guest access | P1 | User enters display name, plays within 30s |
| FR-1.2 | Optional registration | P1 | Guest can upgrade to account mid-session |
| FR-1.3 | Profile persistence | P1 | Registered users retain stats across sessions |
| FR-1.4 | Ban enforcement | P2 | Banned users cannot access platform |

#### FR-2: Room Management

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-2.1 | Room creation | P1 | Generate unique 6-char invite code |
| FR-2.2 | Settings configuration | P1 | Host sets min faan, session type, timer |
| FR-2.3 | Player capacity | P1 | Room supports exactly 4 players |
| FR-2.4 | Host transfer | P2 | Host leaves, next player becomes host |
| FR-2.5 | Kick/ban controls | P2 | Host can remove/block players |

#### FR-3: Game Logic

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-3.1 | HK Mahjong rules | P1 | Standard HK rule implementation |
| FR-3.2 | Configurable faan | P1 | Min faan 0-5, default 3 |
| FR-3.3 | Server validation | P1 | All actions validated server-side |
| FR-3.4 | Interrupt priority | P1 | Win > Kong > Pong > Chow |
| FR-3.5 | Score calculation | P1 | Accurate faan breakdown on win |
| FR-3.6 | Turn timer | P2 | Auto-discard after timeout |

#### FR-4: Communication

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-4.1 | Text chat | P1 | Messages visible to room members |
| FR-4.2 | Profanity filter | P1 | Inappropriate text filtered |
| FR-4.3 | Quick phrases | P2 | Preset buttons for common expressions |
| FR-4.4 | Emoji reactions | P2 | Visual reactions to plays |
| FR-4.5 | Voice chat | P2 | Real-time audio between players |
| FR-4.6 | Mute controls | P2 | Individual player mute |

#### FR-5: Matchmaking

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-5.1 | Queue system | P2 | Join/leave ranked queue |
| FR-5.2 | ELO matching | P2 | Match within ±200 rating |
| FR-5.3 | Range expansion | P2 | Expand range if no match in 30s |
| FR-5.4 | Accept/decline | P2 | 30s window to accept match |

#### FR-6: Moderation

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-6.1 | Report submission | P2 | Players can report misconduct |
| FR-6.2 | Report categories | P2 | Harassment, cheating, griefing, name |
| FR-6.3 | Ban system | P2 | Temp (24h/7d/30d) and permanent |
| FR-6.4 | Admin review | P3 | Queue for admin action |

#### FR-7: Replays

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-7.1 | Game recording | P3 | Save completed games |
| FR-7.2 | Full visibility | P3 | Replay shows all tiles |
| FR-7.3 | Playback controls | P3 | Play, pause, speed, seek |
| FR-7.4 | Retention | P3 | 30-day retention |

### 4.2 Non-Functional Requirements

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-1 | Action latency | < 200ms | P95 server response |
| NFR-2 | Render performance | 60 fps | Mid-range device |
| NFR-3 | Concurrent users | 10,000 | Load test |
| NFR-4 | Concurrent games | 2,500 | Load test |
| NFR-5 | Reconnection window | 30 seconds | Test coverage |
| NFR-6 | Data loss | Zero | Failure injection |

### 4.3 User Interface Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| UI-1 | 3D game board | Interactive table with tile physics |
| UI-2 | Responsive layout | Desktop-first, tablet-friendly |
| UI-3 | Clear tile visibility | Own tiles face-up, others face-down |
| UI-4 | Action prompts | Pong/Kong/Chow buttons when valid |
| UI-5 | Score overlay | Current scores and faan breakdown |

---

## 5. User Stories

### US1: Guest Quick Play (P1)
**As a** casual player
**I want to** join a game without creating an account
**So that** I can play immediately with minimal friction

**Acceptance Criteria**:
- Enter display name and play within 30 seconds
- Join private rooms via invite link
- Session persists for browser session
- Can upgrade to full account

### US2: Private Room with Friends (P1)
**As a** room host
**I want to** create a private room and invite friends
**So that** we can play together with our preferred rules

**Acceptance Criteria**:
- Create room with shareable 6-char code
- Configure settings before starting
- Game starts when 4 players ready
- Can kick/ban disruptive players

### US3: Playing a Game (P1)
**As a** player
**I want to** play Hong Kong Mahjong with proper rules
**So that** I can enjoy an authentic experience

**Acceptance Criteria**:
- 3D table with clear tile visibility
- Draw, discard, meld actions work correctly
- Win validates minimum faan
- Scoring shows faan breakdown

### US4: Communication During Game (P2)
**As a** player
**I want to** communicate with other players
**So that** the game feels social

**Acceptance Criteria**:
- Text chat with profanity filter
- Quick phrase buttons
- Emoji reactions
- Voice chat with mute controls

### US5: Ranked Matchmaking (P2)
**As a** competitive player
**I want to** find opponents of similar skill
**So that** I can have fair, challenging games

**Acceptance Criteria**:
- Join queue, matched within 2 minutes
- Rating adjusts based on results
- Can accept/decline matches

### US6: Reporting Misconduct (P2)
**As a** player
**I want to** report abusive players
**So that** the community stays healthy

**Acceptance Criteria**:
- Report form with categories
- Confirmation on submission
- Offenders receive consequences

### US7: Reviewing Past Games (P3)
**As a** player
**I want to** watch replays
**So that** I can learn and enjoy memorable moments

**Acceptance Criteria**:
- Completed games saved
- All tiles visible in replay
- Playback controls available

---

## 6. Constraints & Limitations

### 6.1 In Scope
- Web application (desktop browsers)
- Hong Kong Mahjong variant only
- English language
- Human multiplayer only

### 6.2 Out of Scope
- Mobile native apps
- Other Mahjong variants (Riichi, Taiwanese)
- AI opponents
- In-game purchases
- Tournaments/leagues
- Live spectating (cheating risk)

### 6.3 Dependencies
- Supabase (auth, database, realtime)
- Vercel (hosting)
- WebRTC (voice chat)

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low player count | Medium | High | Private rooms, expand matchmaking range |
| Cheating | Medium | High | Server-authoritative logic |
| Voice abuse | Medium | Medium | Mute controls, reporting |
| 3D performance | Low | Medium | 2D fallback, progressive loading |
| Rating manipulation | Low | Medium | Pattern detection, reviews |

---

## 8. Release Plan

### Phase 1: MVP (Weeks 1-4)
- Guest authentication
- Private rooms
- Core gameplay (3D board, HK rules)
- Text chat

### Phase 2: Social (Weeks 5-6)
- Voice chat
- Quick phrases & emoji reactions
- User profiles

### Phase 3: Competitive (Weeks 7-8)
- Ranked matchmaking
- ELO system
- Leaderboards

### Phase 4: Community (Weeks 9-10)
- Reporting system
- Moderation tools
- Replay system

---

## 9. Appendices

### A. Glossary
- **Faan**: Scoring unit in HK Mahjong
- **Pong**: Three identical tiles
- **Kong**: Four identical tiles
- **Chow**: Three sequential tiles (same suit)
- **ELO**: Rating system for competitive games

### B. References
- [Hong Kong Mahjong Rules](https://en.wikipedia.org/wiki/Hong_Kong_mahjong_scoring_rules)
- [Supabase Documentation](https://supabase.com/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

### C. Related Documents
- ADR-001: Real-time Architecture
- ADR-002: 3D Rendering Approach
- ADR-003: Game Logic Location
- ADR-004: Voice Chat Implementation
