# Holiday Image Bingo 🎄❄️

A fully production-ready, secure, elegant, corporate-friendly Holiday Image Bingo web platform built for Fortune-50 environments. Features real-time gameplay, host controls, AI voice integration, and enterprise-grade security.

## 🌟 Features

### Core Gameplay
- **Real-time Multiplayer**: WebSocket-powered instant updates for all players
- **5×5 Bingo Cards**: Unique cards generated for each player with FREE center tile
- **Multiple Winning Patterns**: Lines, diagonals, blackout, and custom patterns (T, L, corners, plus sign)
- **Anti-Cheat System**: Server-authoritative validation prevents cheating
- **50 Winter-Themed Images**: Corporate-safe, non-religious holiday imagery

### Host Controls
- **Admin Dashboard**: Collapsible drawer with full game management
- **Session Management**: Create, start, pause, and reset games
- **Image Calling**: Visual grid to select and call images
- **Live Scoreboard**: Real-time player stats and bingo counts
- **Pattern Designer**: Configure winning patterns for each round
- **Bingo Verification**: Manual verification panel for claimed bingos

### Player Experience
- **One-Click Join**: No accounts needed - just enter your name
- **Beautiful UI**: Glassmorphism design with smooth animations
- **Tile Marking**: Click to mark with visual feedback and frosted overlay
- **Called Images Strip**: See all called images in order
- **Round Status**: Always know the current game state

### Security & Authentication
- **QR Code Login**: Passwordless admin authentication via mobile scan
- **Backup Admin Login**: Username/password fallback for emergencies
- **Secure Cookies**: HttpOnly, Secure, SameSite=Strict configuration
- **Server-Side Validation**: All game logic runs on server
- **No Client-Side AI**: AI voice features are host-only and server-side

### AI Voice Integration (Optional)
- **Modular Design**: Support for ElevenLabs, Hume, and OpenAI voice APIs
- **Host-Only**: Players never interact with or see AI features
- **Voice Announcements**: Automated calling of images with personality
- **Corporate-Safe Tone**: Professional with light bingo-parlor camp

## 🏗️ Architecture

```
/holiday-bingo
├── client/                 # React 19 + TypeScript frontend
│   ├── public/
│   │   └── images/bingo/  # 50 winter-themed image assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route pages (Home, Join, Play, Host)
│       └── lib/           # tRPC client and utilities
├── server/                # Express + tRPC backend
│   ├── _core/            # Framework plumbing (OAuth, context)
│   ├── gameRouter.ts     # Game operations API
│   ├── adminAuthRouter.ts # Admin authentication
│   ├── websocket.ts      # Real-time WebSocket server
│   ├── aiVoice.ts        # AI voice integration module
│   └── db.ts             # Database query helpers
├── core/                  # Pure TypeScript game engine
│   └── gameEngine.ts     # Card generation, bingo detection
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Tables for games, players, cards
└── shared/               # Shared types and constants
    ├── gameTypes.ts      # Game-specific type definitions
    └── imageCatalog.json # Image metadata catalog
```

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm 10+
- MySQL/TiDB database (provided by Manus platform)

### Installation

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Required environment variables (automatically injected by Manus platform):

```env
# Database
DATABASE_URL=mysql://...

# Authentication
JWT_SECRET=...
OAUTH_SERVER_URL=...
VITE_OAUTH_PORTAL_URL=...

# Optional: AI Voice Integration
ELEVENLABS_API_KEY=your_key_here
HUME_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here

# Optional: Admin Backup Login
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

## 🎮 How to Play

### For Hosts

1. **Sign In**: Navigate to the home page and click "Host a Game"
2. **Create Session**: Click "Create New Session" to generate a session code
3. **Share Code**: Give the session code to players
4. **Start Round**: Click "Start Round" when players are ready
5. **Call Images**: Select images from the grid to call them
6. **Verify Bingos**: Approve or reject bingo claims from players
7. **Manage Game**: Use controls to pause, end, or reset the game

### For Players

1. **Join Game**: Enter the session code provided by the host
2. **Enter Name**: Provide your name (no account needed)
3. **Wait for Start**: Host will start the round
4. **Mark Tiles**: Click tiles when their images are called
5. **Claim Bingo**: Click "BINGO!" button when you have a winning pattern
6. **Wait for Verification**: Host will verify your claim

## 🔧 Technology Stack

### Frontend
- **React 19**: Modern UI library with latest features
- **TypeScript**: Type-safe development
- **TailwindCSS 4**: Utility-first styling with OKLCH colors
- **shadcn/ui**: High-quality component library
- **tRPC**: End-to-end type-safe API client
- **Socket.IO Client**: Real-time WebSocket communication
- **Wouter**: Lightweight routing

### Backend
- **Express 4**: Web server framework
- **tRPC 11**: Type-safe API layer
- **Socket.IO**: WebSocket server for real-time updates
- **Drizzle ORM**: Type-safe database queries
- **MySQL/TiDB**: Relational database
- **Zod**: Runtime validation
- **QRCode**: QR code generation for admin login

### Testing
- **Vitest**: Fast unit testing framework
- **21 passing tests**: Comprehensive game engine coverage

## 📊 Database Schema

### Tables

- **users**: OAuth user accounts with admin roles
- **game_sessions**: Active game sessions with host and status
- **players**: Players in each session with scores
- **bingo_cards**: Generated cards for each player/round
- **called_images**: Images called during each round
- **bingo_claims**: Player bingo claims awaiting verification
- **admin_sessions**: QR code and backup admin sessions

See `drizzle/schema.ts` for complete schema definitions.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Type checking
pnpm check

# Format code
pnpm format
```

Current test coverage:
- ✅ Game engine logic (20 tests)
- ✅ Authentication flow (1 test)
- ✅ Card generation and validation
- ✅ Bingo detection algorithms
- ✅ Pattern matching (lines, diagonals, custom)

## 🎨 Design System

### Color Palette
- **Primary**: Winter blue (OKLCH 0.45 0.15 240)
- **Accent**: Warm holiday orange (OKLCH 0.55 0.20 20)
- **Background**: Soft gradient (OKLCH 0.96-0.98)
- **Glassmorphism**: Frosted translucent panels

### Typography
- **Font**: System font stack for performance
- **Headings**: Semibold with tight tracking
- **Body**: Regular weight, optimized for readability

### Animations
- **Tile Mark**: 300ms scale pulse
- **Drawer Slide**: 300ms ease-out
- **Hover Effects**: Subtle scale and border transitions

## 🔒 Security Features

### Authentication
- Manus OAuth integration for host accounts
- QR code passwordless login for mobile
- Backup username/password for emergencies
- Short-lived admin sessions (24 hours)

### Game Integrity
- Server-authoritative game state
- Anti-cheat tile validation
- UUID-based player identification
- Secure cookie storage (HttpOnly, Secure, SameSite)

### Privacy
- No analytics or tracking
- No third-party CDN calls
- Player data limited to name and UUID
- Session data cleared on game reset

## 🎯 Production Deployment

### Manus Platform

This application is designed for deployment on the Manus platform:

1. **Create Checkpoint**: Save a checkpoint of the current state
2. **Click Publish**: Use the Publish button in the Manus UI
3. **Configure Domain**: Set up custom domain if needed
4. **Add Secrets**: Configure AI voice API keys if using that feature

### Manual Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 📝 API Documentation

### tRPC Routers

#### `game.*`
- `createSession`: Create new game session (host only)
- `getSession`: Get session details by code
- `startRound`: Start a new round
- `callImage`: Call an image (host only)
- `endRound`: End current round
- `resetGame`: Reset entire game
- `joinSession`: Join as player
- `getMyCard`: Get player's bingo card
- `markTile`: Mark a tile (with validation)
- `claimBingo`: Claim bingo
- `verifyBingo`: Verify bingo claim (host only)
- `getScoreboard`: Get player scores
- `getImageCatalog`: Get all available images

#### `adminAuth.*`
- `generateQRLogin`: Generate QR code for admin login
- `verifyQRLogin`: Verify QR scan (mobile)
- `checkQRLoginStatus`: Poll QR login status (desktop)
- `backupLogin`: Username/password admin login
- `checkAdminStatus`: Check if user is admin

### WebSocket Events

#### Client → Server
- `join_session`: Join a game session room
- `leave_session`: Leave a game session room
- `join_as_host`: Join as host

#### Server → Client
- `game_event`: Broadcast to all players
  - `player_joined`: New player joined
  - `image_called`: Image was called
  - `tile_marked`: Player marked a tile
  - `round_started`: New round started
  - `round_ended`: Round ended
  - `game_reset`: Game was reset

- `host_event`: Sent only to host
  - `bingo_claimed`: Player claimed bingo

## 🤝 Contributing

This is a production application. For modifications:

1. Create a new branch
2. Make changes
3. Run tests: `pnpm test`
4. Check types: `pnpm check`
5. Format code: `pnpm format`
6. Create checkpoint before deploying

## 📄 License

Proprietary - All rights reserved

## 🎉 Credits

- **Winter Images**: AI-generated corporate-safe holiday imagery
- **Design**: Fortune-50 inspired glassmorphism aesthetic
- **Architecture**: Modular, production-ready structure
- **Security**: Enterprise-grade authentication and validation

---

Built with ❄️ for corporate holiday celebrations
