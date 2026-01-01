# Developer Quickstart: Multiplayer Hong Kong Mahjong

## Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Supabase CLI
- Git

## Initial Setup

```bash
# Clone and install
cd hkmj
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start Supabase locally
pnpm supabase start

# Run database migrations
pnpm supabase db push

# Start development server
pnpm dev
```

## Project Structure

```
hkmj/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register)
│   │   ├── (game)/             # Game pages (lobby, room, play)
│   │   ├── api/                # API routes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── game/               # 3D game components
│   │   │   ├── Board.tsx       # Main 3D scene
│   │   │   ├── Tile.tsx        # Single tile mesh
│   │   │   ├── Hand.tsx        # Player hand
│   │   │   └── ...
│   │   ├── chat/               # Chat components
│   │   ├── voice/              # Voice chat components
│   │   └── ui/                 # Shared UI components
│   ├── lib/
│   │   ├── supabase/           # Supabase client & helpers
│   │   ├── game/               # Game logic (shared)
│   │   │   ├── tiles.ts        # Tile encoding/decoding
│   │   │   ├── rules.ts        # HK Mahjong rules
│   │   │   ├── faan.ts         # Faan calculation
│   │   │   └── validation.ts   # Action validation
│   │   └── utils/              # Utility functions
│   ├── stores/                 # Zustand stores
│   │   ├── game.ts             # Game state
│   │   ├── chat.ts             # Chat state
│   │   └── voice.ts            # Voice chat state
│   └── types/                  # TypeScript types
├── supabase/
│   ├── functions/              # Edge Functions
│   │   └── game-action/        # Game action handler
│   └── migrations/             # Database migrations
├── public/
│   └── models/                 # 3D models (GLTF)
├── tests/
│   ├── unit/                   # Vitest unit tests
│   └── e2e/                    # Playwright E2E tests
└── specs/                      # Feature specifications
```

## Key Commands

```bash
# Development
pnpm dev                 # Start Next.js dev server
pnpm supabase start      # Start local Supabase
pnpm supabase functions serve  # Start Edge Functions locally

# Testing
pnpm test                # Run unit tests
pnpm test:watch          # Watch mode
pnpm test:e2e            # Run E2E tests
pnpm test:coverage       # Coverage report

# Code Quality
pnpm lint                # Run Biome linter
pnpm format              # Format code
pnpm typecheck           # TypeScript check

# Database
pnpm supabase db push    # Apply migrations
pnpm supabase db reset   # Reset database
pnpm supabase gen types  # Generate TypeScript types

# Build & Deploy
pnpm build               # Production build
pnpm start               # Start production server
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Development Workflow

### 1. Game Logic (TDD)
```bash
# Write test first
pnpm test src/lib/game/faan.test.ts

# Implement until tests pass
# See tests/unit/game/ for examples
```

### 2. Edge Functions
```bash
# Create new function
pnpm supabase functions new my-function

# Test locally
pnpm supabase functions serve my-function

# Deploy
pnpm supabase functions deploy my-function
```

### 3. Database Changes
```bash
# Create migration
pnpm supabase migration new add_feature

# Edit supabase/migrations/[timestamp]_add_feature.sql
# Apply locally
pnpm supabase db push

# Generate types
pnpm supabase gen types typescript --local > src/types/database.ts
```

### 4. 3D Components
```bash
# Models in public/models/ (GLTF format)
# Components in src/components/game/
# Use React Three Fiber + Drei helpers
```

## Tile Encoding Reference

```typescript
// Suits
'1B' - '9B'  // Bamboo
'1C' - '9C'  // Character
'1D' - '9D'  // Dot

// Honors
'EW', 'SW', 'WW', 'NW'  // East, South, West, North Wind
'RD', 'GD', 'WD'        // Red, Green, White Dragon

// Total: 136 tiles (4 of each)
```

## Realtime Channels

```typescript
// Room channel
supabase.channel(`room:${roomId}`)
  .on('broadcast', { event: 'game_action' }, handleAction)
  .on('presence', { event: 'sync' }, handlePresence)
  .subscribe()

// Chat channel
supabase.channel(`room:${roomId}:chat`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `room_id=eq.${roomId}`
  }, handleMessage)
  .subscribe()

// Voice signaling
supabase.channel(`room:${roomId}:voice`)
  .on('broadcast', { event: 'signal' }, handleSignal)
  .subscribe()
```

## Common Tasks

### Add a New Game Action
1. Add type to `GameAction` in `src/types/game.ts`
2. Add validation in `src/lib/game/validation.ts`
3. Add handler in `supabase/functions/game-action/index.ts`
4. Write tests in `tests/unit/game/`

### Add a UI Component
1. Create component in `src/components/`
2. Use Tailwind for styling
3. Add to relevant page in `src/app/`

### Add Database Table
1. Create migration: `pnpm supabase migration new table_name`
2. Add RLS policies
3. Regenerate types: `pnpm supabase gen types`
4. Update data-model.md in specs/

## Troubleshooting

### Supabase Connection Issues
```bash
# Restart local Supabase
pnpm supabase stop
pnpm supabase start
```

### Type Errors After Schema Change
```bash
# Regenerate types
pnpm supabase gen types typescript --local > src/types/database.ts
```

### WebRTC Issues
- Check browser console for ICE connection errors
- Ensure STUN servers accessible
- Test with localhost first

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Hong Kong Mahjong Rules](https://en.wikipedia.org/wiki/Hong_Kong_mahjong_scoring_rules)
