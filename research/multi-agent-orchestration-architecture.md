# Multi-Agent Orchestration Architecture

## Overview

This document defines the architecture for coordinating multiple AI agents (Manus, GitHub Copilot, and potentially others) to work together efficiently on the Holiday Bingo project without conflicts or redundant work.

## Core Principles

1. **Single Source of Truth**: MASTER-TODO.md serves as the central coordination file
2. **Clear Responsibilities**: Each agent has specific strengths and assigned tasks
3. **Token Efficiency**: Use MCP tools and file references instead of verbose descriptions
4. **Non-Interference**: Agents check TODO before starting work to avoid conflicts
5. **Human Oversight**: Developer reviews and approves all agent work

## Agent Roles & Responsibilities

### @manus (Manus AI - This Assistant)

**Strengths:**
- Complex architectural decisions
- Multi-file refactoring
- Debugging and root cause analysis
- Database schema design
- API design and tRPC procedures
- Research and planning
- End-to-end feature implementation

**Typical Tasks:**
- Design new features
- Fix critical bugs
- Perform code audits
- Create documentation
- Set up infrastructure (CI/CD, MCP, etc.)
- Break down complex tasks for other agents

**Communication:**
- Updates MASTER-TODO.md with tasks for other agents
- Leaves detailed context in TODO items
- Creates reference documents in `/docs` for complex topics

### @copilot (GitHub Copilot)

**Strengths:**
- Code completion and suggestions
- Repetitive refactoring tasks
- Adding JSDoc comments
- Writing unit tests
- Implementing well-defined functions
- Following established patterns

**Typical Tasks:**
- Add JSDoc comments to all exported functions
- Remove console.log statements
- Fix TypeScript `any` types
- Write unit tests for existing functions
- Implement CRUD operations following existing patterns
- Refactor code to follow style guide

**Communication:**
- Reads MASTER-TODO.md for assigned tasks (tagged with `[@copilot]`)
- Reads `.github/copilot-instructions.md` for project context
- Uses inline comments for clarification

### @human (Developer)

**Strengths:**
- Business logic decisions
- UX/UI design choices
- Testing and QA
- Code review and approval
- Strategic planning

**Typical Tasks:**
- Review agent-generated code
- Test features end-to-end
- Make design decisions
- Approve PRs and merges
- Prioritize tasks
- Provide feedback to agents

**Communication:**
- Updates MASTER-TODO.md with priorities
- Marks tasks complete after review
- Provides feedback in PR comments
- Updates project requirements

## Coordination System

### MASTER-TODO.md Format

```markdown
# Holiday Bingo - Master TODO

Last Updated: 2025-12-12 by @manus

## Legend
- `[P0]` - Critical (fix immediately)
- `[P1]` - High priority (this week)
- `[P2]` - Medium priority (this month)
- `[P3]` - Low priority (backlog)
- `[@manus]` - Assigned to Manus AI
- `[@copilot]` - Assigned to GitHub Copilot
- `[@human]` - Requires human decision/review

## Critical Bugs [P0]

### Gallery & Images
- [ ] [@manus] Fix gallery image loading (45/60 showing) - **IN PROGRESS**
  - Context: Database has 60 images but UI only shows 45
  - Files: `client/src/components/GalleryPanel.tsx`, `shared/imageGallery.ts`
  - See: `/docs/bugs/gallery-loading-investigation.md`

- [ ] [@manus] PDF generation creates single file instead of zip for multiple players
  - Context: Should create separate PDFs and zip them when count > 1
  - Files: `server/pdfRouter.ts`, `server/pdfGenerator.ts`
  - Requires: `archiver` package

### Player Management
- [ ] [@manus] Add Player ID to PDF cards (currently only shows Card ID)
  - Context: Each player can have multiple cards, need player UUID on card
  - Files: `server/pdfGenerator.ts` (line 150-200)

- [ ] [@human] Make host name editable (Welcome, Host!)
  - Context: Need inline edit or dialog
  - Files: `client/src/pages/Home.tsx`
  - Decision needed: Inline edit vs modal dialog?

## Features [P1]

### Batch ID System
- [ ] [@manus] Design batch ID database schema
  - Add `batch_id` UUID to `generated_cards` table
  - Create `card_batches` table for metadata

- [ ] [@copilot] Implement batch selector dropdown in player roster
  - Follow pattern from `GalleryPanel.tsx` dropdown
  - Add search functionality
  - Multi-select with checkboxes

### CSV Import/Export
- [ ] [@manus] Design CSV format specification
  - Document in `/docs/csv-format.md`
  - Include validation rules

- [ ] [@copilot] Implement CSV export with selection screen
  - Follow pattern from `PlayerManagementPanel.tsx`
  - Add confirmation dialog
  - Generate CSV with proper escaping

## Refactoring [P2]

### Code Quality
- [ ] [@copilot] Remove console.log statements (47 found)
  - Files: See `/docs/code-quality/console-logs.json`
  - Replace with proper logging (use `server/_core/logger.ts`)

- [ ] [@copilot] Fix TypeScript `any` types (89 found)
  - Files: See `/docs/code-quality/any-types.json`
  - Add proper type definitions

- [ ] [@copilot] Add JSDoc comments to exported functions
  - Focus on: `server/db.ts`, `server/routers/*.ts`
  - Include `@param`, `@returns`, `@throws`

### Testing
- [ ] [@manus] Set up Vitest test infrastructure
  - Create test utilities
  - Add database mocking helpers
  - Document testing patterns in `/docs/testing-guide.md`

- [ ] [@copilot] Write unit tests for tRPC procedures
  - Follow pattern from `server/auth.logout.test.ts`
  - Target: 80% coverage
  - Files: All `server/routers/*.ts`

## Documentation [P2]

- [ ] [@manus] Create comprehensive README.md
  - Include setup instructions
  - Document all features
  - Add architecture diagram

- [ ] [@copilot] Add inline TODO comments for planned features
  - Format: `// TODO: [Feature] Description`
  - Link to MASTER-TODO.md items

- [ ] [@human] Update user-facing documentation
  - How to play guide
  - Host guide
  - FAQ

## DevOps [P3]

### GitHub Actions
- [ ] [@manus] Set up CI/CD pipeline
  - TypeScript checking
  - Linting
  - Testing
  - Build verification

- [ ] [@manus] Configure auto-merge for approved PRs
  - Require: All checks pass + 1 approval
  - No merge conflicts

### GitHub MCP Server
- [ ] [@manus] Configure MCP server for GitHub operations
  - Set up authentication
  - Configure skills and tools
  - Document usage patterns

## Completed ✅

- [x] [@manus] Database sync (60 images) - 2025-12-12
- [x] [@manus] Add batch_id to generated_cards schema - 2025-12-12
- [x] [@manus] Add game_id (MMDDYY-HHMM format) to game_history - 2025-12-12
```

### Workflow Example

**Scenario:** Need to add JSDoc comments to 50 exported functions

1. **@manus identifies task:**
   ```markdown
   - [ ] [@copilot] Add JSDoc comments to all exported functions in server/
     - Files: `server/db.ts`, `server/routers/*.ts`
     - Pattern: Include @param, @returns, @throws
     - Example: See `server/auth.logout.test.ts` for reference
   ```

2. **@copilot reads TODO and executes:**
   - Opens each file
   - Generates JSDoc for each exported function
   - Follows the specified pattern
   - Commits changes

3. **@human reviews:**
   - Checks JSDoc accuracy
   - Verifies completeness
   - Approves or requests changes

4. **@human marks complete:**
   ```markdown
   - [x] [@copilot] Add JSDoc comments to all exported functions in server/ - 2025-12-12
   ```

## File Structure

```
holiday-bingo/
├── MASTER-TODO.md                          # Central coordination file
├── .github/
│   ├── copilot-instructions.md             # GitHub Copilot context
│   ├── workflows/                          # GitHub Actions
│   │   ├── ci.yml
│   │   ├── auto-merge.yml
│   │   └── code-quality.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       ├── feature_request.md
│       └── documentation.md
├── .cursor/                                # Future: Cursor/Windsurf support
│   └── rules/
│       ├── project-structure.mdc
│       ├── react-patterns.mdc
│       ├── trpc-patterns.mdc
│       ├── database-patterns.mdc
│       ├── testing-patterns.mdc
│       └── ui-ux-guidelines.mdc
├── docs/                                   # Reference documentation
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── database-schema.md
│   │   └── api-design.md
│   ├── bugs/
│   │   └── gallery-loading-investigation.md
│   ├── code-quality/
│   │   ├── console-logs.json
│   │   └── any-types.json
│   ├── csv-format.md
│   └── testing-guide.md
├── mcp-config.json                         # MCP server configuration
└── ... (existing project files)
```

## MCP Server Configuration

### Purpose
- Reduce token usage by using GitHub API tools instead of verbose descriptions
- Automate GitHub operations (issues, PRs, reviews)
- Enable skills for common workflows

### Configuration File: `mcp-config.json`

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      },
      "skills": {
        "issue_management": {
          "enabled": true,
          "auto_label": true,
          "auto_assign": false
        },
        "pull_request_management": {
          "enabled": true,
          "auto_review": true,
          "auto_merge": false
        },
        "repository_operations": {
          "enabled": true,
          "read_only": false
        }
      },
      "tools": {
        "preferred": [
          "create_issue",
          "create_pull_request",
          "add_comment",
          "search_code",
          "get_file_contents",
          "push_files"
        ],
        "optimization": {
          "return_results_only": true,
          "minimize_context": true,
          "use_file_references": true
        }
      }
    }
  }
}
```

### Tool Usage Patterns

**❌ High Token Usage (Verbose Description):**
```
Create a GitHub issue with the following details:
Title: Fix gallery image loading bug
Body: The gallery panel is showing only 45 images instead of 60. The database query returns all 60 images correctly, but the UI component fails to render the last 15 images. They appear as placeholder icons instead.

Steps to reproduce:
1. Open the application
2. Navigate to the gallery panel
3. Scroll through the images
4. Notice that images #46-60 show as placeholders

Expected behavior: All 60 images should load and display correctly
Actual behavior: Only 45 images load, rest show placeholders

Environment:
- Browser: Chrome 120
- OS: macOS 14.1
- Node version: 22.13.0

Files involved:
- client/src/components/GalleryPanel.tsx (lines 150-200)
- shared/imageGallery.ts (lines 1-300)
- server/db.ts (galleryImages query)

Labels: bug, P0, ui
Assignee: @manus
```

**✅ Low Token Usage (MCP Tool):**
```typescript
await mcp.github.createIssue({
  title: "Fix gallery image loading bug",
  body: readFile("./docs/bugs/gallery-loading-bug.md"),
  labels: ["bug", "P0", "ui"],
  assignee: "manus"
});
```

**Token Savings:** ~400 tokens → ~50 tokens (88% reduction)

### Skill Configuration

**Skills** are pre-configured workflows that combine multiple tool calls:

1. **issue_management**
   - Auto-labels issues based on keywords
   - Links related issues
   - Adds to project boards

2. **pull_request_management**
   - Auto-reviews PRs for common issues
   - Checks for breaking changes
   - Verifies test coverage

3. **repository_operations**
   - Batch file operations
   - Search and replace across files
   - Generate changelogs

## Token Optimization Strategies

### 1. Use File References

**❌ Bad:**
```
The current database schema is:
[paste 500 lines of schema.ts]
```

**✅ Good:**
```
See database schema: `drizzle/schema.ts`
```

### 2. Use Structured Data

**❌ Bad:**
```
Found console.log statements in the following files:
- PlayScreen.tsx has 12 instances on lines 45, 67, 89, 102, 145, 167, 189, 201, 234, 256, 278, 290
- GalleryPanel.tsx has 8 instances on lines 23, 45, 67, 89, 101, 123, 145, 167
[continues for 47 files...]
```

**✅ Good:**
```json
{
  "console_logs": {
    "total": 47,
    "files": {
      "PlayScreen.tsx": {"count": 12, "lines": [45, 67, 89, 102, 145, 167, 189, 201, 234, 256, 278, 290]},
      "GalleryPanel.tsx": {"count": 8, "lines": [23, 45, 67, 89, 101, 123, 145, 167]}
    }
  }
}
```
Save to: `/docs/code-quality/console-logs.json`
Reference: "See console.log analysis in `/docs/code-quality/console-logs.json`"

### 3. Use MCP Tools for GitHub Operations

**❌ Bad:**
```
Create a pull request from branch feature/batch-ids to main with the following changes:
[describe 20 file changes in detail]
```

**✅ Good:**
```typescript
await mcp.github.createPullRequest({
  head: "feature/batch-ids",
  base: "main",
  title: "Add batch ID system for player management",
  body: readFile("./docs/prs/batch-ids-pr-description.md")
});
```

### 4. Use Inline TODOs with References

**❌ Bad:**
```
// TODO: Implement batch selector dropdown with search functionality and multi-select checkboxes following the pattern from GalleryPanel.tsx dropdown component
```

**✅ Good:**
```
// TODO: [Batch Selector] See MASTER-TODO.md #L45
```

## Agent Communication Protocols

### When @manus Assigns Task to @copilot

```markdown
- [ ] [@copilot] [Brief task description]
  - **Context:** Why this task is needed
  - **Files:** Specific files to modify
  - **Pattern:** Reference to existing code pattern to follow
  - **Example:** Link to similar implementation
  - **Acceptance Criteria:** How to verify completion
```

### When @copilot Completes Task

1. Commit changes with descriptive message
2. Reference TODO item in commit message: `Fixes MASTER-TODO.md #L45`
3. Leave comment in TODO if clarification needed
4. Do NOT mark task complete (only @human does this)

### When @human Reviews

1. Test the changes
2. Review code quality
3. If approved: Mark task complete with date
4. If changes needed: Add feedback as sub-item under task

## Conflict Prevention

### Before Starting Work

**All agents MUST:**
1. Read MASTER-TODO.md
2. Check if task is already assigned
3. Check if task is marked "IN PROGRESS"
4. If unassigned and relevant to agent's strengths, claim it:
   ```markdown
   - [ ] [@manus] Fix gallery loading - **IN PROGRESS** (started 2025-12-12 14:30)
   ```

### During Work

**All agents MUST:**
1. Update TODO with progress notes
2. Commit frequently with descriptive messages
3. If blocked, update TODO with blocker info

### After Completion

**All agents MUST:**
1. Remove "IN PROGRESS" marker
2. Add completion notes if relevant
3. Wait for @human review before marking complete

## Success Metrics

### Efficiency
- **Token Usage:** Reduce by 70%+ using MCP tools and file references
- **Task Completion Time:** 50%+ faster with parallel agent work
- **Conflicts:** < 5% of tasks have agent conflicts

### Quality
- **Code Coverage:** 80%+ test coverage
- **Type Safety:** Zero `any` types in production code
- **Documentation:** 100% of exported functions have JSDoc

### Collaboration
- **Clear Ownership:** Every TODO item has assigned agent
- **No Duplicates:** Zero duplicate work across agents
- **Human Oversight:** 100% of agent work reviewed by human

## Next Steps

1. Create `.github/copilot-instructions.md` with full project context
2. Create `MASTER-TODO.md` with current tasks and priorities
3. Set up `mcp-config.json` for GitHub operations
4. Create reference documents in `/docs`
5. Test multi-agent workflow with sample tasks
6. Iterate and refine based on results
