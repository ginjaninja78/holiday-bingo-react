# Database Setup Guide

## SQLite Database Configuration

This project uses **SQLite** as its database - a lightweight, file-based, zero-configuration database that works seamlessly in both development and production environments.

### Why SQLite?

- ✅ **FREE** - No cost, no limits
- ✅ **Lightweight** - Single file database (~100KB empty, grows with data)
- ✅ **Fast** - Extremely responsive for this use case
- ✅ **Zero Config** - No server setup required
- ✅ **Portable** - Database file can be backed up, moved, or versioned
- ✅ **Production Ready** - Works identically in dev and production

### Database Location

- **Development**: `/home/ubuntu/holiday-bingo-react/data/bingo.db`
- **Production**: `./data/bingo.db` (relative to project root)

The database file is automatically created when you run the initialization script.

### Initial Setup

1. **Install Dependencies** (if not already done):
   ```bash
   pnpm install
   ```

2. **Initialize Database**:
   ```bash
   pnpm tsx scripts/init-db.ts
   ```

This will:
- Create the `data/` directory
- Generate the SQLite database file
- Run all migrations to create tables
- Seed 60 winter-themed gallery images from `client/public/images/gallery/`

### Verify Database

Check that the database was created successfully:

```bash
ls -lh data/bingo.db
```

You should see a file around 100-200KB in size.

### Database Schema

The database includes the following tables:

- **users** - User authentication and profiles
- **game_sessions** - Active game sessions
- **players** - Players in multiplayer mode
- **managed_players** - Players in host-only mode
- **bingo_cards** - Generated bingo cards
- **called_images** - Images called during gameplay
- **bingo_claims** - Bingo claims and verifications
- **admin_sessions** - Admin authentication sessions
- **host_game_configs** - Game configurations
- **host_game_state** - Current game state
- **gallery_images** - Available images for bingo cards (60 seeded)
- **generated_cards** - Pre-generated PDF cards
- **player_cards** - Player-to-card assignments
- **game_history** - Archived completed games
- **unsplash_settings** - Unsplash API configuration

### Migrations

Migrations are stored in `drizzle/migrations/` and are automatically applied during initialization.

To generate new migrations after schema changes:

```bash
pnpm drizzle-kit generate
```

### Resetting the Database

To start fresh (WARNING: This deletes all data):

```bash
rm -f data/bingo.db
pnpm tsx scripts/init-db.ts
```

### Production Deployment

The SQLite database works identically in production. When publishing through Manus:

1. The `data/` directory will be created automatically
2. Run the init script once: `pnpm tsx scripts/init-db.ts`
3. The database file persists across deployments

### Backup

To backup your database:

```bash
cp data/bingo.db data/bingo.db.backup
```

To restore:

```bash
cp data/bingo.db.backup data/bingo.db
```

### Performance

SQLite uses Write-Ahead Logging (WAL) mode for better concurrency and performance. This is automatically enabled in the database connection.

### Troubleshooting

**Database not found error:**
- Run `pnpm tsx scripts/init-db.ts` to create it

**Permission errors:**
- Ensure the `data/` directory is writable
- Check file permissions: `chmod 755 data/`

**Slow queries:**
- SQLite is extremely fast for this use case
- If you experience slowness, check disk space and I/O

### Development vs Production

The database configuration automatically works in both environments:

- **Development**: Uses local file path
- **Production**: Uses the same local file path (portable)
- **No environment variables needed** for basic operation
- **Optional**: Set `DATABASE_PATH` env var to customize location

### Schema Changes

When modifying the schema in `drizzle/schema.ts`:

1. Update the schema file
2. Generate migration: `pnpm drizzle-kit generate`
3. Apply migration: Restart the server (auto-applies) or run init script
4. Commit both schema and migration files

### Gallery Images

The database is seeded with 60 winter-themed images from the `client/public/images/gallery/` directory. These images are:

- Automatically loaded during initialization
- Stored with labels extracted from filenames
- Marked as "ai_generated" source
- Used for bingo card generation

To add more images:
1. Add PNG files to `client/public/images/gallery/`
2. Run the init script again (it will add new images)
