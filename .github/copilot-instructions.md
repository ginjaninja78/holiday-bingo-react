# Holiday Bingo - GitHub Copilot Instructions

## Project Overview

**Holiday Bingo** is a corporate-safe, interactive image-based bingo game designed for holiday parties and team events. The host displays images one by one, and players mark matching images on their unique bingo cards. The first player to complete a pattern (row, column, diagonal, etc.) wins.

**Tech Stack:**
- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Wouter (routing), shadcn/ui components
- **Backend:** Express 4, tRPC 11, Drizzle ORM
- **Database:** MySQL/TiDB (via Drizzle)
- **Auth:** Manus OAuth (pre-configured)
- **PDF Generation:** jsPDF, Sharp (image processing)
- **Testing:** Vitest

**Key Features:**
- Real-time gameplay with image display
- PDF card generation with unique IDs
- Player roster management with batch IDs
- Score tracking and leaderboard
- Game history archiving
- CSV import/export for player management
- Gallery management (60 corporate-safe holiday images)

## Project Structure

```
holiday-bingo/
├── client/
│   ├── public/
│   │   └── images/gallery/          # 60 holiday images
│   └── src/
│       ├── pages/                   # Page-level components
│       │   ├── Home.tsx            # Landing page
│       │   ├── PlayScreen.tsx      # Main gameplay interface
│       │   └── ...
│       ├── components/              # Reusable UI components
│       │   ├── ui/                 # shadcn/ui components
│       │   ├── GalleryPanel.tsx    # Gallery management drawer
│       │   ├── PlayerManagementPanel.tsx
│       │   ├── ScoreTrackingPanel.tsx
│       │   └── ...
│       ├── hooks/                   # Custom React hooks
│       ├── contexts/                # React contexts
│       ├── lib/
│       │   └── trpc.ts             # tRPC client setup
│       ├── App.tsx                  # Routes and layout
│       ├── main.tsx                 # Providers
│       └── index.css                # Global styles + Tailwind
├── server/
│   ├── _core/                       # Framework internals (DO NOT EDIT)
│   │   ├── context.ts              # tRPC context
│   │   ├── oauth.ts                # Auth handlers
│   │   ├── llm.ts                  # LLM integration
│   │   └── ...
│   ├── routers/                     # Feature-specific routers
│   │   ├── playerRouter.ts
│   │   ├── gameHistoryRouter.ts
│   │   └── ...
│   ├── routers.ts                   # Main tRPC router (combines all routers)
│   ├── db.ts                        # Database query helpers
│   ├── pdfRouter.ts                 # PDF generation endpoints
│   ├── pdfGenerator.ts              # PDF generation logic
│   ├── bingoRouter.ts               # Bingo game logic
│   └── *.test.ts                    # Vitest test files
├── drizzle/
│   └── schema.ts                    # Database schema definitions
├── shared/
│   ├── imageGallery.ts              # Image gallery data
│   └── types.ts                     # Shared TypeScript types
├── storage/                          # S3 helpers
├── docs/                             # Reference documentation
├── MASTER-TODO.md                    # Central task coordination file
└── mcp-config.json                   # MCP server configuration
```

## Development Workflow

### 1. Database Changes
```bash
# 1. Edit schema
vim drizzle/schema.ts

# 2. Push changes to database
pnpm db:push

# 3. Verify migration applied
```

### 2. Adding a New Feature
```typescript
// 1. Add database helpers in server/db.ts
export async function getPlayersByBatchId(batchId: string) {
  const db = await getDb();
  return db.select().from(managedPlayers).where(eq(managedPlayers.batchId, batchId));
}

// 2. Create tRPC procedure in server/routers/<feature>Router.ts
export const playerRouter = router({
  getByBatch: protectedProcedure
    .input(z.object({ batchId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await getPlayersByBatchId(input.batchId);
    }),
});

// 3. Add router to server/routers.ts
import { playerRouter } from './routers/playerRouter';

export const appRouter = router({
  // ... existing routers
  player: playerRouter,
});

// 4. Use in React component
const { data: players } = trpc.player.getByBatch.useQuery({ batchId });

// 5. Write test in server/routers/playerRouter.test.ts
describe('playerRouter.getByBatch', () => {
  it('should return players for valid batch ID', async () => {
    // test implementation
  });
});
```

### 3. Running Tests
```bash
pnpm test                    # Run all tests
pnpm test playerRouter       # Run specific test file
pnpm test --watch            # Watch mode
```

## Coding Standards

### TypeScript

**DO:**
- Use `strict` mode (already configured)
- Define explicit return types for functions
- Use interfaces for object shapes
- Use type guards for runtime checks
- Use `unknown` instead of `any` when type is truly unknown

**DON'T:**
- Use `any` type (use `unknown` or proper types)
- Use `@ts-ignore` (fix the type error instead)
- Use type assertions unless absolutely necessary

**Examples:**
```typescript
// ✅ Good
interface Player {
  id: string;
  name: string;
  batchId: string;
}

function getPlayer(id: string): Player | null {
  // implementation
}

// ❌ Bad
function getPlayer(id: any): any {
  // implementation
}
```

### React

**DO:**
- Use functional components only
- Use hooks for state and side effects
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive computations
- Use `React.memo` for components that re-render frequently
- Handle loading and error states explicitly

**DON'T:**
- Call `setState` or navigate in render phase (use `useEffect`)
- Create new objects/arrays in render that are used as dependencies
- Use inline arrow functions for event handlers in lists

**Examples:**
```typescript
// ✅ Good
const PlayerList = React.memo(({ players }: { players: Player[] }) => {
  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  return (
    <ul>
      {players.map(player => (
        <PlayerItem key={player.id} player={player} onDelete={handleDelete} />
      ))}
    </ul>
  );
});

// ❌ Bad
const PlayerList = ({ players }: { players: Player[] }) => {
  return (
    <ul>
      {players.map(player => (
        <PlayerItem 
          key={player.id} 
          player={player} 
          onDelete={() => deleteMutation.mutate(player.id)} // New function every render!
        />
      ))}
    </ul>
  );
};
```

### tRPC

**DO:**
- Define procedures in feature-specific router files
- Use `publicProcedure` for unauthenticated endpoints
- Use `protectedProcedure` for authenticated endpoints
- Return raw Drizzle results (superjson handles serialization)
- Use Zod for input validation
- Throw `TRPCError` for errors

**DON'T:**
- Create REST endpoints (use tRPC instead)
- Manually serialize/deserialize data
- Access `ctx.user` in `publicProcedure` (it may be undefined)

**Examples:**
```typescript
// ✅ Good
export const playerRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      batchId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const player = await createPlayer({
        ...input,
        createdBy: ctx.user.id,
      });
      return player; // Drizzle result, superjson handles Date serialization
    }),

  getAll: publicProcedure
    .query(async () => {
      return await getAllPlayers();
    }),
});

// ❌ Bad
export const playerRouter = router({
  create: publicProcedure // Should be protectedProcedure!
    .input(z.any()) // Should use proper Zod schema!
    .mutation(async ({ input, ctx }) => {
      const player = await createPlayer(input);
      return JSON.stringify(player); // Don't manually serialize!
    }),
});
```

### Database (Drizzle)

**DO:**
- Define schema in `drizzle/schema.ts`
- Use `await getDb()` to get database instance
- Use Drizzle query builder (type-safe)
- Use transactions for multi-step operations
- Add indexes for frequently queried columns

**DON'T:**
- Use raw SQL unless absolutely necessary
- Store file bytes in database (use S3 instead)
- Use BLOB/BYTEA columns

**Examples:**
```typescript
// ✅ Good
export async function getPlayersByBatch(batchId: string) {
  const db = await getDb();
  return db
    .select()
    .from(managedPlayers)
    .where(eq(managedPlayers.batchId, batchId))
    .orderBy(managedPlayers.createdAt);
}

// ❌ Bad
export async function getPlayersByBatch(batchId: string) {
  const db = await getDb();
  return db.execute(sql`SELECT * FROM managed_players WHERE batch_id = ${batchId}`); // Use query builder!
}
```

### UI/UX (Tailwind + shadcn/ui)

**DO:**
- Use shadcn/ui components for consistency
- Use Tailwind utility classes
- Use CSS variables for theming (defined in `index.css`)
- Design mobile-first, then add responsive breakpoints
- Handle empty states, loading states, and error states
- Use semantic color classes (`bg-background`, `text-foreground`)

**DON'T:**
- Write custom CSS unless absolutely necessary
- Use inline styles
- Hardcode colors (use theme variables)
- Nest `<Link>` inside `<a>` or vice versa

**Examples:**
```typescript
// ✅ Good
<Card className="bg-card text-card-foreground">
  <CardHeader>
    <CardTitle>Players</CardTitle>
  </CardHeader>
  <CardContent>
    {isLoading ? (
      <Skeleton className="h-20 w-full" />
    ) : players.length === 0 ? (
      <p className="text-muted-foreground">No players yet</p>
    ) : (
      <PlayerList players={players} />
    )}
  </CardContent>
</Card>

// ❌ Bad
<div style={{ background: '#fff', color: '#000' }}> {/* Don't use inline styles! */}
  <h2>Players</h2>
  <div>
    {players.map(p => <div>{p.name}</div>)} {/* No loading/empty states! */}
  </div>
</div>
```

### Testing (Vitest)

**DO:**
- Write tests for all tRPC procedures
- Use descriptive test names
- Test happy path and error cases
- Mock database calls
- Use `describe` blocks to group related tests

**DON'T:**
- Test implementation details
- Write tests that depend on external services
- Skip error case testing

**Examples:**
```typescript
// ✅ Good
describe('playerRouter.create', () => {
  it('should create player with valid input', async () => {
    const input = { name: 'Alice', batchId: 'uuid-123' };
    const result = await caller.player.create(input);
    expect(result.name).toBe('Alice');
    expect(result.batchId).toBe('uuid-123');
  });

  it('should throw error for invalid batch ID', async () => {
    const input = { name: 'Alice', batchId: 'invalid' };
    await expect(caller.player.create(input)).rejects.toThrow();
  });
});

// ❌ Bad
it('test', async () => { // Non-descriptive name!
  const result = await caller.player.create({ name: 'Alice', batchId: 'uuid-123' });
  expect(result).toBeTruthy(); // Weak assertion!
});
```

## Common Patterns

### Optimistic Updates (tRPC)

Use for instant feedback on user actions (add/edit/delete items, toggle states):

```typescript
const deleteMutation = trpc.player.delete.useMutation({
  onMutate: async (id) => {
    // Cancel outgoing queries
    await utils.player.getAll.cancel();
    
    // Snapshot current data
    const prev = utils.player.getAll.getData();
    
    // Optimistically update
    utils.player.getAll.setData(undefined, (old) => 
      old?.filter(player => player.id !== id)
    );
    
    return { prev };
  },
  onError: (err, id, ctx) => {
    // Rollback on error
    utils.player.getAll.setData(undefined, ctx?.prev);
    toast.error("Failed to delete player");
  },
  onSettled: () => {
    // Refetch to ensure sync
    utils.player.getAll.invalidate();
  },
});
```

### Query Invalidation (tRPC)

Use for critical operations where data integrity is important (payments, auth):

```typescript
const createMutation = trpc.player.create.useMutation({
  onSuccess: () => {
    utils.player.getAll.invalidate(); // Refetch data
    toast.success("Player created!");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

### File Upload to S3

```typescript
import { storagePut } from './server/storage';

// Generate non-enumerable key
const fileKey = `${userId}/files/${fileName}-${randomUUID()}.png`;

// Upload to S3
const { url } = await storagePut(
  fileKey,
  fileBuffer,
  "image/png"
);

// Store metadata in database
await db.insert(files).values({
  userId,
  fileKey,
  url,
  mimeType: "image/png",
  size: fileBuffer.length,
});
```

### Error Handling

```typescript
try {
  const result = await trpc.player.create.mutate({ name, batchId });
  toast.success("Player created!");
} catch (error) {
  if (error instanceof TRPCClientError) {
    toast.error(error.message);
  } else {
    toast.error("An unexpected error occurred");
  }
}
```

## Project-Specific Guidelines

### Image Gallery

- All images stored in `client/public/images/gallery/`
- Image metadata in `gallery_images` database table
- URLs format: `/images/gallery/<filename>.png`
- Always use database query for image list (don't hardcode)

### PDF Card Generation

- Use `jsPDF` for PDF creation
- Use `Sharp` for image processing
- Generate unique 5-character Card IDs (alphanumeric, uppercase)
- Include Player UUID on cards (not just Card ID)
- Create separate PDFs for multiple players, zip if count > 1
- Use `archiver` package for ZIP creation

### Player Management

- Each player has a UUID (primary identifier)
- Players can have multiple cards (1:N relationship)
- Cards grouped by Batch ID (UUID)
- CSV format: `player_uuid,name,card_id1|card_id2|...`

### Game Flow

1. Host sets up game (pattern, images)
2. Host generates PDF cards (assigned to players via Batch ID)
3. Host starts game
4. Host displays images one by one
5. Players mark matching images on their cards
6. Players call "BINGO" when pattern complete
7. Host verifies BINGO (manual verification for now)
8. Game continues until all patterns won or host ends round
9. Scores tracked in leaderboard
10. Game archived to history

### Authentication

- Manus OAuth pre-configured
- Session cookie automatically managed
- Use `useAuth()` hook for current user
- Use `protectedProcedure` for authenticated endpoints
- Use `ctx.user` to access current user in procedures

## File Naming Conventions

- **Components:** PascalCase (e.g., `PlayerManagementPanel.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `usePlayerRoster.ts`)
- **Utils:** camelCase (e.g., `formatCardId.ts`)
- **Types:** PascalCase (e.g., `Player`, `GameState`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_PLAYERS`)

## Environment Variables

**Available (pre-configured):**
- `DATABASE_URL` - MySQL/TiDB connection
- `JWT_SECRET` - Session signing
- `VITE_APP_ID` - Manus OAuth app ID
- `OAUTH_SERVER_URL` - OAuth backend
- `VITE_OAUTH_PORTAL_URL` - OAuth frontend
- `BUILT_IN_FORGE_API_URL` - Manus APIs
- `BUILT_IN_FORGE_API_KEY` - API auth (server-side)
- `VITE_FRONTEND_FORGE_API_KEY` - API auth (frontend)

**DO NOT:**
- Edit these directly in code
- Commit `.env` files
- Hardcode secrets

## Common Pitfalls

### 1. Infinite Query Loops

**Problem:** Creating new objects/arrays in render that are used as query inputs

```typescript
// ❌ Bad
const { data } = trpc.items.getByDate.useQuery({
  date: new Date(), // New object every render!
});

// ✅ Good
const [date] = useState(() => new Date());
const { data } = trpc.items.getByDate.useQuery({ date });
```

### 2. Storing Files in Database

**Problem:** Adding BLOB/BYTEA columns

```typescript
// ❌ Bad
export const files = sqliteTable('files', {
  content: blob('content'), // Never store file bytes!
});

// ✅ Good
export const files = sqliteTable('files', {
  fileKey: text('file_key').notNull(),
  url: text('url').notNull(),
  mimeType: text('mime_type'),
  size: integer('size'),
});
```

### 3. Nested Anchor Tags

**Problem:** Wrapping `<a>` inside `<Link>` or vice versa

```typescript
// ❌ Bad
<Link href="/play">
  <a>Go to Game</a> {/* Link already renders an <a>! */}
</Link>

// ✅ Good
<Link href="/play">
  Go to Game
</Link>
```

### 4. Empty Select Values

**Problem:** `<Select.Item>` with empty `value`

```typescript
// ❌ Bad
<Select.Item value="">Select...</Select.Item>

// ✅ Good
<Select.Item value="placeholder" disabled>Select...</Select.Item>
```

### 5. Theme/Color Mismatches

**Problem:** Using semantic colors without pairing

```typescript
// ❌ Bad
<div className="bg-popover">
  Text here {/* Inherits parent text color, may be invisible! */}
</div>

// ✅ Good
<div className="bg-popover text-popover-foreground">
  Text here
</div>
```

## Task Coordination

**IMPORTANT:** Before starting work on a feature or bug fix, check `MASTER-TODO.md` to see if it's already assigned or in progress.

**Task Assignment Format:**
```markdown
- [ ] [@copilot] Add JSDoc comments to all exported functions in server/
  - Files: `server/db.ts`, `server/routers/*.ts`
  - Pattern: Include @param, @returns, @throws
  - Example: See `server/auth.logout.test.ts`
```

**When completing a task:**
1. Implement the changes
2. Commit with descriptive message
3. Reference TODO in commit: `Fixes MASTER-TODO.md #L45`
4. Do NOT mark task complete (only @human does this)

## Resources

- **tRPC Docs:** https://trpc.io/docs
- **Drizzle Docs:** https://orm.drizzle.team/docs/overview
- **shadcn/ui:** https://ui.shadcn.com/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Vitest:** https://vitest.dev/

## Questions?

If you're unsure about a pattern or approach:
1. Check this file first
2. Look for similar implementations in the codebase
3. Check `MASTER-TODO.md` for context
4. Refer to `/docs` for detailed documentation
