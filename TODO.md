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
**Effort:** 4-6 hours  
**Description:** Connect Card UUID tracking to the scoring/game management system so hosts can track which cards have won.

- [ ] Verify Card ID is properly stored in `generated_cards` table when PDF is created
- [ ] Create game session management (host creates game, gets game ID)
- [ ] Link generated cards to active game session
- [ ] Build host dashboard to view all cards in current game
- [ ] Implement "Call Image" feature - host selects image that was called
- [ ] Track called images per game session
- [ ] Calculate potential winners (cards with bingo based on called images)
- [ ] Add "Verify Winner" - host enters Card ID, system checks if valid bingo

**Files to modify:**
- `drizzle/schema.ts` - Add game sessions table if not exists
- `server/db.ts` - Add game/scoring queries
- `server/routers.ts` - Add scoring procedures
- `client/src/pages/HostDashboard.tsx` - Add scoring UI

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
**Effort:** 1-2 hours  
**Description:** Make "Welcome, Host!" clickable/editable so hosts can personalize their dashboard.

- [ ] Add `hostDisplayName` field to user preferences or local storage
- [ ] Make "Welcome, Host!" text clickable in DashboardLayout
- [ ] Show inline edit field or modal on click
- [ ] Save preference (localStorage for quick win, or DB for persistence)
- [ ] Display custom name instead of "Host"

**Files to modify:**
- `client/src/components/DashboardLayout.tsx` - Add click handler and edit UI
- Optional: `drizzle/schema.ts` - Add user preferences if persisting to DB

**Quick Implementation Option:**
```typescript
// In DashboardLayout.tsx
const [hostName, setHostName] = useState(
  localStorage.getItem('hostDisplayName') || 'Host'
);

const handleNameClick = () => {
  const newName = prompt('Enter your display name:', hostName);
  if (newName) {
    setHostName(newName);
    localStorage.setItem('hostDisplayName', newName);
  }
};
```

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
