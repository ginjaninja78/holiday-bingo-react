# Holiday Bingo - Master TODO

**Last Updated:** December 11, 2025  
**Sprint:** Week of Dec 11-18, 2025

---

## 🎯 Current Sprint Goals

1. Fix critical bugs (gallery images, PDF generation, UI constraints)
2. Complete GitHub Copilot + MCP server integration
3. Implement automated CI/CD workflows
4. Begin comprehensive testing and quality improvements

---

## 🚨 CRITICAL BUGS - FIX NOW

### Gallery & Images
- [ ] [@manus] Fix missing gallery images (database has 45, filesystem has 60)
  - Status: Database sync script created, needs execution
  - Files: `scripts/sync-gallery-images.mjs`, database `gallery_images` table
  - Priority: P0 - Blocks PDF generation

- [ ] [@manus] Fix image file paths in PDF generation
  - Issue: PDF generator looking for `/gallery/` instead of `/images/gallery/`
  - Files: `server/pdfGenerator.ts`, `server/pdfRouter.ts`
  - Dependencies: Gallery images fix must be complete first
  - Priority: P0 - Blocks card generation

### PDF Generation
- [ ] [@copilot] Implement ZIP file creation for multiple players
  - Current: Generates single PDF with multiple cards
  - Expected: Generate separate PDF per player, zip them together
  - Files: `server/pdfRouter.ts`, `server/pdfGenerator.ts`
  - Package: Install `archiver` for ZIP creation
  - Pattern: See `docs/GITHUB-MCP-SETUP.md` for MCP tool usage
  - Priority: P0 - Core feature broken

- [ ] [@copilot] Add Player ID to PDF cards
  - Current: Cards only show Card ID (ABC12)
  - Expected: Show both Player UUID and Card ID
  - Files: `server/pdfGenerator.ts` (card layout section)
  - Design: Player ID in header, Card ID in footer
  - Priority: P1 - Important for player tracking

### UI/UX Fixes
- [ ] [@copilot] Make host name editable
  - Current: "Welcome, Host!" is static text
  - Expected: Clickable to edit, opens inline edit or dialog
  - Files: `client/src/pages/Home.tsx` or `client/src/pages/HostDashboard.tsx`
  - Pattern: Use shadcn/ui Dialog component for edit modal
  - Storage: Save to localStorage or add to game state
  - Priority: P1 - User-requested feature

- [ ] [@manus] Fix UI constraints in desktop view
  - Issue: Images not constrained to 16:9 aspect ratio in main play view
  - Issue: Buttons overflowing on mobile (low priority, desktop first)
  - Files: `client/src/pages/PlayScreen.tsx`
  - Pattern: Use `aspect-[16/9]` Tailwind class, `object-cover` for images
  - Priority: P1 - Affects user experience

---

## 🤖 GITHUB COPILOT INTEGRATION

### Setup Tasks
- [x] Create `.github/copilot-instructions.md` (comprehensive project context)
- [x] Create `.github/mcp-config.json` (MCP server configuration)
- [x] Create `docs/GITHUB-MCP-SETUP.md` (setup guide)
- [ ] [@human] Generate GitHub Personal Access Token
  - Scopes: `repo`, `workflow`, `write:packages`
  - Set as `GITHUB_TOKEN` environment variable
  - See: `docs/GITHUB-MCP-SETUP.md` for instructions

- [ ] [@human] Test GitHub Copilot MCP integration
  - Open VS Code with GitHub Copilot
  - Verify Copilot reads `.github/copilot-instructions.md`
  - Test MCP tool: "Use MCP to search for tRPC routers"
  - Verify tool-based responses instead of code generation

### Delegation Workflow
1. **Manus AI** adds task to this file with `[@copilot]` tag
2. **Human** opens VS Code, GitHub Copilot sees task in MASTER-TODO.md
3. **GitHub Copilot** uses MCP tools to complete task (create branch, implement, create PR)
4. **GitHub Actions** runs CI/CD checks automatically
5. **Human** reviews PR and approves
6. **GitHub Actions** auto-merges after approval
7. **Human** marks task `[x]` complete in MASTER-TODO.md

---

## 🔄 GITHUB ACTIONS CI/CD

### Workflows Created
- [x] `.github/workflows/ci.yml` - CI/CD pipeline (test, build, type check)
- [x] `.github/workflows/label-issues.yml` - Auto-label issues by keywords
- [x] `.github/workflows/pr-review.yml` - Automated PR review checks
- [x] `.github/workflows/auto-merge.yml` - Auto-merge approved PRs

### Setup Required
- [ ] [@human] Push workflows to GitHub repository
  - Commit message: "feat: Add GitHub Actions CI/CD workflows"
  - Branch: `main` or create `feature/github-actions`

- [ ] [@human] Configure GitHub repository settings
  - Enable GitHub Actions
  - Set branch protection rules for `main`:
    - Require PR reviews (1 approval)
    - Require status checks to pass
    - Require branches to be up to date
  - Enable auto-merge in repository settings

- [ ] [@human] Add repository secrets
  - `DATABASE_URL` - MySQL/TiDB connection string
  - `JWT_SECRET` - Session cookie signing secret
  - See: Settings → Secrets and variables → Actions

### Testing
- [ ] [@human] Test CI/CD pipeline
  - Create test PR
  - Verify workflows run automatically
  - Check for code quality warnings
  - Approve PR and verify auto-merge

---

## 📝 NOTES

### Agent Coordination Rules
1. **Only humans mark tasks complete** - Change `[ ]` to `[x]`
2. **Agents update status** - Add comments like "Status: In progress"
3. **Reference TODO in commits** - "Fixes MASTER-TODO.md #L45"
4. **Check TODO before starting work** - Avoid conflicts
5. **Update TODO during long tasks** - Keep status current

### Task Assignment Tags
- `[@manus]` - Complex features, architecture, debugging (Manus AI)
- `[@copilot]` - Coding tasks, refactoring, documentation (GitHub Copilot)
- `[@human]` - Review, approval, configuration (Human developer)

### Priority Levels
- **P0** - Critical, blocks other work
- **P1** - Important, user-facing
- **P2** - Nice to have, quality improvements
- **P3** - Future enhancements, backlog

---

**Next Review:** December 18, 2025  
**Questions?** Check `.github/copilot-instructions.md` or `docs/` folder
