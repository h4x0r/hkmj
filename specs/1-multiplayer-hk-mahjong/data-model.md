# Data Model: Multiplayer Hong Kong Mahjong

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │    rooms    │       │    games    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──┐   │ id (PK)     │◄──────│ id (PK)     │
│ username    │   │   │ code        │       │ room_id(FK) │
│ display_name│   │   │ host_id(FK)─┼───┐   │ round_num   │
│ avatar_url  │   │   │ status      │   │   │ state_json  │
│ is_guest    │   │   │ settings    │   │   │ started_at  │
│ created_at  │   │   │ created_at  │   │   │ finished_at │
└─────────────┘   │   └─────────────┘   │   └─────────────┘
      │           │          │          │          │
      │           │          │          │          │
      ▼           │          ▼          │          ▼
┌─────────────┐   │   ┌─────────────┐   │   ┌─────────────┐
│ user_stats  │   │   │room_players │   │   │game_players │
├─────────────┤   │   ├─────────────┤   │   ├─────────────┤
│ user_id(FK)─┼───┤   │ room_id(FK) │   │   │ game_id(FK) │
│ wins        │   │   │ user_id(FK)─┼───┤   │ user_id(FK)─┼───┐
│ losses      │   │   │ seat        │   │   │ seat        │   │
│ elo_rating  │   │   │ is_ready    │   │   │ hand_tiles  │   │
│ games_played│   │   │ joined_at   │   │   │ discards    │   │
│ highest_faan│   │   └─────────────┘   │   │ melds       │   │
└─────────────┘   │                     │   │ score       │   │
                  │                     │   └─────────────┘   │
                  │                     │                     │
                  │   ┌─────────────┐   │   ┌─────────────┐   │
                  │   │  messages   │   │   │   reports   │   │
                  │   ├─────────────┤   │   ├─────────────┤   │
                  │   │ id (PK)     │   │   │ id (PK)     │   │
                  │   │ room_id(FK) │   │   │ reporter_id─┼───┤
                  └───┼─user_id(FK) │   └───┼─reported_id │   │
                      │ content     │       │ room_id(FK) │   │
                      │ msg_type    │       │ reason      │   │
                      │ created_at  │       │ status      │   │
                      └─────────────┘       └─────────────┘   │
                                                              │
                      ┌─────────────┐       ┌─────────────┐   │
                      │    bans     │       │   replays   │   │
                      ├─────────────┤       ├─────────────┤   │
                      │ id (PK)     │       │ id (PK)     │   │
                      │ user_id(FK)─┼───────│ game_id(FK) │   │
                      │ banned_by   │       │ actions_json│   │
                      │ reason      │       │ created_at  │   │
                      │ expires_at  │       └─────────────┘   │
                      │ created_at  │                         │
                      └─────────────┘                         │
                                                              │
                      ┌─────────────┐                         │
                      │matchmaking_ │                         │
                      │   queue     │                         │
                      ├─────────────┤                         │
                      │ user_id(FK)─┼─────────────────────────┘
                      │ elo_rating  │
                      │ preferences │
                      │ queued_at   │
                      └─────────────┘
```

## Table Definitions

### users
Primary user table, works with Supabase Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| username | text | UNIQUE, nullable | Login username (null for guests) |
| display_name | text | NOT NULL | Shown in game |
| avatar_url | text | nullable | Profile image URL |
| is_guest | boolean | NOT NULL DEFAULT true | Guest vs registered |
| created_at | timestamptz | NOT NULL DEFAULT now() | Creation time |
| updated_at | timestamptz | NOT NULL DEFAULT now() | Last update |

### user_stats
Player statistics and rating.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | uuid | PK, FK → users.id | User reference |
| wins | integer | NOT NULL DEFAULT 0 | Total wins |
| losses | integer | NOT NULL DEFAULT 0 | Total losses |
| elo_rating | integer | NOT NULL DEFAULT 1200 | Current ELO rating |
| games_played | integer | NOT NULL DEFAULT 0 | Total games |
| highest_faan | integer | NOT NULL DEFAULT 0 | Best scoring hand |
| updated_at | timestamptz | NOT NULL DEFAULT now() | Last update |

### rooms
Game rooms (private and matchmade).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| code | text | UNIQUE, NOT NULL | 6-char invite code |
| host_id | uuid | FK → users.id | Current host |
| status | text | NOT NULL DEFAULT 'waiting' | waiting/playing/finished |
| settings | jsonb | NOT NULL DEFAULT '{}' | Game configuration |
| is_ranked | boolean | NOT NULL DEFAULT false | Ranked match flag |
| created_at | timestamptz | NOT NULL DEFAULT now() | Creation time |

**settings JSONB schema**:
```json
{
  "min_faan": 3,
  "session_type": "single",
  "flower_tiles": false,
  "voice_enabled": true,
  "turn_timer": 15
}
```

### room_players
Players currently in a room.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| room_id | uuid | PK, FK → rooms.id | Room reference |
| user_id | uuid | PK, FK → users.id | User reference |
| seat | integer | CHECK (seat >= 0 AND seat <= 3) | Seat position (0-3) |
| is_ready | boolean | NOT NULL DEFAULT false | Ready to start |
| is_muted | boolean | NOT NULL DEFAULT false | Chat muted by host |
| joined_at | timestamptz | NOT NULL DEFAULT now() | Join time |

### games
Individual game instances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| room_id | uuid | FK → rooms.id | Parent room |
| round_number | integer | NOT NULL DEFAULT 1 | Current round |
| dealer_seat | integer | NOT NULL DEFAULT 0 | Dealer position |
| current_turn | integer | NOT NULL DEFAULT 0 | Active player seat |
| wall_tiles | text[] | NOT NULL | Remaining wall tiles |
| state | jsonb | NOT NULL DEFAULT '{}' | Full game state |
| started_at | timestamptz | NOT NULL DEFAULT now() | Start time |
| finished_at | timestamptz | nullable | End time |

**state JSONB schema**:
```json
{
  "phase": "playing",
  "last_action": {"type": "DISCARD", "tile": "3B", "player": 0},
  "pending_claims": [],
  "turn_deadline": "2026-01-01T12:00:00Z"
}
```

### game_players
Player state within a game.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| game_id | uuid | PK, FK → games.id | Game reference |
| user_id | uuid | PK, FK → users.id | User reference |
| seat | integer | NOT NULL | Seat position (0-3) |
| hand_tiles | text[] | NOT NULL DEFAULT '{}' | Hidden hand tiles |
| discards | text[] | NOT NULL DEFAULT '{}' | Discarded tiles |
| melds | jsonb | NOT NULL DEFAULT '[]' | Exposed melds |
| score | integer | NOT NULL DEFAULT 0 | Current score |
| is_winner | boolean | NOT NULL DEFAULT false | Won this game |

**melds JSONB schema**:
```json
[
  {"type": "pong", "tiles": ["RD", "RD", "RD"], "from_player": 2},
  {"type": "kong", "tiles": ["1B", "1B", "1B", "1B"], "concealed": false}
]
```

### messages
Chat messages in rooms.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| room_id | uuid | FK → rooms.id | Room reference |
| user_id | uuid | FK → users.id | Sender reference |
| content | text | NOT NULL | Message content |
| message_type | text | NOT NULL DEFAULT 'text' | text/quick_phrase/emoji |
| created_at | timestamptz | NOT NULL DEFAULT now() | Send time |

### reports
Player misconduct reports.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| reporter_id | uuid | FK → users.id | Who reported |
| reported_id | uuid | FK → users.id | Who was reported |
| room_id | uuid | FK → rooms.id, nullable | Context room |
| reason | text | NOT NULL | Report category |
| details | text | nullable | Additional info |
| status | text | NOT NULL DEFAULT 'pending' | pending/reviewed/actioned |
| resolution | text | nullable | Action taken |
| created_at | timestamptz | NOT NULL DEFAULT now() | Report time |
| reviewed_at | timestamptz | nullable | Review time |

### bans
User bans (temporary and permanent).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → users.id | Banned user |
| banned_by | uuid | FK → users.id | Admin who banned |
| reason | text | NOT NULL | Ban reason |
| ban_type | text | NOT NULL DEFAULT 'temporary' | temporary/permanent/shadow |
| expires_at | timestamptz | nullable | Expiration (null=permanent) |
| created_at | timestamptz | NOT NULL DEFAULT now() | Ban time |

### room_bans
Room-specific bans (host-issued).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| room_id | uuid | PK, FK → rooms.id | Room reference |
| user_id | uuid | PK, FK → users.id | Banned user |
| banned_by | uuid | FK → users.id | Host who banned |
| created_at | timestamptz | NOT NULL DEFAULT now() | Ban time |

### matchmaking_queue
Players waiting for ranked match.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | uuid | PK, FK → users.id | User reference |
| elo_rating | integer | NOT NULL | Rating at queue time |
| elo_range | integer | NOT NULL DEFAULT 200 | Current search range |
| preferences | jsonb | NOT NULL DEFAULT '{}' | Game preferences |
| queued_at | timestamptz | NOT NULL DEFAULT now() | Queue join time |

### replays
Completed game recordings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Unique identifier |
| game_id | uuid | FK → games.id, UNIQUE | Game reference |
| actions | jsonb | NOT NULL | Full action history |
| created_at | timestamptz | NOT NULL DEFAULT now() | Save time |
| expires_at | timestamptz | NOT NULL | Auto-delete time |

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_games_room ON games(room_id);
CREATE INDEX idx_messages_room ON messages(room_id, created_at DESC);
CREATE INDEX idx_matchmaking_rating ON matchmaking_queue(elo_rating);
CREATE INDEX idx_bans_user ON bans(user_id) WHERE expires_at IS NULL OR expires_at > now();
CREATE INDEX idx_reports_status ON reports(status) WHERE status = 'pending';
```

## Row Level Security Policies

```sql
-- Users can read all users (for display names)
-- Users can only update their own profile
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_read ON users FOR SELECT USING (true);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

-- Room players visible to room members
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY room_players_read ON room_players FOR SELECT
  USING (user_id = auth.uid() OR room_id IN (
    SELECT room_id FROM room_players WHERE user_id = auth.uid()
  ));

-- Game players: own hand fully visible, others show limited data
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY game_players_read ON game_players FOR SELECT
  USING (
    user_id = auth.uid() -- Full access to own data
    OR game_id IN (
      SELECT game_id FROM game_players WHERE user_id = auth.uid()
    ) -- Can see others in same game (hand_tiles filtered in function)
  );

-- Messages visible to room members only
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_read ON messages FOR SELECT
  USING (room_id IN (
    SELECT room_id FROM room_players WHERE user_id = auth.uid()
  ));
```

## State Transitions

### Room Status
```
waiting ──[4 players ready]──► playing ──[game ends]──► finished
    ▲                              │
    └──────[new round]─────────────┘
```

### Game Phase
```
dealing ──► playing ──► claim_window ──► scoring ──► finished
              ▲              │
              └──────────────┘
```

### Report Status
```
pending ──[admin reviews]──► reviewed ──[action taken]──► actioned
                                │
                                └──[no action]──► dismissed
```
