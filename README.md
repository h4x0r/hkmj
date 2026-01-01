# Hong Kong Mahjong

![Hong Kong Mahjong](public/sisbbs.jpg)

A multiplayer Hong Kong Mahjong game built with Next.js, featuring 3D WebGL graphics, real-time gameplay, and multilingual support.

## Features

- **3D Game Board** - Immersive gameplay with React Three Fiber
- **Hong Kong Rules** - Authentic HK Mahjong scoring with configurable minimum faan
- **Multiplayer Ready** - Private rooms with room codes, public matchmaking with ELO
- **Multilingual** - English and Traditional Chinese (繁體中文)
- **Theme Support** - Light, dark, and system themes
- **Guest Mode** - Play instantly without registration
- **Real-time Chat** - Text chat with quick phrases
- **Voice Chat** - WebRTC-powered voice communication (coming soon)
- **Post-game Replays** - Review your games (coming soon)

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **3D Graphics**: React Three Fiber, Three.js, @react-three/drei
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS 4
- **i18n**: next-intl
- **Theming**: next-themes
- **Backend**: Supabase (auth, realtime, database)
- **Testing**: Vitest (221 tests), Playwright (7 e2e tests)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/h4x0r/hkmj.git
cd hkmj

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

### Testing

```bash
# Run unit tests
pnpm test

# Run e2e tests
pnpm exec playwright test
```

## Game Rules

Hong Kong Mahjong is played with 144 tiles. Players take turns drawing and discarding tiles to form winning hands. A winning hand consists of 4 melds (sets of 3 tiles) and 1 pair.

### Scoring (Faan)

The game uses the Hong Kong scoring system with configurable minimum faan requirements:
- **0 faan**: Chicken hand (any valid winning hand)
- **1 faan**: All Chows, Concealed Hand, etc.
- **3 faan**: All Pungs, Half Flush, etc.
- **6+ faan**: Full Flush, All Honors, etc.

## Credits

- **Tile Graphics**: [FluffyStuff/riichi-mahjong-tiles](https://github.com/FluffyStuff/riichi-mahjong-tiles) (CC0 Public Domain)

## License

MIT License - see [LICENSE](LICENSE) for details.
