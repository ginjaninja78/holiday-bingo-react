# Holiday Bingo - Master TODO

## Priority Legend
- 🔴 **P0 - Critical** - Must have for demo/launch
- 🟠 **P1 - High** - Important for full functionality
- 🟡 **P2 - Medium** - Nice to have, improves UX
- 🟢 **P3 - Low** - Future enhancement

---

## 🔴 P0 - Critical

### Scoring System Integration
**Status:** Not Started  
**Effort:** 5-6 hours  
**Description:** Connect Card UUID tracking to the scoring/game management system so hosts can verify bingo winners.

**📄 Detailed Implementation Guide:** `docs/TODO-SCORING-SYSTEM.md`

**Summary of Phases:**
1. Link generated cards to game sessions
2. Create bingo verification logic (all patterns)
3. Build host UI for winner verification
4. Unit tests for verification

**Key Files:**
- `server/bingoVerification.ts` (NEW)
- `server/routers.ts` - Add verification procedures
- `client/src/components/WinnerVerificationPanel.tsx` (NEW)

---

## 🟠 P1 - High

### PDF Interactive Checkboxes
**Status:** TODO Created  
**Effort:** 6-9 hours  
**Description:** Replace stamp-based marking with clickable form checkboxes in PDF cards.

See detailed implementation guide: `docs/TODO-PDF-CHECKBOXES.md`

- [ ] Phase 1: Research & Proof of Concept
- [ ] Phase 2: Design Checkbox Appearance
- [ ] Phase 3: Integrate into pdfGenerator.ts
- [ ] Phase 4: Add Reset Functionality
- [ ] Phase 5: Testing & Validation
- [ ] Phase 6: Update Player Instructions

---

## 🟡 P2 - Medium

### Editable Host Name
**Status:** Not Started  
**Effort:** 1 hour  
**Description:** Make "Welcome, Host!" clickable/editable so hosts can personalize their display name.

**📄 Detailed Implementation Guide:** `docs/TODO-EDITABLE-HOST-NAME.md`

**Summary:**
1. Add state for hostName in PlayScreen.tsx
2. Replace static text with clickable/editable component
3. Persist to localStorage
4. Enter to save, Escape to cancel

**Key File:**
- `client/src/pages/PlayScreen.tsx` (line ~249)

---

## 🟢 P3 - Low

### Multi-Page PDF Generation
**Status:** Disabled  
**Effort:** 2-3 hours  
**Description:** Allow generating multiple cards per player (e.g., 3 cards each for 10 players = 30 pages).

- [ ] Re-enable `gamesPerPlayer` parameter in PDF generation
- [ ] Update UI to allow selecting cards per player
- [ ] Ensure unique Card IDs for each card
- [ ] Test PDF generation with large numbers (50+ pages)
- [ ] Consider ZIP download for very large batches

**Currently:** Each player gets exactly 1 card. This is fine for most use cases.

---

## Completed ✅

- [x] PDF card generation with images
- [x] John Hancock logo integration
- [x] FREE SPACE image integration
- [x] Fixed image indexing bug (blank square issue)
- [x] Production environment support for PDF generator
- [x] Gallery images database sync (60 images)
- [x] GitHub repository setup and sync
- [x] Development branch workflow (`card-gen-enhancements`)

---

## Notes

### Branch Strategy
- `main` - Production-ready code only
- `card-gen-enhancements` - Active development branch

### Workflow
1. Develop features on `card-gen-enhancements`
2. Test thoroughly in preview
3. Commit with detailed messages
4. Once confirmed working, merge to `main`
5. Save Manus checkpoint
6. Publish to production

### Quick Wins (Can be done in < 1 hour)
1. Editable Host Name (P2)
2. Add more gallery images if needed
3. Customize PDF styling/colors

---

*Last Updated: December 16, 2024*
