# RULES File Patterns Research

## Source
- Repository: https://github.com/PatrickJS/awesome-cursorrules
- 36.1k stars, 3.1k forks
- Comprehensive collection of `.cursorrules` examples

## Key Findings

### 1. Modular Structure Pattern

**Best Practice:** Use modular `.mdc` (Markdown Context) files instead of monolithic `.cursorrules`

**Structure:**
```
project-root/
├── .cursorrules                    # Main orchestrator file
└── .cursor/
    └── rules/
        ├── project-structure.mdc
        ├── best-practices.mdc
        ├── performance-guidelines.mdc
        ├── testing-guidelines.mdc
        └── ui-guidelines.mdc
```

**Benefits:**
- Separation of concerns
- Easier maintenance
- Modular updates
- Team collaboration (different team members own different `.mdc` files)
- Reduced token usage (only relevant modules loaded)

### 2. .cursorrules File Format

The `.cursorrules` file is a JavaScript/TypeScript configuration that:
- Defines project architecture
- Lists best practices as arrays
- References folder structures
- Specifies coding standards

**Example Structure:**
```javascript
// Android Jetpack Compose .cursorrules

// Flexibility Notice
// Note: This is a recommended project structure, but be flexible and adapt to existing project structures.
// Do not enforce a strict structural pattern if the project follows a different organization.
// Focus on maintaining consistency with the existing project architecture while applying Jetpack Compose best practices.

// Project Architecture and Best Practices
const androidJetpackComposeBestPractices = [
  "Adapt to existing project architecture while maintaining clean code principles",
  "Follow Material Design 3 guidelines for components",
  "Implement clean architecture with domain, data, and presentation layers",
  "Use Kotlin coroutines and Flow for asynchronous operations",
  "Implement dependency injection using Hilt",
  "Follow unidirectional data flow with ViewModel and UI State",
  "Use Compose navigation for screen management",
  "Implement proper state hoisting and composition",
];

// Folder Structure
const projectStructure = `
app/
  src/
    main/
      java/com/example/app/
        data/
        domain/
        presentation/
`;
```

### 3. .mdc File Format

`.mdc` files are Markdown Context documents that provide detailed guidelines for specific aspects:

**Example: `android-jetpack-compose---general-best-practices.mdc`**
```markdown
# Android Jetpack Compose - General Best Practices

## Architecture
- Use clean architecture with clear separation of concerns
- Implement MVVM pattern with ViewModel and State
- Follow unidirectional data flow

## Composables
- Keep composables small and focused
- Use `remember` for state that survives recomposition
- Implement proper state hoisting
- Use `LaunchedEffect` for side effects

## Performance
- Minimize recompositions
- Use `derivedStateOf` for computed values
- Implement lazy loading for lists
```

### 4. GitHub Copilot vs Cursor Rules

**Key Difference:**
- **Cursor**: Uses `.cursorrules` + `.mdc` files in project root
- **GitHub Copilot**: Uses `.github/copilot-instructions.md` (single file, Markdown format)

**GitHub Copilot Format:**
```markdown
# Project Context

This is a Holiday Bingo web application built with React 19, TypeScript, tRPC, and Express.

## Tech Stack
- Frontend: React 19, Tailwind 4, Wouter (routing)
- Backend: Express 4, tRPC 11, Drizzle ORM
- Database: MySQL/TiDB
- Auth: Manus OAuth

## Coding Standards

### TypeScript
- Use strict mode
- Avoid `any` types
- Prefer interfaces over types for object shapes

### React
- Use functional components only
- Prefer hooks over class components
- Use `useCallback` and `useMemo` for optimization

### tRPC
- Define procedures in `server/routers.ts`
- Use `protectedProcedure` for authenticated routes
- Return raw Drizzle results (superjson handles serialization)

## Project Structure
\`\`\`
client/src/
  pages/       ← Page components
  components/  ← Reusable UI
  hooks/       ← Custom hooks
  lib/trpc.ts  ← tRPC client

server/
  routers.ts   ← tRPC procedures
  db.ts        ← Database helpers
  
drizzle/
  schema.ts    ← Database schema
\`\`\`

## Development Workflow
1. Update schema in `drizzle/schema.ts`
2. Run `pnpm db:push`
3. Add helpers in `server/db.ts`
4. Create procedures in `server/routers.ts`
5. Use `trpc.*.useQuery/useMutation` in UI
6. Write Vitest tests in `server/*.test.ts`

## Testing
- Write Vitest tests for all tRPC procedures
- Test file naming: `<feature>.test.ts`
- Mock database calls in tests
- Aim for 80%+ coverage

## Common Patterns

### Optimistic Updates
\`\`\`typescript
const mutation = trpc.items.delete.useMutation({
  onMutate: async (id) => {
    await utils.items.list.cancel();
    const prev = utils.items.list.getData();
    utils.items.list.setData(undefined, (old) => 
      old?.filter(item => item.id !== id)
    );
    return { prev };
  },
  onError: (err, id, ctx) => {
    utils.items.list.setData(undefined, ctx?.prev);
  },
});
\`\`\`

### Error Handling
\`\`\`typescript
try {
  const result = await trpc.feature.action.mutate(data);
  toast.success("Success!");
} catch (error) {
  if (error instanceof TRPCClientError) {
    toast.error(error.message);
  }
}
\`\`\`

## Avoid
- Direct database queries in React components
- Axios/fetch (use tRPC instead)
- Manual cookie handling (use `useAuth()`)
- `console.log` in production code
- Hardcoded values (use environment variables)
```

### 5. Multi-Agent Coordination Pattern

**Master TODO System:**
```markdown
# MASTER-TODO.md

## Format
- Use GitHub-flavored Markdown
- Checkbox format: `- [ ]` for pending, `- [x]` for complete
- Hierarchical structure with `##` for categories
- Include priority tags: `[P0]`, `[P1]`, `[P2]`
- Include assignee tags: `[@manus]`, `[@copilot]`, `[@human]`

## Categories
1. **Critical Bugs** - Must fix immediately
2. **Features** - New functionality
3. **Refactoring** - Code quality improvements
4. **Documentation** - Docs and comments
5. **Testing** - Test coverage
6. **DevOps** - CI/CD, automation

## Example
\`\`\`markdown
## Critical Bugs [P0]

- [ ] [@manus] Fix gallery image loading (45/60 showing)
- [ ] [@manus] PDF generation creates single file instead of zip
- [x] [@manus] Database sync (60 images)

## Features [P1]

- [ ] [@copilot] Implement batch ID system for player management
- [ ] [@copilot] Add CSV import/export with selection screens
- [ ] [@human] Test end-to-end gameplay flow

## Refactoring [P2]

- [ ] [@copilot] Remove console.log statements (47 found)
- [ ] [@copilot] Fix TypeScript `any` types (89 found)
- [ ] [@copilot] Add JSDoc comments to exported functions
\`\`\`
```

### 6. Agent Coordination Rules

**Principle:** Each agent has specific responsibilities, communicated via Master TODO

**Agent Roles:**
- **@manus** (this AI): Complex logic, architecture decisions, debugging
- **@copilot** (GitHub Copilot): Code completion, refactoring, repetitive tasks
- **@human** (developer): Review, testing, business logic decisions

**Coordination via MASTER-TODO.md:**
1. Manus updates TODO with `[@copilot]` tags for tasks suitable for Copilot
2. Copilot reads TODO and completes assigned tasks
3. Human reviews and marks items complete
4. All agents check TODO before starting work to avoid conflicts

**Example Workflow:**
```
1. Manus identifies: "Need to add JSDoc to 50 exported functions"
2. Manus adds to TODO: "- [ ] [@copilot] Add JSDoc comments to all exported functions in server/"
3. Copilot sees task, generates JSDoc for each function
4. Human reviews, approves changes
5. Human marks: "- [x] [@copilot] Add JSDoc comments to all exported functions in server/"
```

## Recommendations for Holiday Bingo

### 1. Create `.github/copilot-instructions.md`
- Single file format (GitHub Copilot doesn't support `.mdc` modules yet)
- Include all project context, tech stack, patterns
- Reference MASTER-TODO.md for task coordination

### 2. Create Modular RULES (for future Cursor/Windsurf support)
```
.cursor/rules/
├── project-structure.mdc
├── react-patterns.mdc
├── trpc-patterns.mdc
├── database-patterns.mdc
├── testing-patterns.mdc
└── ui-ux-guidelines.mdc
```

### 3. Create MASTER-TODO.md
- Central coordination file
- Agent-specific tags
- Priority levels
- Links to relevant code/docs

### 4. GitHub MCP Server Integration
- Use MCP tools for GitHub operations (issues, PRs, reviews)
- Reduce token usage by using tools instead of verbose descriptions
- Configure skills for automated workflows

## Token Optimization Strategies

### 1. Use MCP Tools Instead of Descriptions
❌ Bad (high token usage):
```
"Create a GitHub issue with title 'Fix gallery loading' and body 'The gallery panel shows only 45 images instead of 60. Database has correct count but UI fails to load all images. Steps to reproduce: 1. Open gallery panel 2. Scroll through images 3. Notice missing images with placeholder icons.'"
```

✅ Good (low token usage):
```typescript
await mcp.github.createIssue({
  title: "Fix gallery loading",
  body: readFile("./docs/bugs/gallery-loading-bug.md"),
  labels: ["bug", "P0"]
});
```

### 2. Reference Files Instead of Inline Content
❌ Bad:
```
"The database schema is: [paste 500 lines of schema]"
```

✅ Good:
```
"See database schema in `drizzle/schema.ts`"
```

### 3. Use Structured Data
❌ Bad:
```
"There are 47 console.log statements in the following files: PlayScreen.tsx has 12, GalleryPanel.tsx has 8, ..."
```

✅ Good:
```json
{
  "console_logs": {
    "total": 47,
    "files": {
      "PlayScreen.tsx": 12,
      "GalleryPanel.tsx": 8
    }
  }
}
```

## Next Steps

1. Create `.github/copilot-instructions.md` with full project context
2. Create `MASTER-TODO.md` with agent coordination system
3. Set up GitHub MCP server configuration
4. Create GitHub Actions workflows for automation
5. Test multi-agent coordination with sample tasks
