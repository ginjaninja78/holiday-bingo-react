# Holiday Image Bingo - Project TODO

## HOST-ONLY CONVERSION (IN PROGRESS)

- [x] Copy 40 generated images to web project gallery
- [x] Update database schema for host-only features
- [x] Build settings panel (drawer) with Unsplash config placeholder
- [x] Build game setup panel (drawer) with rounds/patterns/PDF generator
- [x] Build play screen (80% image display + 20% played shelf)
- [x] Implement adjustable icon size for played shelf
- [x] Implement pause/resume functionality
- [x] Add BINGO! button with card UUID input dialog
- [ ] Implement review functionality for played images (pause required)
- [ ] Implement bingo verification against patterns (backend logic)
- [ ] Add pattern tracking mechanism (TODO comment in code for now)
- [ ] Fix played images shelf population (currently showing 0)
- [ ] Remove all player-specific routes and components
- [ ] Remove player join functionality
- [ ] Implement backend tRPC procedures for game state
- [ ] Connect Settings panel to backend (save Unsplash config)
- [ ] Connect Game Setup panel to backend (save game config)
- [ ] Implement PDF generation backend
- [ ] Test full host workflow end-to-end
- [ ] Polish UI with smooth animations
- [ ] Create final checkpoint

## BACKEND INTEGRATION NEEDED

### tRPC Procedures to Create
- [ ] `game.saveConfig` - Save game configuration (rounds, patterns, players)
- [ ] `game.start` - Initialize game session
- [ ] `game.nextImage` - Get next random image and track it
- [ ] `game.pause` - Pause game
- [ ] `game.resume` - Resume game
- [ ] `game.verifyBingo` - Verify card ID against patterns and played images
- [ ] `settings.saveUnsplash` - Save Unsplash API key and tags
- [ ] `gallery.refresh` - Fetch new images from Unsplash
- [ ] `pdf.generate` - Generate PDF cards

### Database Schema Updates Needed
- [ ] Game sessions table (rounds, patterns, status)
- [ ] Played images tracking table
- [ ] Card configurations table (card ID → image mappings)
- [ ] Unsplash settings table

## COMPLETED PHASES

### Phase 1: Project Setup & Planning
- [x] Initialize web project with full-stack capabilities
- [x] Create project todo list

### Phase 2: Asset Generation
- [x] Generate 50 curated winter/holiday corporate-safe images
- [x] Organize images in static assets folder
- [x] Create image metadata catalog

### Phase 3: Database Schema & Game Engine
- [x] Design database schema for games, players, cards, and sessions
- [x] Implement pure TypeScript game engine modules
- [x] Create card generation logic (5x5 grid with FREE center)
- [x] Implement bingo detection algorithms (lines, diagonals, custom patterns)
- [x] Build pattern designer data structure (JSON format)

### Phase 4: Backend API & Real-time
- [x] Set up WebSocket infrastructure for real-time gameplay
- [x] Create host authentication endpoints (QR code + backup login)
- [x] Implement player join flow (UUID assignment)
- [x] Build game state management (server-authoritative)
- [x] Create anti-cheat validation system
- [x] Implement AI voice integration module (ElevenLabs/Hume/OpenAI)
- [x] Build voice announcement system (host-only)
- [x] Create tRPC procedures for all game operations

### Phase 5: Player & Host UI
- [x] Design and implement player bingo card interface
- [x] Create tile marking interaction with animations
- [x] Build called images strip display
- [x] Implement round status display for players
- [x] Design host admin panel with collapsible drawer
- [x] Create host controls (Start/End Round, Call Image, Reset, New Game)
- [x] Build scoreboard with player stats
- [x] Implement pattern designer modal
- [x] Create bingo verification panel for host
- [x] Add AI voice toggle controls (host-only)

### Phase 6: Host-Only UI Conversion
- [x] Remove player routes from App.tsx
- [x] Simplify Home page to show only Host panel
- [x] Create SettingsPanel component (drawer-style)
  - [x] Unsplash API key input
  - [x] Search tags configuration
  - [x] Gallery status display
  - [x] Refresh gallery button
- [x] Create GameSetupPanel component (drawer-style)
  - [x] Total rounds configuration
  - [x] Wins per round configuration
  - [x] Visual pattern selector with icons
  - [x] Multi-select pattern support
  - [x] PDF generation inputs (players, games per player)
  - [x] Output summary display
  - [x] Start Game button
- [x] Create PlayScreen component
  - [x] Welcome screen before game starts
  - [x] 80/20 layout (main image / played shelf)
  - [x] Played images shelf with icon size slider
  - [x] Main image display area
  - [x] Pause/Resume button
  - [x] Next Image button
  - [x] BINGO! button with gradient styling
  - [x] Round tracking display
- [x] Create BINGO Verification Dialog
  - [x] Card ID input field (5-char, uppercase, monospace)
  - [x] Pattern verification placeholder section
  - [x] Verify/Cancel buttons
  - [x] Helper text for Card ID location

### Phase 7: Security & Anti-Cheat
- [x] Implement HTTPS enforcement (handled by Manus platform)
- [x] Configure secure cookies (HttpOnly, Secure, SameSite=Strict - handled by framework)
- [x] Build server-side tile validation
- [x] Implement QR code authentication system
- [x] Create backup admin login
- [x] Ensure no client-side AI exposure
- [x] Remove all analytics and tracking

### Phase 8: Testing & Documentation
- [x] Write vitest tests for game engine logic
- [x] Test authentication flows (QR + backup)
- [x] Test real-time gameplay with multiple players
- [x] Verify anti-cheat system
- [x] Test AI voice integration
- [x] Create comprehensive README with architecture
- [x] Document environment variables
- [x] Write deployment instructions
- [x] Create nested README files for each module
- [x] Build automation agent instruction file

### Phase 9: Initial Delivery
- [x] Verify all features are implemented
- [x] Create production checkpoint
- [x] Deliver website to user

## WINDOWS NATIVE APPLICATION (PENDING)

This web version serves as a visual reference for the Windows native Wails application.

### Wails Integration Tasks
- [ ] Clone holiday-bin_go repository
- [ ] Set up Wails project structure
- [ ] Port React UI components to Wails frontend
- [ ] Integrate Go backend modules from Claude Code
- [ ] Set up local SQLite database
- [ ] Implement native Windows controls
- [ ] Build and test .exe
- [ ] Set up GitHub Actions for automated builds
- [ ] Implement error reporting → GitHub issues

### Go Backend Modules (Claude Code)
- [ ] Unsplash API client
- [ ] Gallery management
- [ ] PDF generation with compression
- [ ] Card ID generator
- [ ] Game engine
- [ ] Pattern verification

## BLOCKERS

1. **Played Images Not Populating**: State management issue - images not being added to played array
2. **Backend Integration**: No tRPC procedures yet for game state management
3. **Pattern Tracking**: Need to design card-to-image mapping system
4. **Unsplash API Key**: Not provided by user yet
5. **Claude Code Modules**: User needs to start Claude Code with orchestration prompt
6. **Repository Not Cloned**: User needs to clone holiday-bin_go repo

## NEXT IMMEDIATE STEPS

1. Fix played images shelf population bug
2. Implement tRPC procedures for game state management
3. Create database schema for game sessions and tracking
4. Implement pattern verification backend logic
5. Test full game flow with backend integration
6. Provide user with Claude Code orchestration prompt
7. Begin Windows native Wails integration after web version is complete


## NEW FEATURES COMPLETED (2025-12-08)

### Gallery Management Drawer ✅
- [x] Create GalleryPanel component (drawer-style)
- [x] Display all images in grid layout
- [x] Implement single-select mode (click to select)
- [x] Implement multi-select mode (toggle button + checkboxes)
- [x] Add delete functionality for selected images
- [x] Create "Recently Deleted" section with tab navigation
- [x] Implement 30-day timer display on deleted images
- [x] Add "Restore" button for recently deleted images
- [x] Add "Delete Now" button for permanent deletion
- [x] Add multi-select in Recently Deleted section
- [x] Show deletion timestamp and days remaining badge
- [x] Add "Select All" functionality
- [x] Add selected count display
- [x] Add opacity styling for deleted images

### Enhanced Review Mode ✅
- [x] Make played images shelf clickable
- [x] When clicked, display selected image in main area
- [x] Add "Reviewing" indicator in header
- [x] Store last played image reference (lastPlayedIndex)
- [x] Add "Back to Current" button during review mode
- [x] Resume button returns to last played image (not reviewed image)
- [x] Disable "Next Image" and "End Round" during review mode
- [x] Add visual feedback for clickable played images

### End Round Flow ✅
- [x] Add "End Round" button to play screen controls
- [x] Create confirmation dialog for ending round
- [x] After confirmation, show "Round Complete" dialog
- [x] "End Game" option - return to welcome screen
- [x] "New Round" option - reset game state, increment round
- [x] Preserve game configuration for new round
- [x] Clear played images for new round
- [x] Update round counter display
- [x] Add proper dialog styling and button hierarchy


## NEW REQUIREMENTS (2025-12-08 - Full Implementation)

### Complete Package Export
- [ ] Create downloadable ZIP with all UI components
- [ ] Include all 40 sample images
- [ ] Include card generation templates
- [ ] Include game logic modules
- [ ] Add README for local testing

### Backend Implementation - Database Schema
- [ ] Create game_sessions table (id, rounds, wins_per_round, current_round, status, created_at)
- [ ] Create game_patterns table (game_id, round, pattern_type)
- [ ] Create played_images table (game_id, image_id, played_at, order_index)
- [ ] Create gallery_images table (id, url, label, source, deleted_at)
- [ ] Create game_config table (unsplash_key, search_tags)
- [ ] Run database migrations

### Backend Implementation - tRPC Procedures
- [ ] Implement game.saveConfig procedure
- [ ] Implement game.start procedure
- [ ] Implement game.nextImage procedure (with state tracking)
- [ ] Implement game.pause procedure
- [ ] Implement game.resume procedure
- [ ] Implement game.endRound procedure
- [ ] Implement game.newRound procedure
- [ ] Implement game.verifyBingo procedure
- [ ] Implement settings.saveUnsplash procedure
- [ ] Implement gallery.getAll procedure
- [ ] Implement gallery.delete procedure (soft delete)
- [ ] Implement gallery.restore procedure
- [ ] Implement gallery.permanentDelete procedure
- [ ] Implement gallery.refresh procedure (Unsplash API)

### Bug Fixes
- [ ] Fix played images shelf population (connect to backend state)
- [ ] Fix image display after Next Image click
- [ ] Ensure review mode works with real played images

### Card Generation Logic
- [ ] Implement 5x5 grid generator with FREE center
- [ ] Implement random image selection (no duplicates per card)
- [ ] Implement Card ID generator (5-char alphanumeric)
- [ ] Create card-to-image mapping storage

### Pattern Verification Logic
- [ ] Implement line detection (horizontal/vertical)
- [ ] Implement diagonal detection
- [ ] Implement four corners detection
- [ ] Implement X pattern detection
- [ ] Implement blackout detection
- [ ] Create verification algorithm (card ID + played images + pattern)

### PDF Generation
- [ ] Research PDF library options (pdfkit, jsPDF, or puppeteer)
- [ ] Create PDF template design
- [ ] Implement multi-page generation
- [ ] Add Card ID to each card
- [ ] Implement batch generation endpoint
