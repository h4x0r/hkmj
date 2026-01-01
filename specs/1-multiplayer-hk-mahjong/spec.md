# Feature Specification: Multiplayer Hong Kong Mahjong

**Version**: 1.0
**Status**: Draft
**Created**: 2026-01-01
**Branch**: 1-multiplayer-hk-mahjong

## Summary

A real-time multiplayer Hong Kong Mahjong game with 3D graphics, voice and text communication, ranked matchmaking, and comprehensive moderation tools. Players can join private rooms with friends or compete against strangers in ranked matches.

## Problem Statement

### Current Situation
Mahjong enthusiasts who want to play Hong Kong-style Mahjong online face limited options. Existing solutions often lack:
- Proper HK scoring rules with configurable faan minimums
- Modern real-time communication (voice chat, quick reactions)
- Anti-cheat measures that prevent tile revelation
- Ranked competitive play with skill-based matchmaking
- Effective moderation tools for community health

### Desired Outcome
Players can enjoy authentic Hong Kong Mahjong with friends or strangers, featuring real-time voice/text communication, fair matchmaking, and a safe community environment.

## User Personas

### Casual Player (Primary)
- Wants to play Mahjong with friends online
- Values quick access without mandatory account creation
- Appreciates voice chat for social experience
- Plays 1-3 games per session

### Competitive Player (Secondary)
- Wants ranked matches against similarly-skilled opponents
- Values accurate HK scoring and fair play
- Tracks statistics and ranking progress
- Plays regularly, 5+ games per week

### Room Host (Tertiary)
- Creates private rooms for friend groups
- Needs moderation tools to maintain pleasant environment
- Configures game rules to match group preferences

## User Scenarios & Testing

### Scenario 1: Guest Quick Play
**As a** casual player
**I want to** join a game without creating an account
**So that** I can play immediately with minimal friction

**Acceptance Criteria:**
1. Player can enter a display name and start playing within 30 seconds
2. Guest can join private rooms via invite link/code
3. Guest can join public matchmaking queue
4. Guest session persists for browser session duration
5. Guest can upgrade to full account without losing current game

### Scenario 2: Private Room with Friends
**As a** room host
**I want to** create a private room and invite friends
**So that** we can play together with our preferred rules

**Acceptance Criteria:**
1. Host can create room with shareable invite code/link
2. Host can configure game rules before starting (min faan, session type, turn timer)
3. Room shows waiting players and ready status
4. Game starts when 4 players are ready
5. Host can kick/ban disruptive players
6. Room persists if host disconnects (host transfers to next player)

### Scenario 3: Ranked Matchmaking
**As a** competitive player
**I want to** find opponents of similar skill level
**So that** I can have challenging, fair games

**Acceptance Criteria:**
1. Player joins matchmaking queue with one click
2. System finds 3 other players within reasonable skill range
3. Match found notification within 2 minutes (typical)
4. Player can accept or decline match (30 second window)
5. Declining returns player to queue without penalty
6. Rating adjusts after game based on result and opponent ratings

### Scenario 4: Playing a Game
**As a** player
**I want to** play Hong Kong Mahjong with proper rules
**So that** I can enjoy an authentic Mahjong experience

**Acceptance Criteria:**
1. Game displays 3D table with clear tile visibility
2. Player can see own tiles, opponents show tile backs only
3. Drawing tile happens automatically on turn
4. Player can discard by selecting and confirming
5. Pong/Kong/Chow prompts appear when valid after opponent discard
6. Win declaration validates hand meets minimum faan
7. Scoring displays breakdown of faan achieved
8. Turn timer shows remaining time; auto-discard if expired

### Scenario 5: Communication During Game
**As a** player
**I want to** communicate with other players
**So that** the game feels social and engaging

**Acceptance Criteria:**
1. Text chat visible alongside game board
2. Quick phrase buttons for common expressions ("Pong!", "Good game")
3. Emoji reactions appear on screen when triggered
4. Voice chat enables real-time conversation
5. Individual mute controls for each player
6. Push-to-talk option available
7. Profanity in text chat is filtered automatically

### Scenario 6: Reporting Misconduct
**As a** player
**I want to** report abusive or cheating players
**So that** the community remains healthy

**Acceptance Criteria:**
1. Report button accessible during and after game
2. Report form includes reason categories (harassment, cheating, griefing, inappropriate name)
3. Confirmation shown when report submitted
4. Reported player notified of action taken (if any)
5. Repeated offenders receive escalating consequences

### Scenario 7: Reviewing Past Games
**As a** player
**I want to** watch replays of completed games
**So that** I can learn from my play and enjoy memorable moments

**Acceptance Criteria:**
1. Completed games automatically saved for replay
2. Replay shows all tiles (including previously hidden)
3. Playback controls (play, pause, speed, seek)
4. Player can access own game history
5. Replays available for at least 30 days

## Functional Requirements

### FR-1: User Management
- FR-1.1: System shall allow guest access with display name only
- FR-1.2: System shall provide optional account registration
- FR-1.3: Registered users shall have persistent profile, stats, and rating
- FR-1.4: Guests can upgrade to registered account mid-session
- FR-1.5: System shall prevent banned users from accessing the platform

### FR-2: Room Management
- FR-2.1: Users shall create private rooms with unique invite codes
- FR-2.2: Room host shall configure game settings before start
- FR-2.3: Room shall support exactly 4 players
- FR-2.4: Host shall transfer to another player if original host leaves
- FR-2.5: Room shall close when fewer than 4 players remain mid-game

### FR-3: Matchmaking
- FR-3.1: Registered users shall join ranked matchmaking queue
- FR-3.2: System shall match players within similar rating range
- FR-3.3: Matching range shall expand over time if no match found
- FR-3.4: Players shall accept/decline match within 30 seconds
- FR-3.5: Matched players shall automatically join a new room

### FR-4: Game Logic
- FR-4.1: System shall implement Hong Kong Mahjong rules
- FR-4.2: Game shall enforce configurable minimum faan for winning
- FR-4.3: System shall validate all player actions server-side
- FR-4.4: Turn order shall follow standard Mahjong rotation (counter-clockwise)
- FR-4.5: Interrupt priority shall be: Win > Kong > Pong > Chow
- FR-4.6: System shall calculate and display score breakdown on win
- FR-4.7: Turn timer shall auto-discard if player does not act
- FR-4.8: System shall support session types: single round, East-only, full game

### FR-5: 3D Game Interface
- FR-5.1: Game shall render 3D table with tiles
- FR-5.2: Player shall see own tiles face-up, opponents face-down
- FR-5.3: Tiles shall respond to hover and click interactions
- FR-5.4: Smooth animations shall accompany all game actions
- FR-5.5: Interface shall display scores and game state clearly
- FR-5.6: Performance shall maintain 60fps on mid-range devices

### FR-6: Chat System
- FR-6.1: Text chat shall be available during games
- FR-6.2: Quick phrase buttons shall send preset messages
- FR-6.3: Emoji reactions shall display visually on game events
- FR-6.4: Profanity filter shall block inappropriate text
- FR-6.5: Chat shall be rate-limited to prevent spam

### FR-7: Voice Chat
- FR-7.1: Voice chat shall enable real-time audio between players
- FR-7.2: Individual mute controls shall be available for each player
- FR-7.3: Push-to-talk shall be available as an option
- FR-7.4: Voice chat can be disabled per-room by host

### FR-8: Moderation
- FR-8.1: Room host shall kick players from room
- FR-8.2: Room host shall ban players from rejoining room
- FR-8.3: Room host shall mute players in chat
- FR-8.4: Players shall report other players for misconduct
- FR-8.5: System shall support temporary and permanent bans
- FR-8.6: Shadow mute shall be available for repeat offenders

### FR-9: Statistics & Rating
- FR-9.1: System shall track wins, losses, and games played
- FR-9.2: Rating shall adjust based on game results
- FR-9.3: Placement matches shall have increased rating volatility
- FR-9.4: Inactive accounts shall experience rating decay
- FR-9.5: Player statistics shall be viewable on profile

### FR-10: Replays
- FR-10.1: Completed games shall be saved for replay
- FR-10.2: Replays shall show all tiles including previously hidden
- FR-10.3: Playback controls shall include play, pause, speed, seek
- FR-10.4: Replays shall be retained for minimum 30 days

## Non-Functional Requirements

### NFR-1: Performance
- Game actions shall reflect within 200ms for players
- 3D rendering shall maintain 60fps on mid-range devices
- Matchmaking shall find games within 2 minutes for active player population

### NFR-2: Scalability
- System shall support 10,000 concurrent users
- System shall support 2,500 concurrent games

### NFR-3: Reliability
- Game state shall persist through brief disconnections (30 seconds)
- Players shall reconnect to in-progress games automatically
- No game data shall be lost due to single server failure

### NFR-4: Security
- Game logic shall execute server-side to prevent cheating
- Players shall never receive other players' hidden tile data
- Rate limiting shall prevent spam and abuse

### NFR-5: Accessibility
- UI text shall be readable at standard font sizes
- Interactive elements shall be clearly distinguishable
- Color-blind friendly tile designs shall be available

## Success Criteria

1. **User Acquisition**: 1,000 registered users within first month
2. **Engagement**: Average session length of 20+ minutes
3. **Retention**: 30% of users return within 7 days
4. **Matchmaking Speed**: 80% of matches found within 90 seconds
5. **Game Completion**: 90% of started games reach completion
6. **Community Health**: Less than 5% of games have reports filed
7. **Performance**: 95th percentile action latency under 300ms

## Key Entities

### User
- Identifier, display name, avatar
- Account status (guest/registered)
- Statistics (wins, losses, rating, games played)
- Ban status

### Room
- Unique code/identifier
- Host reference
- Status (waiting/playing/finished)
- Game settings configuration
- Player list (max 4)

### Game
- Room reference
- Round/hand number
- Current game state
- Player hands, discards, melds
- Action history (for replay)

### Message
- Room reference
- Sender reference
- Content and type (text/quick phrase/emoji)
- Timestamp

### Report
- Reporter and reported user references
- Reason category
- Status (pending/reviewed/actioned)
- Resolution details

## Assumptions

1. Players have stable internet connections (minimum 1 Mbps)
2. Players use modern browsers with WebGL support
3. Players have microphones for voice chat (optional feature)
4. Hong Kong Mahjong rules follow standard conventions
5. Initial user base will be English-speaking (localization is future scope)
6. ELO starting rating of 1200 is appropriate for new players
7. 30-day replay retention balances storage costs with user needs

## Out of Scope

1. Mobile native applications (web-responsive only)
2. Other Mahjong variants (Riichi, Taiwanese, etc.)
3. In-game currency or cosmetic purchases
4. Tournament/league organization features
5. Live spectating (cheating risk)
6. AI opponents (human multiplayer only)
7. Localization/internationalization (English only for MVP)

## Dependencies

1. User authentication system
2. Real-time communication infrastructure
3. Persistent data storage
4. Content delivery for 3D assets
5. Voice communication signaling

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low initial player count affects matchmaking | Medium | High | Private rooms provide alternative; expand rating range quickly |
| Cheating through client modification | Medium | High | Server-authoritative logic; hidden data never sent to clients |
| Voice chat abuse | Medium | Medium | Mute controls; report system; recording optional |
| 3D performance on low-end devices | Low | Medium | 2D fallback mode; progressive asset loading |
| Rating manipulation through collusion | Low | Medium | Pattern detection; report review; rating adjustments |
