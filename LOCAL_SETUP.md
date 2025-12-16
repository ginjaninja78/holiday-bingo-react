# Local Development Setup

This guide will help you run the Holiday Bingo application locally on your machine.

---

## Prerequisites

- **Node.js** 22.x or higher ([Download](https://nodejs.org/))
- **pnpm** 10.x or higher (install via `npm install -g pnpm`)
- **MySQL** 8.0+ or **TiDB** (local or cloud instance)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/ginjaninja78/holiday-bingo-react.git
cd holiday-bingo-react
```

---

## Step 2: Install Dependencies

```bash
pnpm install
```

This will install all required packages for both client and server.

---

## Step 3: Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example (if it exists) or create manually
touch .env
```

Add the following required environment variables:

```env
# Database Connection
DATABASE_URL=mysql://user:password@localhost:3306/holiday_bingo

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# OAuth Configuration (for Manus OAuth - optional for local dev)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=your-app-id

# Owner Info (optional)
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Your Name

# App Branding
VITE_APP_TITLE=Holiday Bingo
VITE_APP_LOGO=/logo.png

# Forge API (optional - for LLM/storage features)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

### Minimal Configuration for Local Testing

If you just want to test locally without OAuth:

```env
DATABASE_URL=mysql://root:password@localhost:3306/holiday_bingo
JWT_SECRET=local-dev-secret-key-12345
VITE_APP_TITLE=Holiday Bingo
VITE_APP_LOGO=/logo.png
```

---

## Step 4: Set Up the Database

### Option A: Local MySQL

1. Install MySQL 8.0+ on your machine
2. Create a database:

```sql
CREATE DATABASE holiday_bingo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Update `DATABASE_URL` in `.env` with your credentials

### Option B: TiDB Cloud (Free Tier)

1. Sign up at [https://tidbcloud.com](https://tidbcloud.com)
2. Create a free cluster
3. Get the connection string and add to `DATABASE_URL`

---

## Step 5: Run Database Migrations

```bash
pnpm db:push
```

This will:
- Generate migration files from `drizzle/schema.ts`
- Apply migrations to your database
- Create all required tables

**Expected output:**
```
✓ Migrations generated
✓ Migrations applied successfully
```

---

## Step 6: Seed Gallery Images

The gallery images are already in `client/public/images/`. To seed the database with image metadata:

```bash
node seed-gallery.mjs
```

**Expected output:**
```
Seeding gallery images...
✓ Cleared existing images
✓ Inserted 60 images
Database seeded successfully!
```

---

## Step 7: Start the Development Server

```bash
pnpm dev
```

This starts:
- **Vite dev server** (frontend) on port 5173
- **Express server** (backend) on port 3000

**Expected output:**
```
Server running on http://localhost:3000/
```

---

## Step 8: Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

The Vite dev server proxies through the Express server, so you only need one URL.

---

## Troubleshooting

### Database Connection Errors

**Error:** `ER_ACCESS_DENIED_ERROR` or `ECONNREFUSED`

**Solution:**
- Verify MySQL is running: `mysql --version`
- Check credentials in `DATABASE_URL`
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
- Kill the process using port 3000:
  ```bash
  # macOS/Linux
  lsof -ti:3000 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Missing Images

**Error:** Images not loading in gallery

**Solution:**
- Ensure `client/public/images/` contains all 60 image files
- Run `node seed-gallery.mjs` to populate database
- Check browser console for 404 errors

### OAuth Errors (Local Dev)

**Error:** OAuth redirect fails

**Solution:**
- For local testing, you can bypass OAuth by modifying `server/_core/context.ts`
- Or set up a local OAuth mock server
- OAuth is only required for production deployment

---

## Project Structure

```
holiday-bingo/
├── client/                    # Frontend (React + Vite)
│   ├── public/
│   │   ├── images/           # Gallery images (60 files)
│   │   ├── logo.png          # John Hancock logo
│   │   └── FREESPACE.png     # FREE space image
│   └── src/
│       ├── pages/            # Route components
│       ├── components/       # Reusable UI
│       └── lib/trpc.ts       # tRPC client
├── server/                    # Backend (Express + tRPC)
│   ├── _core/                # Framework (OAuth, context)
│   ├── routers.ts            # tRPC procedures
│   ├── db.ts                 # Database queries
│   ├── pdfGenerator.ts       # PDF card generation
│   └── bingoVerification.ts  # Bingo logic (if implemented)
├── drizzle/                   # Database
│   ├── schema.ts             # Table definitions
│   └── *.sql                 # Migration files
├── shared/                    # Shared types
├── docs/                      # Documentation & TODOs
├── .env                       # Environment variables (create this)
├── package.json              # Dependencies & scripts
└── README.md                 # Project overview
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (hot reload) |
| `pnpm build` | Build for production |
| `pnpm start` | Run production build |
| `pnpm db:push` | Generate and apply database migrations |
| `pnpm test` | Run unit tests |
| `pnpm check` | TypeScript type checking |
| `pnpm format` | Format code with Prettier |

---

## Database Schema

The application uses the following main tables:

- `users` - User accounts (OAuth)
- `gallery_images` - Image library (60 holiday images)
- `generated_cards` - Bingo cards with unique IDs
- `host_game_state` - Active game sessions
- `host_game_configs` - Game configurations
- `managed_players` - Player roster
- `player_cards` - Links players to cards

See `drizzle/schema.ts` for complete schema.

---

## Features

### Working Features
- ✅ PDF card generation with images
- ✅ John Hancock logo integration
- ✅ FREE SPACE image
- ✅ Unique Card IDs (5-char alphanumeric)
- ✅ Gallery image management
- ✅ Host dashboard
- ✅ Game setup and controls

### In Development
- 🚧 Bingo winner verification (see `docs/TODO-SCORING-SYSTEM.md`)
- 🚧 PDF interactive checkboxes (see `docs/TODO-PDF-CHECKBOXES.md`)
- 🚧 Editable host name (see `docs/TODO-EDITABLE-HOST-NAME.md`)

---

## Contributing

See individual TODO files in `docs/` for implementation guides:
- `docs/TODO-EDITABLE-HOST-NAME.md` - Quick win (~1 hour)
- `docs/TODO-SCORING-SYSTEM.md` - Critical feature (~5-6 hours)
- `docs/TODO-PDF-CHECKBOXES.md` - UX improvement (~6-9 hours)

---

## Need Help?

- Check `README.md` for project overview
- Review `docs/TODO-*.md` for feature implementation guides
- Check GitHub issues for known problems
- Review template README at project root for tRPC/framework details

---

## License

Proprietary - Internal use only
