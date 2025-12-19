# 🎙️ AI Voice Announcer - Integration Guide

**Author:** Manus AI  
**Date:** December 19, 2025  
**Version:** 1.0

## 1. Overview

This document provides comprehensive instructions for integrating the modular **AI Voice Announcer** system into the Holiday Bingo application. The announcer is a standalone feature designed for easy integration and removal without affecting the core game functionality.

### 1.1. Key Features

- **Modular Architecture:** Standalone service with minimal integration points.
- **ElevenLabs Integration:** High-quality, realistic AI voice generation.
- **Cost Optimization:** Smart audio caching system reduces API calls by 80-95%.
- **Contextual Humor:** Session-aware humor engine provides dynamic, engaging commentary.
- **Professional Roasting:** Escalating humor for winners and host nudging.
- **Configurable:** Fully customizable via a dedicated control panel.
- **Easy Rollback:** Can be completely disabled or removed without breaking the game.

### 1.2. System Components

| Component                  | Description                                                                 |
| -------------------------- | --------------------------------------------------------------------------- |
| **Announcer Service**      | Main backend service for orchestration                                      |
| **ElevenLabs Client**      | Handles text-to-speech generation via ElevenLabs API                        |
| **Audio Cache**            | Filesystem and database caching for audio files                             |
| **Session Memory**         | In-memory and database tracking of game sessions, wins, and jokes           |
| **Humor Engine**           | Generates contextual humor based on game events                             |
| **tRPC API Router**        | Type-safe API endpoints for frontend communication                          |
| **`useAnnouncer` Hook**    | React hook for easy frontend integration                                    |
| **Control Panel UI**       | React component for managing all announcer settings                         |
| **Humor Seeding Script**   | Populates the database with observational humor for all gallery images      |

## 2. Backend Integration

Backend integration is already complete. The announcer system is automatically integrated with the main application via the tRPC router.

### 2.1. Database Setup

1. **Run the announcer migration script** to create the required database tables:

   ```bash
   pnpm tsx scripts/migrate-announcer.ts
   ```

2. **Seed the humor database** with quips for all gallery images:

   ```bash
   pnpm tsx scripts/seed-humor.ts
   ```

   This only needs to be done once. The script will populate the `announcer_image_quips` table with 3-5 jokes for each of the 160 gallery images.

### 2.2. Environment Variables

Add your **ElevenLabs API key** to the `.env` file:

```
ELEVENLABS_API_KEY="your_api_key_here"
```

If the API key is not provided, the announcer system will be disabled automatically.

## 3. Frontend Integration

Frontend integration involves adding the `AnnouncerControlPanel` to the host dashboard and using the `useAnnouncer` hook to trigger announcements.

### 3.1. Add Control Panel to Host Dashboard

Import and render the `AnnouncerControlPanel` component within the host dashboard UI (e.g., in a settings modal or a dedicated panel).

```tsx
// client/src/pages/HostDashboard.tsx (example)

import { AnnouncerControlPanel } from "../components/announcer/AnnouncerControlPanel";

function HostDashboard() {
  // ... existing code

  return (
    <div>
      {/* ... existing dashboard UI */}

      {/* Add the announcer control panel */}
      <div className="mt-8">
        <AnnouncerControlPanel />
      </div>
    </div>
  );
}
```

### 3.2. Trigger Announcements with `useAnnouncer` Hook

Use the `useAnnouncer` hook in your game logic components to trigger announcements at key moments.

**Example: Announcing a new card reveal**

```tsx
// client/src/components/game/GameBoard.tsx (example)

import { useAnnouncer } from "../../hooks/announcer/useAnnouncer";

function GameBoard({ gameSessionId }) {
  const { announceCard } = useAnnouncer(gameSessionId);

  const handleNewCard = (imageId: number) => {
    // ... existing logic

    // Announce the new card
    announceCard(imageId);
  };

  // ...
}
```

**Example: Announcing a winner**

```tsx
// client/src/components/game/WinnerModal.tsx (example)

import { useAnnouncer } from "../../hooks/announcer/useAnnouncer";

function WinnerModal({ winnerName, gameSessionId }) {
  const { announceWinner } = useAnnouncer(gameSessionId);

  useEffect(() => {
    // Announce the winner when the modal appears
    announceWinner(winnerName);
  }, [winnerName]);

  // ...
}
```

### 3.3. Session Management

Wrap your game session with `startSession` and `endSession` to enable contextual humor and tracking.

```tsx
// client/src/pages/HostDashboard.tsx (example)

import { useAnnouncer } from "../../hooks/announcer/useAnnouncer";

function HostDashboard() {
  const { startSession, endSession } = useAnnouncer();

  const handleStartGame = (sessionId: string) => {
    // ... existing logic

    // Start announcer session
    startSession(sessionId);
  };

  const handleEndGame = (sessionId: string) => {
    // ... existing logic

    // End announcer session
    endSession(sessionId);
  };

  // ...
}
```

## 4. Testing

A comprehensive testing plan is crucial to ensure the announcer system works as expected.

### 4.1. Backend Testing

1. **Run the health check endpoint** to verify all components are connected:

   ```bash
   curl http://localhost:3000/api/announcer/health
   ```

   Expected response:
   ```json
   {
     "success": true,
     "data": {
       "elevenlabsConnected": true,
       "settingsLoaded": true,
       "cacheWorking": true
     }
   }
   ```

2. **Test announcement generation** via the API (e.g., using Postman or `curl`):

   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"type":"intro"}' http://localhost:3000/api/announcer/announce
   ```

### 4.2. Frontend Testing

1. **Verify the control panel** renders correctly in the host dashboard.
2. **Test all toggles and sliders** and confirm settings are saved and applied.
3. **Test the humor level selector** and listen for changes in the announcement tone.
4. **Test the nudge delay** by waiting the specified time and listening for the nudge.
5. **Test the "Test Game Intro" and custom text buttons** and verify audio playback.
6. **Play a full game** and verify:
   - Game intro announcement plays.
   - Each card reveal is announced with humor.
   - Winner announcements are made with appropriate roasting.
   - Host nudges occur after delays.

### 4.3. Cache Testing

1. **Check the cache statistics** in the advanced settings panel.
2. **Generate an announcement** and verify the cache entry count increases.
3. **Generate the same announcement again** and verify the audio plays instantly from the cache (no network request).
4. **Clear the cache** and verify the entry count resets to zero.

## 5. Rollback Procedure

If any issues arise, the announcer system can be completely removed without affecting the core game.

1. **Remove the `AnnouncerControlPanel`** component from the host dashboard.
2. **Comment out all `useAnnouncer` hook calls** in the frontend code.
3. **Remove the `announcer` entry** from `server/routers.ts`.
4. **Restart the server.**

The application will now function as it did before the announcer integration.

## 6. Conclusion

This AI Voice Announcer system is a powerful, engaging, and modular addition to the Holiday Bingo game. By following this guide, you can seamlessly integrate, test, and manage this feature, providing a richer, more interactive experience for your players.
