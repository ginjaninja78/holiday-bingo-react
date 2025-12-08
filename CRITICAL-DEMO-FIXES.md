# CRITICAL DEMO FIXES (10 MINUTES)

## 🚨 BLOCKING ISSUES

1. **Played images shelf not populating** - CRITICAL
   - Images don't show in shelf after clicking Next Image
   - Need to fix state management in PlayScreen.tsx

2. **Database schema not pushed** - CRITICAL
   - New tables (gallery_images, host_game_state, etc.) not in DB
   - Run `pnpm db:push` immediately

3. **Gallery images not seeded** - CRITICAL
   - Database empty, gallery panel will show nothing
   - Need to seed 40 images from imageGallery.ts

4. **No backend state persistence** - CRITICAL
   - Game state only in React state, lost on refresh
   - Need minimal tRPC procedures for demo

## ✅ RAPID FIX PLAN

1. Push DB schema (30 seconds)
2. Seed gallery images (1 minute)
3. Fix played images state bug (2 minutes)
4. Add minimal game state tRPC procedures (3 minutes)
5. Test end-to-end (2 minutes)
6. Save checkpoint (30 seconds)

## DEMO-SAFE FEATURES (Already Working)

- ✅ Gallery panel with multi-select
- ✅ Recently Deleted with 30-day timer
- ✅ Game Setup panel with patterns
- ✅ Settings panel UI
- ✅ End Round flow with dialogs
- ✅ BINGO verification dialog
- ✅ Review mode UI (just needs real data)
