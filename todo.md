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


## UI ENHANCEMENT (Dec 8, 2025)

### Image Number Overlays ✅
- [x] Add image number overlay to played images carousel (bottom-right corner)
- [x] Add image number overlay to main play area (bottom-right corner)
- [x] Style overlays with semi-transparent background for visibility
- [x] Ensure numbers reflect call order (1, 2, 3, etc.)


## BINGO VERIFICATION SYSTEM (Dec 8, 2025) ✅

### Card Generation Module ✅
- [x] Create shared/cardGenerator.ts module
- [x] Implement 5x5 grid generator with FREE center space
- [x] Implement Card ID generator (5-character alphanumeric, uppercase)
- [x] Implement random image selection without duplicates
- [x] Create card-to-image mapping structure
- [x] Add validation for minimum 25 images required

### Pattern Detection Algorithms ✅
- [x] Create shared/patternDetector.ts module
- [x] Implement LINE pattern detection (horizontal + vertical)
- [x] Implement DIAGONAL pattern detection (both diagonals)
- [x] Implement FOUR_CORNERS pattern detection
- [x] Implement X_PATTERN detection (both diagonals)
- [x] Implement BLACKOUT pattern detection (all 25 spaces)
- [x] Create pattern matching function (card + played images + pattern type)

### Database Schema ✅
- [x] Create generated_cards table (card_id, game_id, image_ids JSON, created_at)
- [x] Update schema with host_game_state table for tracking
- [x] Push database migrations
- [x] Add game state tracking (current_image_index, played_images)

### tRPC Procedures ✅
- [x] Create bingoRouter.ts with all procedures
- [x] Implement bingo.generateCards procedure (batch generation)
- [x] Implement bingo.getCard procedure (retrieve by card_id)
- [x] Implement bingo.verifyBingo procedure (card_id + pattern validation)
- [x] Add bingo router to main appRouter

### UI Integration ✅
- [x] Update PlayScreen to call tRPC verifyBingo mutation
- [x] Display validation results via toast notifications
- [x] Show error messages for invalid Card IDs
- [x] Add visual feedback for winning vs non-winning verification
- [x] Handle all error cases gracefully

### Testing ✅
- [x] Create test-bingo-setup.ts script
- [x] Generate 5 test cards with unique IDs (MNH32, YDBRP, ZP8DY, PWTED, 7E5CV)
- [x] Create test game state with 10 played images
- [ ] Fix game ID tracking in UI (currently hardcoded to 1)
- [ ] Test full verification with actual game state integration
- [ ] Write vitest unit tests for pattern detection algorithms


## PDF CARD GENERATOR (Dec 8, 2025) - BACKEND COMPLETE ✅

### PDF Library Selection ✅
- [x] Evaluate Puppeteer (headless Chrome, high quality, slower) - FAILED in sandbox
- [x] Evaluate jsPDF (pure JS, faster, limited styling) - WORKS PERFECTLY
- [x] Select library based on requirements (jsPDF chosen)
- [x] Install jsPDF and dependencies

### PDF Template Design ✅
- [x] Create jsPDF template for bingo card layout
- [x] Design 5x5 grid with proper spacing (30mm cells)
- [x] Add Card ID display (top center, large, bold, with background)
- [x] Add FREE space styling (center cell, yellow background)
- [x] Add image labels below each cell (6pt font)
- [x] Design for A4 size (210mm x 297mm)
- [x] Add margins and padding for printability
- [x] Style for black & white printer compatibility

### Backend Implementation ✅
- [x] Create server/pdfGenerator.ts module
- [x] Implement generateCardPDF function
- [x] Use text labels instead of images (jsPDF limitation)
- [x] Handle image loading and error cases
- [x] Implement batch generation (multiple cards per PDF)
- [x] Tested: 2 cards = 23KB, works perfectly
- [x] File size already optimized by jsPDF

### tRPC Integration ✅
- [x] Create pdfRouter.ts with all procedures
- [x] Implement generateMultipleCards procedure
- [x] Accept parameters (count, gamesPerPlayer)
- [x] Generate cards using existing cardGenerator
- [x] Create PDFs for all cards
- [x] Return base64-encoded PDF data
- [x] Handle errors gracefully

### UI Integration ⚠️
- [x] Update GameSetupPanel to call PDF generation
- [x] Show progress indicator during generation
- [x] Provide download via blob creation
- [x] Display generation summary (X cards, Y pages)
- [x] Handle large batch warnings (100+ cards)
- [ ] **BUG**: Downloaded PDFs are 0 bytes (base64 conversion issue)
- [ ] Backend generates perfect PDFs (tested 23KB for 2 cards)
- [ ] Frontend blob creation needs debugging

### Testing ✅
- [x] Test single card generation (works - 12KB)
- [x] Test batch generation (works - 23KB for 2 cards)
- [ ] Test large batch (100+ cards)
- [x] Verify Card IDs are generated correctly
- [x] Verify labels display correctly (images as text)
- [ ] Test print quality on actual printer
- [x] Verify FREE space is clearly marked (yellow background)


## PRIORITY: FUNCTIONAL PDF CARD GENERATION (Dec 8, 2025)

### Frontend Download Fix ✅
- [x] Debug base64-to-blob conversion in GameSetupPanel
- [x] Test blob creation with actual PDF data
- [x] Verify download triggers correctly
- [x] Confirm downloaded file is not 0 bytes (126KB)
- [x] Test with different player counts (12 cards)

### Image Embedding in PDF ⚠️
- [x] Research jsPDF image embedding (addImage method)
- [x] Fetch gallery images from database
- [x] Implement image tiling in 5x5 grid cells
- [x] Resize images to fit cell dimensions (30mm x 22mm)
- [x] Ensure FREE space remains text-only
- [ ] Images showing as labels only (jsPDF can't load URLs)
- [ ] Need to convert URLs to base64 or use local files

### Database Integration ✅
- [x] Ensure Card IDs are saved to generated_cards table
- [x] Link cards to game_id (create game session on generation)
- [x] Store image_ids array for each card
- [x] Add created_at timestamp
- [x] Verify cards can be retrieved by Card ID
- [x] Test card lookup for BINGO verification

### End-to-End Testing ✅
- [x] Generate 12-card PDF and verify download (126KB)
- [x] Open PDF and verify layout (labels visible, images need fix)
- [x] Verify Card IDs are unique and readable (MYJHF, SG7MW, etc.)
- [x] Verify FREE space is clearly marked (yellow background)
- [x] Test BINGO verification with generated Card ID
- [x] Verify pattern detection works with card images

## FUTURE PANELS (Lower Priority)

### Player Roster Panel
- [ ] Create PlayerRosterPanel component (drawer-style)
- [ ] Display list of active players with Card IDs
- [ ] Show player join timestamps
- [ ] Add search/filter functionality
- [ ] Match existing sidebar tool look/feel
- [ ] Add player count summary

### Score Tracking Panel
- [ ] Create ScoreTrackingPanel component (drawer-style)
- [ ] Display leaderboard by round
- [ ] Show win history for each player
- [ ] Track total wins across all rounds
- [ ] Add round-by-round breakdown
- [ ] Match existing sidebar tool look/feel
- [ ] Export scores to CSV option


## DAY 2 FEATURES (Configurable via Settings)

### AI Voice Announcer
- [ ] Add voice settings to SettingsPanel (provider, voice, sass level)
- [ ] Integrate ElevenLabs/OpenAI TTS API
- [ ] Create announcement templates with corporate-appropriate sass
- [ ] Add voice toggle in PlayScreen
- [ ] Announce image name when called
- [ ] Announce BINGO verification results
- [ ] Add volume control

### Animations & Polish
- [ ] Add pause animation (dim screen, show "PAUSED" overlay)
- [ ] Add BINGO! celebration animation (confetti, sound effect)
- [ ] Add smooth transitions for image changes
- [ ] Add card flip animation for played images
- [ ] Add winner announcement animation
- [ ] Add round transition animations

### Additional Settings
- [ ] Auto-advance timer (optional)
- [ ] Image display duration
- [ ] Animation speed controls
- [ ] Theme customization (colors)
- [ ] Sound effects toggle


## GALLERY EXPANSION (Dec 10, 2025)

- [ ] Generate 10 new corporate-safe holiday images
- [ ] Save images to client/public/images/gallery/
- [ ] Add images to database via seed script
- [ ] Update IMAGE_GALLERY constant
- [ ] Test new images in gameplay
- [ ] Test new images in PDF generation


## PLAYER MANAGEMENT SYSTEM (Dec 11, 2025)

### Database Schema Updates
- [x] Create players table (uuid, name, created_at)
- [x] Create player_cards table (player_uuid, card_id, game_id, is_played)
- [x] Update game_history table to include player_uuid references
- [x] Add player_scores table (player_uuid, game_id, wins, patterns_won)
- [x] Push database migrations
- [x] Add batch_id to generated_cards table
- [x] Add game_id (MMDDYY-HHMM format) to game_history table

### Player Management Panel (Gallery-Style Drawer)
- [x] Create PlayerManagementPanel component
- [x] Implement grid display of players with card counts
- [x] Add single-select mode (click to view player details)
- [x] Add multi-select mode (toggle button + checkboxes)
- [x] Add "Select All" functionality
- [x] Display player UUID, name, and card count
- [ ] Auto-remove played cards from active roster (backend integration pending)
- [x] Add delete player functionality
- [x] Add player creation form (name input)

### CSV Import/Export Functionality
- [x] Add "Import CSV" button to player panel
- [x] Implement CSV file upload handler
- [x] Parse CSV format: player_uuid,name,card_id1|card_id2|...
- [x] Validate CSV data before import
- [x] Show import summary dialog (X players, Y cards)
- [x] Add "Export CSV" button (activates multi-select)
- [x] Generate CSV from selected players
- [x] Show export confirmation dialog with player count
- [x] Download CSV file with proper formatting
- [x] Handle batch player naming from CSV

### Previous Games Archive Panel
- [x] Create PreviousGamesPanel component (drawer-style)
- [x] Display list of completed games with dates
- [x] Show game summary (rounds, patterns, winners)
- [x] Implement expandable game details view
- [x] Display player logs per game (name, score, patterns won)
- [x] Display images played per game in chronological order
- [ ] Add restore game functionality (view-only mode)
- [x] Add delete archived game functionality
- [ ] Implement pagination for large game history

### Backend tRPC Procedures
- [x] Implement players.create procedure (generate UUID, store name)
- [x] Implement players.getAll procedure
- [x] Implement players.update procedure (rename)
- [x] Implement players.delete procedure
- [x] Implement players.importCSV procedure (batch create)
- [x] Implement players.exportCSV procedure (generate CSV data)
- [x] Implement playerCards.linkToPlayer procedure (assign cards to player)
- [x] Implement playerCards.markAsPlayed procedure
- [x] Implement playerCards.getByPlayer procedure
- [x] Implement gameHistory.archive procedure (store completed game)
- [x] Implement gameHistory.getAll procedure
- [x] Implement gameHistory.getById procedure (with full details)
- [x] Implement gameHistory.delete procedure
- [ ] Implement scores.updateOnBingo procedure (real-time score tracking)
- [ ] Implement scores.getLeaderboard procedure (current game)
- [ ] Implement scores.getByGame procedure (historical scores)

### Auto-Linking PDF Generation to Players
- [x] Update PDF generation flow to create player records
- [x] Generate Player UUID for each batch of cards
- [x] Link all Card IDs in batch to single Player UUID
- [x] Store player-card associations in database
- [ ] Update GameSetupPanel to show player creation option (UI integration pending)
- [ ] Add "Assign to Player" field in PDF generation form (UI integration pending)
- [ ] Auto-populate player roster after PDF generation (UI integration pending)
- [ ] Show confirmation: "X cards assigned to Player [UUID]" (UI integration pending)

### Real-Time Score Updates
- [ ] Update bingo.verifyBingo to call scores.updateOnBingo
- [ ] Increment player win count on successful verification
- [ ] Update leaderboard in real-time via tRPC subscription
- [ ] Show toast notification with player name on BINGO
- [ ] Update ScoreTrackingPanel to use live data
- [ ] Add winner announcement with player name (not just Card ID)

### Integration & Testing
- [ ] Connect PlayerManagementPanel to backend procedures
- [ ] Connect PreviousGamesPanel to backend procedures
- [ ] Test CSV import with sample data (10 players, 50 cards)
- [ ] Test CSV export with multi-select
- [ ] Test auto-linking during PDF generation
- [ ] Test player card removal after play
- [ ] Test game archiving at end of game
- [ ] Test score updates during live gameplay
- [ ] Test leaderboard with real player names
- [ ] Verify Player UUID tracking throughout system


## CRITICAL BUGS & NEW FEATURES (Dec 11, 2025 - User Feedback)

### Critical Bugs
- [x] Fix gallery image loading (only 9/60 images showing, rest are placeholders)
- [x] Update database to reflect all 60 recovered images
- [x] Fix "40 images remaining" message (should be 60)
- [x] Update Settings panel to show correct image count

### Leaderboard Redesign
- [ ] Change leaderboard colors from red/pink to different color scheme
- [ ] Change "Card: ABC12" to "Player #: 1" (or player name if entered)
- [ ] Link player roster to show player numbers instead of card IDs

### End-of-Round Winner Display
- [ ] Create winner podium component with gold/silver/bronze medals
- [ ] Display top 3 players in circular avatars with medals
- [ ] Create end-game summary screen with all winners carousel
- [ ] Add game statistics summary

### Batch ID System
- [ ] Add batch_id UUID to generated_cards table
- [ ] Assign batch_id to all cards generated in single PDF operation
- [ ] Create batch selection dropdown in player roster
- [ ] Add search bar for batch selection
- [ ] Implement multi-select for batches
- [ ] Auto-populate last generated batch in player roster
- [ ] Add "Add Batch" and "Cancel" buttons to batch selector

### Player Roster Overhaul
- [ ] Change from Card ID to Player # system
- [ ] Add Name field for each player (optional, displayed if entered)
- [ ] Link multiple cards to single player via batch_id
- [ ] Display player count instead of card count

### CSV Import/Export Enhancement
- [ ] Add batch/player selection screen for export
- [ ] Add confirmation popup for CSV import
- [ ] Show import summary (X players, Y cards, Z batches)
- [ ] Update CSV format to include batch_id

### Game ID System
- [ ] Create game_id format: MMDDYY-HHMM (e.g., 121125-1430)
- [ ] Assign game_id on game start
- [ ] Display game_id on leaderboard header
- [ ] Make game_id clickable to open previous games panel
- [ ] Add game_id to game history records

### Host Name Editing
- [ ] Make "Welcome, Host!" clickable to edit host name
- [ ] Add inline edit or dialog for host name change
- [ ] Persist host name in game state/settings


## MULTI-AGENT ORCHESTRATION SYSTEM
- [ ] Research GitHub Copilot instructions best practices thoroughly
- [ ] Research GitHub MCP server configuration and tool usage optimization
- [ ] Study ruleset-recipes repository for RULES file patterns
- [ ] Design multi-agent orchestration architecture
- [ ] Create copilot-instructions.md with comprehensive rules
- [ ] Create RULES files for different project areas (frontend, backend, database, testing)
- [ ] Configure GitHub MCP server with optimal tool/skill usage
- [ ] Create Master TODO coordination system for multi-agent collaboration
- [ ] Document setup guide for GitHub Copilot + MCP server integration
- [ ] Test multi-agent workflow and validate non-interference
